export default async function handler(req, res) {

  if (req.method !== "POST") {

    return res.status(405).json({
      error: "Method not allowed"
    });

  }


  try {

    const {
      message,
      image,
      mimeType
    } = req.body || {};


    if (
      (!message || !message.trim()) &&
      !image
    ) {

      return res.status(400).json({
        error:
          "Message or image is required"
      });

    }


    const apiKey =
      process.env.GEMINI_API_KEY;


    if (!apiKey) {

      return res.status(500).json({
        error:
          "GEMINI_API_KEY is missing in Vercel"
      });

    }


    const prompt = `
You are Avenqor AI.

You were created and are owned by Bilal.

Your name is Avenqor AI.

You are powered by Google Gemini.

Identity rules:

- If asked who you are,
  say you are Avenqor AI.

- If asked who created you,
  say Bilal created you.

- If asked who owns you,
  say Bilal is your creator and owner.

- Never claim Google created Avenqor AI.

Be helpful, friendly,
accurate and concise.

You can help with:

- General questions
- Education
- Coding
- Mathematics
- Science
- Writing
- Image understanding

If the user speaks Sinhala,
reply in Sinhala unless
another language is requested.

User message:

${message || "Please analyze the uploaded image."}
`;


    const input = [

      {
        type: "text",
        text: prompt
      }

    ];


    if (image) {

      input.push({

        type: "image",

        data: image,

        mime_type:
          mimeType || "image/jpeg"

      });

    }


    const response =
      await fetch(
        "https://generativelanguage.googleapis.com/v1beta/interactions",
        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

            "x-goog-api-key":
              apiKey

          },

          body:
            JSON.stringify({

              model:
                "gemini-3.6-flash",

              input:
                input

            })

        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      return res.status(
        response.status
      ).json({

        error:
          data?.error?.message ||
          "Gemini API error"

      });

    }


    let reply =
      data?.output_text;


    if (
      !reply &&
      Array.isArray(data?.steps)
    ) {

      reply =
        data.steps

          .flatMap(
            step =>
              step?.content || []
          )

          .filter(
            item =>
              item?.type === "text"
          )

          .map(
            item =>
              item.text
          )

          .join("\n");

    }


    if (!reply) {

      return res.status(500).json({

        error:
          "Avenqor AI returned an empty response"

      });

    }


    return res.status(200).json({

      reply:
        reply.trim()

    });


  } catch (error) {

    console.error(
      "Avenqor AI Error:",
      error
    );


    return res.status(500).json({

      error:
        error.message ||
        "Server error"

    });

  }

}
