const { GoogleGenerativeAI } = require("@google/generative-ai");

const chatController = {
  sendMessage: async (req, res) => {
    try {
      const { message, image, history } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.trim() === "") {
        return res.status(200).json({ 
          reply: "Namaste kisan bhai! 🙏\nAbhi mere system mein 'Google Gemini API Key' set nahi hui hai." 
        });
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
      let streamStarted = false;

      // ADVANCED SYSTEM PROMPT (ChatGPT Quality)
      const systemInstruction = `YOU ARE 'GAON AI', A WORLD-CLASS ARTIFICIAL INTELLIGENCE ASSISTANT.
      DEVELPER: Digital Gaon team.
      
      CORE PERSONALITY:
      - You are as capable, intelligent, and versatile as ChatGPT.
      - You are an expert in ALL fields: Education (Notes, Subjects), Coding, Math, Science, Business, Agriculture, and Creative Writing.
      - Your tone is professional, helpful, intellectually rigorous, and encouraging.
      
      OPERATIONAL GUIDELINES (CRITICAL):
      1. USE RICH MARKDOWN: Use '###' for headers, tables for data, and code blocks for programming.
      2. CLEAN SPACING: Use double newlines (two enter keys) between paragraphs and sections for maximum readability.
      3. DO NOT ESCAPE: Send actual newline characters, not literal '\n' text. Send actual '#' characters for markdown.
      4. STEP-BY-STEP REASONING: For complex questions, explain your logic clearly.
      5. LANGUAGE: Respond in the language used by the user (Hindi, English, or Hinglish).
      6. DOMAIN EXPERTISE: 
         - Education: Provide detailed notes for 10th-12th grade students.
         - Tech/Coding: Write clean, commented code.
         - Rural/Agri: Give scientific and practical advice (Mausam, Mandi bhav).
      
      Remember: You are Gaon AI, the ultimate knowledge partner. Output must be clean, formatted, and professional.`;

      // Format history for Gemini SDK
      const formattedHistory = (history || []).map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      // STREAMING REPLACEMENT
      for (const modelName of modelsToTry) {
        try {
          console.log(`--- ATTEMPTING SMART STREAM WITH: ${modelName} ---`);
          const model = genAI.getGenerativeModel({ 
            model: modelName,
            systemInstruction: systemInstruction 
          });

          const chat = model.startChat({
            history: formattedHistory,
          });

          // Prepare prompt content (handling image if present)
          let promptContent = [message];
          if (image && image.data && image.mimeType) {
            promptContent.push({
              inlineData: {
                data: image.data,
                mimeType: image.mimeType
              }
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
          return;
        } catch (error) {
          console.error(`--- ${modelName} FAILED ---`, error.message);
          if (streamStarted) {
            res.end();
            return;
          }
          continue;
        }
      }

      if (!res.writableEnded) {
        res.status(200).send("Main maafi chahta hoon, par abhi server ki logic system mein thodi deri ho rahi hai. Koshish karein!");
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
