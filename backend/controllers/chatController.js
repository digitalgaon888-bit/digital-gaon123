const { GoogleGenerativeAI } = require("@google/generative-ai");

// Helper function for exponential backoff / retries
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const chatController = {
  sendMessage: async (req, res) => {
    try {
      const { message, image, history } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // MULTI-KEY LOAD BALANCER LOGIC
      // 1. Collect all available keys (single key and comma-separated list)
      const singleKey = process.env.GEMINI_API_KEY;
      const multiKeys = process.env.GEMINI_API_KEYS ? 
        process.env.GEMINI_API_KEYS.split(',').map(k => k.trim()).filter(k => k !== "") : [];
      
      // 2. Create a unique key pool
      const keyPool = Array.from(new Set([singleKey, ...multiKeys])).filter(k => k && k.length > 5);

      if (keyPool.length === 0) {
        return res.status(200).json({ 
          reply: "Namaste! 🙏 Abhi chatbot mein koi bhi 'API Key' set nahi hui hai. Please .env file ya environment variables check karein." 
        });
      }

      console.log(`--- KEY POOL SIZE: ${keyPool.length} ---`);

      let streamStarted = false;
      let lastErrorMessage = "";
      const MAX_RETRIES_PER_KEY = 2; // Try each key twice if it hits demand issues
      const MAX_TOTAL_ATTEMPTS = Math.min(keyPool.length * 2, 6); // Max overall attempts to avoid infinite loops

      const systemInstruction = `YOU ARE 'GAON AI', A WORLD-CLASS ARTIFICIAL INTELLIGENCE ASSISTANT.
      DEVELPER: Digital Gaon team.
      CORE PERSONALITY: Expert, intellectual, and professional.
      LANGUAGE: Respond in the user's language (Hindi/English/Hinglish).`;

      // Gemini history MUST start with 'user' role
      let formattedHistory = (history || []).map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const firstUserIndex = formattedHistory.findIndex(m => m.role === 'user');
      if (firstUserIndex !== -1) {
        formattedHistory = formattedHistory.slice(firstUserIndex);
      } else {
        formattedHistory = [];
      }

      const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-pro"];

      // Start attempting with keys from the pool
      let totalAttempts = 0;
      
      // We will try to get a response by rotating through the key pool
      for (let i = 0; i < MAX_TOTAL_ATTEMPTS; i++) {
        // Randomly pick a key or rotate through them
        const apiKey = keyPool[i % keyPool.length]; 
        const modelName = modelsToTry[0]; // Primary target: 2.5-flash

        try {
          console.log(`--- ATTEMPT ${i + 1} USING KEY: ${apiKey.substring(0, 8)}... AND MODEL: ${modelName} ---`);
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ 
            model: modelName,
            systemInstruction: systemInstruction 
          });

          const chat = model.startChat({ history: formattedHistory });

          let promptContent = [message];
          if (image && image.data && image.mimeType) {
            promptContent.push({
              inlineData: { data: image.data, mimeType: image.mimeType }
            });
          }

          const result = await chat.sendMessageStream(promptContent);
          
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.setHeader('Transfer-Encoding', 'chunked');

          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            res.write(chunkText);
            streamStarted = true;
          }
          
          res.end();
          console.log(`--- SUCCESS WITH KEY ${apiKey.substring(0, 8)} ---`);
          return;

        } catch (error) {
          lastErrorMessage = error.message;
          console.warn(`--- KEY ${apiKey.substring(0, 8)} FAILED --- Reason:`, error.message);

          if (streamStarted) {
            res.end();
            return;
          }

          // If it's a critical error (like wrong key), we might want to skip it, 
          // but for 429/503 we definitely want to try the NEXT key in the pool immediately.
          const shouldTryNextKey = error.message.includes("503") || 
                                 error.message.includes("429") || 
                                 error.message.includes("quota");

          if (shouldTryNextKey) {
            console.log("Rate limit hit. Switching to next key in pool...");
            continue; // Go to next iteration of the loop (next key)
          } else if (error.message.includes("404")) {
            // If model not found, maybe try a different model with the same key?
            // For now, let's keep it simple and just try the next key for stability.
            continue;
          } else {
            // Other logic errors, wait a bit and retry
            await sleep(500);
          }
        }
      }

      if (!res.writableEnded) {
        res.status(200).send("Main maafi chahta hoon, par sabhi AI keys abhi busy hain. Kripya 5-10 second baad dobara koshish karein!");
      }

    } catch (error) {
      console.error("Advanced Chat Error:", error.message);
      if (!res.writableEnded) {
        res.status(500).json({ error: "Intelligence core error" });
      }
    }
  }
};

module.exports = chatController;
