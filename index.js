import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { audioPromptController, chatController, documentPromptController, imagePromptController, textPromptController } from './controllers/gemini.controller.js';

dotenv.config();
const upload = multer({
  dest: 'uploads/'
});

const app = express();

// initial backend
app.use(cors());
app.use(express.json());
app.use(express.static('client/build'));

app.post('/api/generate-text', textPromptController);
app.post('/api/chat', chatController);
app.post('/api/generate-from-image', upload.single('image'), imagePromptController);
app.post('/api/generate-from-document', upload.single('document'), documentPromptController);
app.post('/api/generate-from-audio', upload.single('audio'), audioPromptController);

const port = process.env.PORT || 4000;
app.listen(port);