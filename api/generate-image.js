export default async function handler(req, res) {

  if (req.method !== "POST") {

    return res.status(405).json({
      error: "Method not allowed"
    });

  }


  try {

    const {
      prompt
    } = req.body || {};


    if (!prompt) {

      return res.status(400).json({
        error:
          "Image prompt is required"
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
                "gemini-3.1-flash-image",

              input: [

                {

                  type: "text",

                  text:
                    `Generate an image based on this request:

${prompt}`

                }

              ]

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
          "Image generation failed"

      });

    }


    return res.status(200).json({

      data:data

    });


  } catch (error) {

    return res.status(500).json({

      error:
        error.message ||
        "Server error"

    });

  }

}
