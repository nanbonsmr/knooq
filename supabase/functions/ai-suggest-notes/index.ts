import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { highlightedText, articleTitle, articleContent, existingNotes } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!highlightedText) {
      throw new Error("Highlighted text is required");
    }

    console.log(`Generating note suggestions for: "${highlightedText.slice(0, 50)}..."`);

    const existingNotesContext = existingNotes?.length 
      ? `\n\nUser's existing notes on this article:\n${existingNotes.map((n: any) => `- ${n.content}`).join('\n')}`
      : '';

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a helpful study assistant that suggests insightful notes for highlighted text. Generate 2-3 different note suggestions that:
- Add value beyond just restating the text
- Include connections to broader concepts
- Suggest questions to explore further
- Highlight key takeaways or implications
- Are concise but meaningful

Return your response as a JSON array of objects with 'content' and 'tags' fields.
Example: [{"content": "Note content here", "tags": ["concept", "history"]}]`
          },
          {
            role: "user",
            content: `Article: "${articleTitle}"

Highlighted text: "${highlightedText}"

Article context: ${articleContent?.slice(0, 3000) || 'Not available'}${existingNotesContext}

Generate 2-3 smart note suggestions for this highlight.`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_notes",
              description: "Return note suggestions for the highlighted text",
              parameters: {
                type: "object",
                properties: {
                  suggestions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        content: { type: "string", description: "The note content" },
                        tags: { 
                          type: "array", 
                          items: { type: "string" },
                          description: "Relevant tags for the note"
                        }
                      },
                      required: ["content", "tags"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["suggestions"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "suggest_notes" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    
    // Parse tool call response
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let suggestions = [];
    
    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        suggestions = parsed.suggestions || [];
      } catch (e) {
        console.error("Failed to parse tool response:", e);
      }
    }

    console.log(`Generated ${suggestions.length} note suggestions`);

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in ai-suggest-notes:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
