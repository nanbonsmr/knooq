import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, dodo-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    console.log("Dodo webhook received:", JSON.stringify(body, null, 2));

    // Dodo uses "type" not "event_type"
    const eventType = body.type;
    const data = body.data;

    console.log("Processing event type:", eventType);

    switch (eventType) {
      case "subscription.created":
      case "subscription.active":
      case "subscription.renewed": {
        const metadata = data.metadata || {};
        const userId = metadata.user_id;

        if (!userId) {
          console.error("No user_id in metadata");
          return new Response(JSON.stringify({ error: "No user_id" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Determine plan type from payment frequency
        const planType = data.payment_frequency_interval === "Year" ? "yearly" : "monthly";

        const subscriptionData = {
          user_id: userId,
          paddle_subscription_id: data.subscription_id,
          paddle_customer_id: data.customer?.customer_id,
          status: "active" as const,
          plan_type: planType,
          current_period_start: data.previous_billing_date || data.created_at,
          current_period_end: data.next_billing_date || data.expires_at,
        };

        console.log("Upserting subscription:", subscriptionData);

        const { error } = await supabase.from("subscriptions").upsert(
          subscriptionData,
          { onConflict: "paddle_subscription_id" }
        );

        if (error) {
          console.error("Error creating subscription:", error);
          throw error;
        }
        console.log("Subscription created/updated for user:", userId);
        break;
      }

      case "subscription.updated": {
        const status = data.status === "active" ? "active" : 
                      data.status === "canceled" || data.status === "cancelled" ? "cancelled" : 
                      data.status === "past_due" ? "past_due" :
                      data.status === "paused" ? "paused" : "active";

        const { error } = await supabase
          .from("subscriptions")
          .update({
            status,
            current_period_start: data.previous_billing_date,
            current_period_end: data.next_billing_date,
          })
          .eq("paddle_subscription_id", data.subscription_id);

        if (error) {
          console.error("Error updating subscription:", error);
          throw error;
        }
        console.log("Subscription updated:", data.subscription_id);
        break;
      }

      case "subscription.cancelled":
      case "subscription.canceled": {
        const { error } = await supabase
          .from("subscriptions")
          .update({ status: "cancelled" })
          .eq("paddle_subscription_id", data.subscription_id);

        if (error) {
          console.error("Error cancelling subscription:", error);
          throw error;
        }
        console.log("Subscription cancelled:", data.subscription_id);
        break;
      }

      case "payment.succeeded": {
        // For subscription payments, also ensure subscription is active
        if (data.subscription_id) {
          const metadata = data.metadata || {};
          const userId = metadata.user_id;

          if (userId) {
            // Check if subscription exists, if not create it
            const { data: existingSub } = await supabase
              .from("subscriptions")
              .select("id")
              .eq("paddle_subscription_id", data.subscription_id)
              .maybeSingle();

            if (!existingSub) {
              console.log("Creating subscription from payment.succeeded event");
              const { error } = await supabase.from("subscriptions").insert({
                user_id: userId,
                paddle_subscription_id: data.subscription_id,
                paddle_customer_id: data.customer?.customer_id,
                status: "active",
                plan_type: "monthly", // Default, will be updated by subscription event
              });

              if (error) {
                console.error("Error creating subscription from payment:", error);
              } else {
                console.log("Subscription created from payment for user:", userId);
              }
            }
          }
        }
        console.log("Payment succeeded:", data.payment_id);
        break;
      }

      case "payment.failed": {
        console.log("Payment failed:", data.payment_id);
        break;
      }

      default:
        console.log("Unhandled event type:", eventType);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
