import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import serverless from "serverless-http";
import { audioPromptController, chatController, documentPromptController, imagePromptController, textPromptController } from './controllers/gemini.controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
const upload = multer({
  storage: multer.memoryStorage()
});

const app = express();

// initial backend
app.use(cors());
app.use(express.json());
// Serve React build
if (!process.env.VERCEl) {
  app.use(express.static(path.join(__dirname, "../client/build")));

  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build", "index.html"));
  });
}

app.post('/api/generate-text', textPromptController);
app.post('/api/chat', chatController);
app.post('/api/generate-from-image', upload.single('image'), imagePromptController);
app.post('/api/generate-from-document', upload.single('document'), documentPromptController);
app.post('/api/generate-from-audio', upload.single('audio'), audioPromptController);

const port = process.env.PORT || 4000;
app.listen(port);

export default app;
export const handler = serverless(app);