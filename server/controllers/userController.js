import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// API to register user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // checking for all data to register user
    if (!name || !email || !password) {
      return res.json({ sucess: false, message: "Missing Details" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user data
    const userData = {
      name,
      email,
      password: hashedPassword,
    };

    // Save user to database
    const newUser = new userModel(userData);
    const user = await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({ sucess: true, token, user: { name: user.name } });

  } catch (error) {
    console.log(error);
    res.json({ sucess: false, message: error.message });
  }
};

// API to login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    // Check if user exists
    if (!user) {
      return res.json({ sucess: false, message: "User does not exist" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

      res.json({ sucess: true, token, user: { name: user.name } });

    } else {
      return res.json({ sucess: false, message: "invalid Credential" });
    }
  } catch (error) {
    console.log(error);
    res.json({ sucess: false, message: error.message });
  }
};

// API Controller function to get user available credits data
const userCredits = async (req, res) => {
    try {
        const {userId} = req.body

        // Fetching userdata using userId
        const user = await userModel.findById(userId)
        res.json({sucess: true, credits: user.creditBalance, user: {name: user.name}})
    } catch (error) {
        console.log(error);
        res.json({ sucess: false, message: error.message });
    }
}

export {registerUser, loginUser, userCredits}