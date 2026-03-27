const { z } = require("zod");
const { ChatGroq } = require("@langchain/groq");
const { RunnableSequence } = require("@langchain/core/runnables");
const { SystemMessagePromptTemplate } = require("@langchain/core/prompts");
const { StructuredOutputParser } = require("@langchain/core/output_parsers");
const config = require("../../../core/config");
const { chatPrompt, analyzePrompt } = require("../schemas/prompts/LLM");

const analysisSchema = z.object({
  risk_level: z.string().describe("The risk level of Mental Health Situation"),
  mental_health_score: z.number(),
  overall_summary: z.string(),
});

const QuestionSchema = z.object({
  question_text: z.string().describe("The question related to mental health"),
  options: z.array(z.string()).min(4).max(5).describe("The options of the question"),
});

const assessmentSchema = z.object({
  questions: z
    .array(QuestionSchema)
    .min(10)
    .max(15)
    .describe("The list of mental health assessment questions."),
});

const llm = new ChatGroq({
  apiKey: config.groqAPI.apiKey,
  model: "llama-3.1-8b-instant",
});

class AssesmentController {
  async GenerateQuestions(req, res) {
    try {
      const parser = StructuredOutputParser.fromZodSchema(assessmentSchema);

      const chain = RunnableSequence.from([chatPrompt, llm, parser]);
      const result = await chain.invoke({});
      return res.status(200).json({
        message: "assessment generated!!",
        assessment: result,
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  }

  async AnalysisAssessment(req, res) {
    try {
      const { answers } = req.body;
      if (!answers) {
        return res.status(400).json({
          message: "List of answers not found.",
        });
      }

      const parser = StructuredOutputParser.fromZodSchema(analysisSchema);

      const chain = RunnableSequence.from([analyzePrompt, llm, parser]);
      const response = await chain.invoke({ questions: answers });

      return res.status(200).json({
        message: "Assement analyze successfully",
        result: response,
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  }
}

module.exports = new AssesmentController();
