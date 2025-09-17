# 🚀 How to run development
```bash
yarn install && yarn dev
```

# 🚀 API Usage with cURL

This project provides multiple endpoints to generate responses from different input types (text, image, document, audio). Below are example `cURL` commands you can use to test the APIs.

---

## 📖 Endpoints

### 1. Generate from **Text**
```bash
curl --location 'http://localhost:3000/generate-text' \
--header 'Content-Type: application/json' \
--data '{
  "message": "Hallo Gemini"
}'
```

### 2. Generate from **Image**
```bash
curl --location 'http://localhost:3000/generate-from-image' \
--form 'message="Who is own this certificate ? "' \
--form 'image=@"/Users/achmadhanafy/Desktop/Screenshot 2025-09-17 at 13.11.55.png"'
```

### 3. Generate from **Document**
```bash
curl --location 'http://localhost:3000/generate-from-document' \
--form 'message="Give summary from CV"' \
--form 'document=@"/Users/achmadhanafy/Downloads/Minimalist White and Grey Professional Resume.pdf"'
```

### 4. Generate from **Audio** 
```bash
curl --location 'http://localhost:3000/generate-from-audio' \
--form 'message="What is speaker said ?"' \
--form 'audio=@"/Users/achmadhanafy/Desktop/test.m4a"'
```