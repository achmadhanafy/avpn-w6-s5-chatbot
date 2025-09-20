# 🚀 How to run development

Create .env file in root of project
Can refer to .env.example

By default client recognize PORT 4000 to integrate with express server in development, if want to change it need to change in .env and client/src/lib/services/chatApi.js to change the PORT same with .env

run command:
```bash
npm install && npm dev
```

# 🚀 API Usage with cURL

This project provides multiple endpoints to generate responses from different input types (text, image, document, audio). Below are example `cURL` commands you can use to test the APIs.

---

## 📖 Endpoints

### 1. Generate from **Text**
```bash
curl --location 'http://localhost:4000/api/generate-text' \
--header 'Content-Type: application/json' \
--data '{
  "message": "Hallo Gemini"
}'
```

### 2. Generate from **Image**
```bash
curl --location 'http://localhost:4000/api/generate-from-image' \
--form 'message="Who is own this certificate ? "' \
--form 'image=@"/Users/achmadhanafy/Desktop/Screenshot 2025-09-17 at 13.11.55.png"'
```

### 3. Generate from **Document**
```bash
curl --location 'http://localhost:4000/api/generate-from-document' \
--form 'message="Give summary from CV"' \
--form 'document=@"/Users/achmadhanafy/Downloads/Minimalist White and Grey Professional Resume.pdf"'
```

### 4. Generate from **Audio** 
```bash
curl --location 'http://localhost:4000/api/generate-from-audio' \
--form 'message="What is speaker said ?"' \
--form 'audio=@"/Users/achmadhanafy/Desktop/test.m4a"'
```

### 5. Generate Multi Turn Conversation
```bash
curl --location 'http://localhost:4000/api/chat' \
--header 'Content-Type: application/json' \
--data '{
    "conversation": [
        {
            "role": "user",
            "message": "Siapa anda, dan prediksi cuaca di jakarta hari ini"
        }
    ],
    "isNewSession": true
}'
````