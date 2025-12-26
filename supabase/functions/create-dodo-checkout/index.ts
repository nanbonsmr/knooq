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
    const { productId, userId, userEmail } = await req.json();
    const dodoApiKey = Deno.env.get("DODO_PAYMENTS_API_KEY");

    if (!dodoApiKey) {
      throw new Error("DODO_PAYMENTS_API_KEY is not configured");
    }

    if (!productId || !userId) {
      throw new Error("productId and userId are required");
    }

    // Use test mode - user confirmed they are in test mode
    // Dodo test keys may have various prefixes, so we use test endpoint
    const baseUrl = "https://test.dodopayments.com";

    console.log("Creating Dodo checkout for:", { productId, userId, userEmail, baseUrl });

    const origin = req.headers.get("origin") || "https://knooq.lovable.app";

    // Create a checkout session using Dodo Payments API - endpoint is /checkouts
    const response = await fetch(`${baseUrl}/checkouts`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${dodoApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_cart: [{ product_id: productId, quantity: 1 }],
        customer: {
          email: userEmail,
        },
        metadata: {
          user_id: userId,
        },
        return_url: `${origin}/?checkout=success`,
      }),
    });

    // Get response as text first to handle empty responses
    const responseText = await response.text();
    console.log("Dodo response status:", response.status);
    console.log("Dodo response text:", responseText);

    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      throw new Error(`Invalid response from Dodo: ${responseText}`);
    }

    if (!response.ok) {
      console.error("Dodo API error:", data);
      throw new Error(data.message || data.error?.message || "Failed to create checkout");
    }

    return new Response(JSON.stringify({ 
      checkoutUrl: data.checkout_url,
      sessionId: data.session_id 
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
