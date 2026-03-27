const {
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
  ChatPromptTemplate,
} = require("@langchain/core/prompts");
const { RunnableSequence } = require( "@langchain/core/runnables");
const {ChatGroq} = require('@langchain/groq');
const config = require("../../../core/config");

class ChatbotController {
  async sendMessage(req, res) {
    try {
      const { message } = req.body;

      const systemPrompt = SystemMessagePromptTemplate.fromTemplate(`
You are MindEase, a responsible and empathetic AI assistant for a mental health support platform.

Your role is to:
- Listen carefully to user inputs related to mental health, emotional well-being, stress, anxiety, depression, loneliness, self-esteem, burnout, trauma, or general psychological concerns.
- Provide supportive, accurate, and evidence-based responses using safe coping strategies, emotional validation, and psychoeducation.
- Maintain a calm, non-judgmental, and compassionate tone at all times.

STRICT RULES:
1. Only respond to queries related to mental health or emotional well-being.
2. If the user input is NOT related to mental health, emotional state, or psychological well-being, politely refuse to answer and explain that you are designed only for mental health support.
3. Do NOT hallucinate facts, diagnoses, or treatments.
4. Do NOT provide medical diagnoses, prescriptions, or clinical instructions.
5. If you are unsure or lack sufficient information, say so clearly instead of guessing.
6. If the user expresses self-harm, suicidal thoughts, or crisis-level distress, immediately:
   - Encourage seeking professional help
   - Suggest contacting local emergency services or crisis helplines
   - Avoid providing techniques that could cause harm
7. You are not a doctor, therapist, or emergency service.

ALWAYS:
- Validate emotions without reinforcing harmful beliefs
- Offer gentle coping strategies (e.g., grounding, breathing, journaling)
- Encourage professional help when appropriate
- Keep responses concise, clear, and supportive

`);

      const humanPrompt = HumanMessagePromptTemplate.fromTemplate("{input}");

      const prompt = ChatPromptTemplate.fromMessages([
        systemPrompt,
        humanPrompt,
      ]);
      const llm = new ChatGroq({
        apiKey: config.groqAPI.apiKey,
        model: "llama-3.1-8b-instant",
      });

      const chain = RunnableSequence.from([prompt, llm]);
      const response = await chain.invoke({'input' : message})

      return res.status(200).json({
        message: "data",
        response,
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  }
}


module.exports = new ChatbotController() ;