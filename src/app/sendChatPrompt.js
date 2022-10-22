export default async function sendPrompt({ hfToken, prompt }) {
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
          top_k: 50,
          top_p: 0.9,
          temperature: 0.9,
          max_new_tokens: 150,
          repetition_penalty: 60.0,
          do_sample: true,
          return_full_text: false,
        },
        options: {
          use_cache: false,
          wait_for_model: true,
        },
      }),
    }
  );

  return response.json().then((response) => {
    if (response.error != null) {
      throw new Error(response.error);
    }
    return response[0].generated_text.slice(prompt.length);
  });
}
