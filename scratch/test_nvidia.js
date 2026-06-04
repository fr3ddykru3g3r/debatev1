const { OpenAI } = require('openai');

const apiKey = process.env.NVIDIA_API_KEY;
if (!apiKey) {
  console.error("No NVIDIA_API_KEY found.");
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

async function main() {
  try {
    console.log("Calling NVIDIA NIM API...");
    const response = await openai.chat.completions.create({
      model: 'meta/llama-3.1-8b-instruct',
      messages: [{ role: 'user', content: 'Say hello in one word' }],
      max_tokens: 10,
    });
    console.log("Success! Output:", response.choices[0].message.content);
  } catch (error) {
    console.error("Error calling NVIDIA NIM API:", error.message);
  }
}

main();
