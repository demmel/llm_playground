export default async function sendPrompt({ hfToken, messages }) {
  const prompt = messages.join("\n") + "\n";

  const response = await fetch(
    "https://api-inference.huggingface.co/models/bigscience/bloom",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${hfToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          top_k: 1,
          top_p: 1.0,
          temperature: 90.0,
          max_new_tokens: 128,
          repetition_penalty: 60.0,
          return_full_text: false,
        },
        options: {
          use_cache: false,
          wait_for_model: true,
        },
      }),
    }
  );

  return response
    .json()
    .then((response) => response[0].generated_text.slice(prompt.length));
}
