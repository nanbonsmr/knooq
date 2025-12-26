import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, subscriptionId } = await req.json();
    const dodoApiKey = Deno.env.get("DODO_PAYMENTS_API_KEY");

    if (!dodoApiKey) {
      throw new Error("DODO_PAYMENTS_API_KEY is not configured");
    }

    if (!subscriptionId) {
      throw new Error("subscriptionId is required");
    }

    console.log("Managing subscription:", { action, subscriptionId });

    // Determine if we're in test or live mode based on the API key
    const isTestMode = dodoApiKey.startsWith("sk_test_");
    const baseUrl = isTestMode 
      ? "https://test.dodopayments.com" 
      : "https://live.dodopayments.com";

    let endpoint = `${baseUrl}/subscriptions/${subscriptionId}`;
    let method = "PATCH";
    let body: any = {};

    switch (action) {
      case "cancel":
        // Dodo uses PATCH with status update to cancel
        body = { status: "cancelled" };
        method = "PATCH";
        break;
      case "pause":
        body = { status: "paused" };
        method = "PATCH";
        break;
      case "resume":
        body = { status: "active" };
        method = "PATCH";
        break;
      case "get":
        method = "GET";
        break;
      default:
        throw new Error("Invalid action");
    }

    console.log("Calling Dodo API:", { endpoint, method, body });

    const fetchOptions: RequestInit = {
      method,
      headers: {
        "Authorization": `Bearer ${dodoApiKey}`,
        "Content-Type": "application/json",
      },
    };

    if (method !== "GET" && Object.keys(body).length > 0) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(endpoint, fetchOptions);
    const data = await response.json();

    console.log("Dodo response:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error("Dodo API error:", data);
      
      // Handle NOT_FOUND error - subscription may have been created in test mode or already deleted
      if (data.code === "NOT_FOUND") {
        console.log("Subscription not found in Dodo - may be from test mode or already cancelled");
        // Return success for cancel action if subscription doesn't exist (already effectively cancelled)
        if (action === "cancel") {
          return new Response(JSON.stringify({ 
            success: true, 
            message: "Subscription cancelled",
            note: "Subscription was not found in payment system - it may have already been cancelled or was created in test mode"
          }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error("Subscription not found. It may have been created in test mode or already cancelled.");
      }
      
      throw new Error(data.message || data.error?.detail || "Failed to manage subscription");
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Manage subscription error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
