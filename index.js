import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { imagePromptController, textPromptController } from './controllers/gemini.controller.js';

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

const port = process.env.PORT || 3000;
app.listen(port);