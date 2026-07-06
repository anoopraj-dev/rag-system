import chatService from "../ai/index.js";

async function askQuestion(req, res) {
  try {
    const { message, topK } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const limit = topK ? parseInt(topK, 10) : 5;
    const result = await chatService.ask(message, limit);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error during chat processing:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}

export default {
  askQuestion,
};
