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









// import alpha from "../agent/alpha.js";
// import beta from "../agent/beta.js";


// const verify = async (req, res) => {
//   try {
//     const {query} = req.body;
//     const obj = {
//         apiKey: process.env.GOOGLE_API_KEY,
//         model: "gemini-2.5-flash",
//         query: query,
//         };

//     if (!obj) {
//       return res.status(400).json({
//         success: false,
//         error: "Request body required"
//       });
//     }

//     // STEP 1: alpha
//     const alpha_response = await alpha(obj);

//     // STEP 2: immediate frontend response
//     res.status(200).json(alpha_response);

//     // STEP 3: beta in background
//     if (alpha_response.success && alpha_response.data) {
//       beta(alpha_response).catch((err) => {
//         console.error("Beta background error:", err);
//       });
//     }

//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       error: error.message || "Alpha controller failed"
//     });
//   }
// };

// export default verify;