export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    const { message } = req.body || {};

    if (!message) {
      return res.status(400).json({
        error: "No message received"
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured in Vercel"
      });
    }

    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
      apiKey;

    const response = await fetch(url, {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({

        contents: [
          {
            parts: [
              {
                text:
                  "You are Nexa AI, a helpful AI assistant. Answer clearly and naturally.\n\nUser: " +
                  message
              }
            ]
          }
        ]

      })

    });

    const data = await response.json();

    if (!response.ok) {

      return res.status(500).json({
        error: data?.error?.message || "Gemini API request failed"
      });

    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {

      return res.status(500).json({
        error: "Gemini returned no response"
      });

    }

    return res.status(200).json({
      reply: reply
    });

  } catch (error) {

    return res.status(500).json({
      error: error.message || "Server error"
    });

  }

}
