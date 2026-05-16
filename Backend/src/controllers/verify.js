import alpha from "../agent/alpha.js";
import beta from "../agent/beta.js";


export const verifyAlpha = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: "Query is required"
      });
    }

    const obj = {
      apiKey: process.env.GOOGLE_API_KEY,
      model: "gemini-2.5-flash",
      query
    };

    const alpha_response = await alpha(obj);

    return res.status(200).json(alpha_response);

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || "Alpha verification failed"
    });
  }
};


export const verifyBeta = async (req, res) => {
  try {
    const alpha_response = req.body;

    if (!alpha_response || !alpha_response.data) {
      return res.status(400).json({
        success: false,
        error: "Valid alpha response required"
      });
    }

    const beta_response = await beta(alpha_response);

    return res.status(200).json(beta_response);

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || "Beta verification failed"
    });
  }
};








