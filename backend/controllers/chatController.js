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

      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey.trim() === "") {
        return res.status(200).json({ 
          reply: "Namaste! 🙏 Abhi chatbot ke system mein 'API Key' set nahi hui hai. Please .env file check karein." 
        });
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      
      // TARGET MODELS: confirmd to work with "AQ." keys
      const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-pro"];
      
      let streamStarted = false;
      let lastErrorMessage = "";
      const MAX_RETRIES = 3;

      const systemInstruction = `YOU ARE 'GAON AI', A WORLD-CLASS ARTIFICIAL INTELLIGENCE ASSISTANT.
      DEVELPER: Digital Gaon team.
      CORE PERSONALITY: Expert, intellectual, and professional.
      LANGUAGE: Respond in the user's language (Hindi/English/Hinglish).`;

      // CRITICAL FIX: Gemini history MUST start with 'user' role
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

      for (const modelName of modelsToTry) {
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
          try {
            console.log(`--- ATTEMPT ${attempt} WITH ${modelName} ---`);
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
            console.log(`--- SUCCESS WITH: ${modelName} ---`);
            return;

          } catch (error) {
            lastErrorMessage = error.message;
            console.warn(`--- ${modelName} FAILED --- Reason:`, error.message);

            if (streamStarted) {
              res.end();
              return;
            }

            if (error.message.includes("404") || error.message.includes("not found")) {
              break; // Skip to next model
            }

            if ((error.message.includes("503") || error.message.includes("429")) && attempt < MAX_RETRIES) {
              await sleep(attempt * 1000);
              continue; // Retry
            } else {
              break; // Try next model
            }
          }
        }
      }

      if (!res.writableEnded) {
        res.status(200).send("Main maafi chahta hoon, par Google AI ki demand bahut zyada hai. Kripya 2-3 second baad try karein!");
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
