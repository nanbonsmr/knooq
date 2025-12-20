import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, paddle-signature",
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
    console.log("Paddle webhook received:", JSON.stringify(body, null, 2));

    const eventType = body.event_type;
    const data = body.data;

    switch (eventType) {
      case "subscription.created":
      case "subscription.activated": {
        const customData = data.custom_data || {};
        const userId = customData.user_id;

        if (!userId) {
          console.error("No user_id in custom_data");
          return new Response(JSON.stringify({ error: "No user_id" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { error } = await supabase.from("subscriptions").upsert({
          user_id: userId,
          paddle_subscription_id: data.id,
          paddle_customer_id: data.customer_id,
          status: "active",
          plan_type: data.items?.[0]?.price?.billing_cycle?.interval === "year" ? "yearly" : "monthly",
          current_period_start: data.current_billing_period?.starts_at,
          current_period_end: data.current_billing_period?.ends_at,
        }, { onConflict: "paddle_subscription_id" });

        if (error) {
          console.error("Error creating subscription:", error);
          throw error;
        }
        console.log("Subscription created for user:", userId);
        break;
      }

      case "subscription.updated": {
        const { error } = await supabase
          .from("subscriptions")
          .update({
            status: data.status === "active" ? "active" : 
                    data.status === "canceled" ? "cancelled" : 
                    data.status === "past_due" ? "past_due" :
                    data.status === "paused" ? "paused" : "active",
            current_period_start: data.current_billing_period?.starts_at,
            current_period_end: data.current_billing_period?.ends_at,
          })
          .eq("paddle_subscription_id", data.id);

        if (error) {
          console.error("Error updating subscription:", error);
          throw error;
        }
        console.log("Subscription updated:", data.id);
        break;
      }

      case "subscription.canceled": {
        const { error } = await supabase
          .from("subscriptions")
          .update({ status: "cancelled" })
          .eq("paddle_subscription_id", data.id);

        if (error) {
          console.error("Error cancelling subscription:", error);
          throw error;
        }
        console.log("Subscription cancelled:", data.id);
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
