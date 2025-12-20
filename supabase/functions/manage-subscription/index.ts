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
    const paddleApiKey = Deno.env.get("PADDLE_API_KEY");

    if (!paddleApiKey) {
      throw new Error("PADDLE_API_KEY is not configured");
    }

    if (!subscriptionId) {
      throw new Error("subscriptionId is required");
    }

    console.log("Managing subscription:", { action, subscriptionId });

    let endpoint = `https://api.paddle.com/subscriptions/${subscriptionId}`;
    let method = "PATCH";
    let body: any = {};

    switch (action) {
      case "cancel":
        body = { effective_from: "next_billing_period" };
        endpoint = `${endpoint}/cancel`;
        method = "POST";
        break;
      case "pause":
        body = { effective_from: "next_billing_period" };
        endpoint = `${endpoint}/pause`;
        method = "POST";
        break;
      case "resume":
        endpoint = `${endpoint}/resume`;
        method = "POST";
        break;
      case "get":
        method = "GET";
        break;
      default:
        throw new Error("Invalid action");
    }

    const fetchOptions: RequestInit = {
      method,
      headers: {
        "Authorization": `Bearer ${paddleApiKey}`,
        "Content-Type": "application/json",
      },
    };

    if (method !== "GET" && Object.keys(body).length > 0) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(endpoint, fetchOptions);
    const data = await response.json();

    console.log("Paddle response:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error("Paddle API error:", data);
      throw new Error(data.error?.detail || "Failed to manage subscription");
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
