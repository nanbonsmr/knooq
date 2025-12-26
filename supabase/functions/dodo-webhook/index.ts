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

    const eventType = body.event_type;
    const data = body.data;

    switch (eventType) {
      case "subscription.created":
      case "subscription.active": {
        const metadata = data.metadata || {};
        const userId = metadata.user_id;

        if (!userId) {
          console.error("No user_id in metadata");
          return new Response(JSON.stringify({ error: "No user_id" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { error } = await supabase.from("subscriptions").upsert({
          user_id: userId,
          paddle_subscription_id: data.subscription_id, // Reusing column for Dodo subscription ID
          paddle_customer_id: data.customer?.customer_id, // Reusing column for Dodo customer ID
          status: "active",
          plan_type: data.billing_interval === "year" ? "yearly" : "monthly",
          current_period_start: data.current_period_start,
          current_period_end: data.current_period_end,
        }, { onConflict: "paddle_subscription_id" });

        if (error) {
          console.error("Error creating subscription:", error);
          throw error;
        }
        console.log("Subscription created for user:", userId);
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
            current_period_start: data.current_period_start,
            current_period_end: data.current_period_end,
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
        // Handle one-time payments or subscription payments
        console.log("Payment succeeded:", data.payment_id);
        break;
      }

      case "payment.failed": {
        console.log("Payment failed:", data.payment_id);
        // Could update subscription status to past_due if needed
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
