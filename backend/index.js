import express from 'express'
import { sendMessage } from './grok.js';
import { textToAudio } from './text-to-speech.js';

const app = express();
const port = 3500;

let messages = [
    {
        role: "system",
        content: `You are A HelpFull Assitant.`,
    }
];

app.use(express.json());
app.use(express.urlencoded({ extended : true}))

app.post('/messages', async (req, res) => {
    const { message } = req.body;

    if(!message) return res.send("Please ENter a message")
    
    messages.push({
        role: "user",
        content: message+ ". Please Answer Presice in less lines.",
    },);

    const result= await sendMessage(messages)

   const filename = await textToAudio(result , 200 , `${Math.round(Math.random() + 1) * 1000}`)

    res.json({
        text : result,
        audio : filename
    })
});

app.get('/messages', (req, res) => {
    res.send(messages);
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});