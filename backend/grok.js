import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API });



async function sendMessage(messages) {
  

  const chat_completion = await groq.chat.completions.create({
    messages,
    model: "gemma2-9b-it",
    temperature: 0,
    stream: false,
  });
  return chat_completion.choices[0].message.content
}


export {
    sendMessage
}