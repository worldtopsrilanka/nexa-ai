export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { message } = req.body || {};

    // Check message
    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Message is required"
      });
    }

    // Get Gemini API key from Vercel
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is missing in Vercel"
      });
    }

    // Nexa AI personality / identity
    const prompt = `
You are Nexa AI, an AI assistant created by Bilal.

Your name is Nexa AI.

Important identity rules:
- If someone asks "Who are you?", say that you are Nexa AI.
- If someone asks who created you, say that you were created by Bilal.
- If someone asks who owns Nexa AI, say that Bilal is the creator and owner of Nexa AI.
- You are powered by Google Gemini.
- Never claim that Google created Nexa AI.
- Google Gemini is only the AI technology powering Nexa AI.
- Be helpful, friendly, accurate and concise.
- You can answer questions, explain lessons, help with coding, writing, mathematics, science and general topics.
- If the user speaks Sinhala, reply in Sinhala unless they ask for another language.

User message:
${message}
`;

    // Gemini Interactions API
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/interactions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },

        body: JSON.stringify({
          model: "gemini-3.6-flash",
          input: prompt
        })
      }
    );

    const data = await response.json();

    // Gemini API error
    if (!response.ok) {
      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "Gemini API error",
        debug: data
      });
    }

    // Get AI response
    let reply = data?.output_text;

    // Backup response extraction
    if (!reply && Array.isArray(data?.steps)) {
      reply = data.steps
        .flatMap(step => step?.content || [])
        .filter(item => item?.type === "text")
        .map(item => item.text)
        .join("\n");
    }

    // Empty response
    if (!reply) {
      return res.status(500).json({
        error: "Nexa AI returned an empty response",
        debug: data
      });
    }

    // Send response to website
    return res.status(200).json({
      reply: reply.trim()
    });

  } catch (error) {
    console.error("Nexa AI Error:", error);

    return res.status(500).json({
      error: error.message || "Server error"
    });
  }
}
