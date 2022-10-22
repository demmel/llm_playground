export default async function sendPrompt({ hfToken, prompt }) {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
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
          min_length: 256,
          max_length: 512,
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
    return response[0].summary_text;
  });
}
