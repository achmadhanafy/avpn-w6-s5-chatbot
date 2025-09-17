import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { audioPromptController, documentPromptController, imagePromptController, textPromptController } from './controllers/gemini.controller.js';

dotenv.config();
const upload = multer({
  dest: 'uploads/'
});

const app = express();

// initial backend
app.use(cors());
app.use(express.json());

app.post('/generate-text', textPromptController);
app.post('/generate-from-image', upload.single('image'), imagePromptController);
app.post('/generate-from-document', upload.single('document'), documentPromptController);
app.post('/generate-from-audio', upload.single('audio'), audioPromptController);

const port = process.env.PORT || 3000;
app.listen(port);