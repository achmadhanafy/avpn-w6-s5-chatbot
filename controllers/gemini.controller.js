import { createPartFromUri, createUserContent, GoogleGenAI } from '@google/genai'
import Config from 'dotenv/config'
import multer from 'multer'
import fs from 'fs'


const upload = multer();
const ai = new GoogleGenAI({ apiKey: Config.GEMINI_API_KEY });

// inisial AI Model
const geminiModels = {
    text: 'gemini-2.5-flash-lite',
    image: 'gemini-2.5-flash',
    audio: 'gemini-2.5-flash',
    document: 'gemini-2.5-flash-lite'
}

const textPromptController = async (req, res) => {
    try {
        const { message } = req?.body || {}
        // Negative cases
        if (!req?.body) {
            res.status(400).json({ message: "Payload shouldn't be empty" })
            return;
        }
        if (typeof message !== 'string') {
            res.status(400).json({ message: "message at body should be a string" })
            return
        }

        const response = await ai.models.generateContent({
            contents: message,
            model: geminiModels.text
        });

        res.status(200).json({
            reply: response.text
        })
    } catch (error) {
        console.log("Error at textPromptController", error)
        res.status(500).json({ message: "Server Error" })
    }
}

const imagePromptController = async (req, res) => {
    try {
        const { body, file } = req || {}
        const { message } = body || {};

        // Negative cases
        if (!body) {
            res.status(400).json({ message: "Payload shouldn't be empty" })
            return;
        }
        if (typeof message !== 'string') {
            res.status(400).json({ message: "message at body should be a string" })
            return
        }
        // Check File Image Exist
        if (!file) {
            res.status(400).json({ message: "image file is required" });
            return;
        }
        // Check File type is Image
        if (!file.mimetype.startsWith('image/')) {
            res.status(400).json({ message: "Uploaded file must be an image" });
            return;
        }


        // Read Image
        const image = await ai.files.upload({
            file: file.path,
            config: {
                mimeType: file.mimetype
            }
        });

        // Put into prompt
        const result = await ai.models.generateContent({
            model: geminiModels.image,
            contents: [
                createUserContent([
                    message,
                    createPartFromUri(image.uri, image.mimeType)
                ]),
            ],
        });


        res.status(200).json({ reply: result.text });
    } catch (error) {
        console.error("Error at imagePromptController:", error);
        res.status(500).json({ error: "Server Error" });
    } finally {
        fs.unlinkSync(req.file.path);
    }
}

const documentPromptController = async (req, res) => {
    try {
        const { body, file } = req || {}
        const { message } = body || {};

        // Negative cases
        if (!body) {
            res.status(400).json({ message: "Payload shouldn't be empty" })
            return;
        }
        if (typeof message !== 'string') {
            res.status(400).json({ message: "message at body should be a string" })
            return
        }
        // Check File Exist
        if (!file) {
            res.status(400).json({ message: "document file is required" });
            return;
        }

        const buffer = fs.readFileSync(file.path);
        const base64Data = buffer.toString('base64');
        const mimeType = file?.mimetype;

        const documentPart = {
            inlineData: { data: base64Data, mimeType }
        };

        const result = await ai.models.generateContent({
            model: geminiModels.document,
            contents: [
                createUserContent([
                    message,
                    documentPart
                ]),
            ],
        });

        res.json({ reply: result.text });
    } catch (error) {
        console.error("Error generating content:", error);
        res.status(500).json({
            error: "Server Error"
        });
    } finally {
        fs.unlinkSync(req.file.path);
    }
}

const audioPromptController = async (req, res) => {
    try {
        const { body, file } = req || {}
        const { message } = body || {};

        // Negative cases
        if (!body) {
            res.status(400).json({ message: "Payload shouldn't be empty" })
            return;
        }
        if (typeof message !== 'string') {
            res.status(400).json({ message: "message at body should be a string" })
            return
        }
        // Check File Exist
        if (!file) {
            res.status(400).json({ message: "audio file is required" });
            return;
        }

        const audioBuffer = fs.readFileSync(file.path);
        const base64Audio = audioBuffer.toString('base64');
        const mimeType = file.mimetype;

        const audioPart = {
            inlineData: { data: base64Audio, mimeType }
        };

        const result = await ai.models.generateContent({
            model: geminiModels.audio,
            contents: [
                createUserContent([
                    message,
                    audioPart
                ]),
            ],
        });

        res.json({ reply: result.text });
    } catch (error) {
        console.error("Error generating content:", error);
        res.status(500).json({ error: "Server Error" });
    } finally {
        fs.unlinkSync(req.file.path);
    }
}

export {
    textPromptController,
    imagePromptController,
    documentPromptController,
    audioPromptController
}