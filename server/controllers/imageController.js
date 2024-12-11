import FormData from "form-data";
import userModel from "../models/userModel.js";
import axios from "axios";

// Controller function to generate image from prompt
export const generateImage = async (req, res) => {
  try {
    const { userId, prompt } = req.body;

    // Fetching User Details Using userId
    const user = await userModel.findById(userId);

    if (!user || !prompt) {
      return res.json({ sucess: false, message: "missing Details" });
    }

    // Checking User creditBalance
    if (user.creditBalance === 0 || userModel.creditBalance < 0) {
      return res.json({
        sucess: false,
        message: "No Credit Balace",
        creditBalance: user.creditBalance,
      });
    }

    // Creation of new multi/part formdata
    const formData = new FormData();
    formData.append("prompt", prompt);

    // Calling Clipdrop API
    const { data } = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      formData,
      {
        headers: {
          "x-api-key": process.env.CLIP_DROP_API,
        },
        responseType: "arraybuffer",
      }
    );

    // Convertion of arrayBuffer to base64
    const base64Image = Buffer.from(data, "bbinary").toString("base64");
    const resultImage = `data:image/png;base64,${base64Image}`;

    // Deduction of user credit
    await userModel.findByIdAndUpdate(user._id, {
      creditBalance: user.creditBalance - 1,
    });

    // Sending Response
    res.json({
      sucess: true,
      message: "Image Generated",
      creditBalance: user.creditBalance - 1,
      resultImage,
    });
  } catch (error) {
    console.log(error);
    res.json({ sucess: false, message: error.message });
  }
};
