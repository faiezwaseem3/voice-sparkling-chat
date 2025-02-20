import axios from 'axios';
import fs from 'fs';


export async function textToAudio(text, chunkSize = 200, outputFile = 'output.mp3') {
    const chunks = chunkString(text, chunkSize);
    const audioBuffers = [];

    for (const chunk of chunks) {
        const encodedChunk = encodeURIComponent(chunk);
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodedChunk}`;
        const response = await axios.get(url, {
            responseType: "arraybuffer",
            headers: {
                Referer: "http://translate.google.com/",
                "User-Agent": "stagefright/1.2 (Linux;Android 5.0)",
            },
        });

        audioBuffers.push(Buffer.from(response.data));
    }

    // Concatenate all audio buffers into one
    const combinedBuffer = Buffer.concat(audioBuffers);



    // Save the combined buffer to an MP3 file
    fs.writeFileSync("./public/"+outputFile, combinedBuffer);

    console.log(`Audio file saved to ${outputFile}`);
    return outputFile;
}

export async function textToSpeech(modelName = "elevenlabs" | "myshell-tts" | "deepinfra-tts" | "whisper-large-v3" | "distil-large-v3", inputText, personality = 'will', apiKey) {

    const validPersonalities = [
        'will', 'maltida', 'liam', 'jessica', 'george', 'lily', 'sana',
        'Wahab', 'martin', 'darine', 'guillaume', 'leoni', 'kurt', 'leo',
        'shakuntala', 'maciej', 'aneta', 'gabriela', 'juan'
    ];
    if (personality && !validPersonalities.includes(personality)) {
        throw new Error(`Invalid personality. Please choose from the following: ${validPersonalities.join(', ')}`);
    }

    const url = 'https://api.electronhub.top/v1/audio/speech';
    const headers = {
        Authorization: `Bearer ${apiKey}`,
    };
    const data = {
        model: modelName,
        voice: personality,
        input: inputText,
    };

    const response = await axios.post(url, data, {
        headers,
        responseType: 'arraybuffer',
    });

    const audioBuffer = response.data;

    const filename = `${Math.floor(Math.random() * 10000)}.mp3`
    // Save the audio buffer to an MP3 file
    const filePath = `./public/${filename}`; // adjust the file path and name as needed
    fs.writeFileSync(filePath, audioBuffer);

    console.log(`Audio file saved to ${filePath}`);
    return filename
}

function chunkString(str, length) {
    return str.match(new RegExp(`.{1,${length}}`, 'g')) || [];
}

const msg = "Hello I am William , A dispatchpro dispatcher how may i help you ?";


// textToAudio(msg, 200, 3000, "chat_id");
// textToSpeech("elevenlabs",msg , "shakuntala", process.env.ELECTRON_HUB)
