import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: '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' });



async function sendMessage(messages) {
  

  const chat_completion = await groq.chat.completions.create({
    messages,
    model: "llama3-70b-8192",
    temperature: 0,
    stream: false,
  });
  return chat_completion.choices[0].message.content
}


export {
    sendMessage
}