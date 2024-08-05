// pages/api/openai.js
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { prompt } = req.body;

      const response = await openai.createCompletion({
        model: "vi",
        prompt: prompt,
        max_tokens: 100,
        temperature: 0.7,
      });

      res.status(200).json({ result: response.data.choices[0].text });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
