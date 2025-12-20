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
    const { priceId, userId, userEmail } = await req.json();
    const paddleApiKey = Deno.env.get("PADDLE_API_KEY");

    if (!paddleApiKey) {
      throw new Error("PADDLE_API_KEY is not configured");
    }

    if (!priceId || !userId) {
      throw new Error("priceId and userId are required");
    }

    console.log("Creating Paddle checkout for:", { priceId, userId, userEmail });

    // Create a transaction using Paddle API
    const response = await fetch("https://api.paddle.com/transactions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${paddleApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [{ price_id: priceId, quantity: 1 }],
        customer_email: userEmail,
        custom_data: { user_id: userId },
        checkout: {
          url: `${req.headers.get("origin") || "https://knooq.lovable.app"}/`,
        },
      }),
    });

    const data = await response.json();
    console.log("Paddle response:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error("Paddle API error:", data);
      throw new Error(data.error?.detail || "Failed to create checkout");
    }

    return new Response(JSON.stringify({ 
      checkoutUrl: data.data?.checkout?.url,
      transactionId: data.data?.id 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Create checkout error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
