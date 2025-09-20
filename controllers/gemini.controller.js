import { createPartFromUri, createUserContent, GoogleGenAI } from '@google/genai'
import Config from 'dotenv/config'
import multer from 'multer'
import fs from 'fs'
import { randomUUID } from 'crypto'

const generalError = 'Sorry an error occured, please contact customer support'
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

async function getSessionTitleIfNeeded(conversation) {
    conversation = [...conversation, {
        role: "user",
        parts: [{text: "Create a short descriptive title for this conversation in language based language in coversation"}]
    }]
    try {
        const res = await ai.models.generateContent({
            model: geminiModels.text,
            contents: conversation,
            config: {
                systemInstruction: "Short description must be (≤6 words)"
            }
        });
        return res.text
    } catch (error) {
        throw (error)
    }
}


const chatController = async (req, res) => {
    try {
        const { conversation, isNewSession } = req.body;

        // Negative cases
        if (!conversation || !Array.isArray(conversation)) { // Check conversation value is correct
            return res.status(400).json({
                success: false,
                data: null,
                message: generalError,
                detail: 'conversation at body should be array'
            });
        }

        let dataInValidMessage = ""
        conversation.forEach(item => { // Check items in conversation is correct
            if (!item) {
                dataInValidMessage = "conversation at body can't be empty"
            } else if (!item.role || !item.message) {
                dataInValidMessage = "coversation at body should be array of object with role and message property"
            }
        });
        if (dataInValidMessage?.length) { // Throw error if any error
            return res.status(400).json({
                success: false,
                data: null,
                message: generalError,
                detail: dataInValidMessage
            });
        }

        // Mapping
        let contents = conversation.map(item => {
            return {
                role: item.role,
                parts: [
                    { text: item.message }
                ]
            }
        });

        const aiResponse = await ai.models.generateContent({
            model: geminiModels.text,
            contents,
            config: {
                systemInstruction: `
                You are Sagara AI, a helpful and knowledgeable assistant.
                Always respond in a professional, clear, and concise manner.
                Refer to yourself as "Sagara AI" when needed, develop by Achmad Hanafy.
                Stay friendly, solution-oriented, and explain step by step when useful.
    `
            }
        });

        let sessionTitle
        if (isNewSession && aiResponse?.text) {
            sessionTitle = await getSessionTitleIfNeeded([...contents, {
                role: "model",
                parts: [
                    { text: aiResponse.text }
                ]
            }])
        }

        return res.status(200).json({
            success: true,
            data: aiResponse.text,
            sessionTitle: sessionTitle,
            message: "success"
        });

    } catch (error) {
        // This `catch` block will be triggered by express-async-errors
        if (error?.status) {
            if (error.status === 429) {
                // Handle rate limit errors
                return res.status(429).json({ success: false, data: null, message: 'You have exceeded the rate limit. Please try again later.', detail: error?.message });
            }
            if (error.status === 400) {
                // Handle malformed requests or safety issues
                const firstCandidate = error?.response?.candidates?.[0];
                const safetyReason = firstCandidate?.finishReason;
                const safetyRatings = firstCandidate?.safetyRatings;

                if (safetyReason === 'SAFETY') {
                    return res.status(400).json({
                        success: false,
                        data: null,
                        message: 'The content was blocked due to safety concerns.',
                        detail: safetyRatings
                    });
                }
                return res.status(400).json({
                    success: false,
                    data: null,
                    message: generalError,
                    detail: error?.message
                });
            }

            // Handle other API errors
            return res.status(error.status || 500).json({ success: false, data: null, message: generalError, detail: error.message });
        }

        // Handle all other unexpected errors
        console.error('An unexpected error occurred:', error);
        res.status(500).json({ success: false, data: null, message: generalError, details: error.message });
    }
}

export {
    textPromptController,
    imagePromptController,
    documentPromptController,
    audioPromptController,
    chatController
}