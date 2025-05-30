import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import { generateRandomPassword } from "../helpers/miniHelpers.js";
import sendEmail from "../utils/sendEmail.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import sendEmailToNewUsers from "../utils/sendEmail.js";
const register = async (req, res) => {
  try {
    const { name, email, managerId } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json(new ApiError(400, "User already exists"));
    }

    // Generate & hash password
    const rawPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Save user to DB
    const user = await User.create({
      name,
      email,
      manager: managerId,
      password: hashedPassword,
    });
    console.log("🚀 User registered");
    // Send email with password
    await sendEmailToNewUsers(email, rawPassword);

    return res.json(
      new ApiResponse(
        200,
        "User registered successfully. Check your email for the password."
      )
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json(new ApiError(500, error.message));
  }
};

const addManager = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json(new ApiError(400, "User already exists"));
    }
    // generate and hash password
    const rawPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Save user to DB
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "manager",
    });
    console.log("🚀 Manager registered");
    await sendEmailToNewUsers(email, rawPassword);
    return res.json(
      new ApiResponse(
        200,
        user,
        "Manager registered successfully. Check your email for the password."
      )
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json(new ApiError(500, error.message));
  }
};

const mapUserToManager = async (req, res) => {
  try {
    const { userId, managerId } = req.body;

    const user = await User.findById(userId);
    const manager = await User.findById(managerId);

    if (!user || !manager) {
      return res
        .status(404)
        .json(new ApiError(404, "User or Manager not found"));
    }

    // Check if user is already in manager's team
    if (manager.team.includes(user._id)) {
      return res
        .status(400)
        .json(new ApiError(400, "User is already assigned to this manager"));
    }

    user.manager = manager._id;
    await user.save();

    manager.team.push(user._id);
    await manager.save();

    return res.json(
      new ApiResponse(200, user, "User added to manager successfully")
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json(new ApiError(500, error.message));
  }
};

const login = async (req, res) => {
  try {
    const { error } = User.validateLogin(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.warn(`Login failed: User with email ${email} not found`);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn(`Login failed: Incorrect password for email ${email}`);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate Access Token (Short-lived)
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30d" }
    );

    // Generate Refresh Token (Long-lived)
    const refreshToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "30d" }
    );

    // Store Refresh Token in HTTP-only cookie
    // res.cookie("refreshToken", refreshToken, {
    //   expiresIn: new Date(Date.now() + 2589200000),
    //   httpOnly: true,
    //   // secure: false, // Should be 'true' in production with HTTPS
    //   // sameSite: "lax", // Allows sending cookies with requests from different origins
    //   // maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    // });
    // console.log("🚀 Login successful");

    return res.json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user:{
        name: user.name,
        email: user.email,
        role: user.role
      },
      role: user.role,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const logout = async (req, res) => {
  try {
    // Clear the refresh token cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      // secure: true, // Use 'true' in production with HTTPS
      // sameSite: "lax", // Use 'strict' or 'lax' based on your requirements
    });

    return res.json(new ApiResponse(200, "Logout successful"));
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
};


const forgotPassword = async (req, res) => {
  try {

    const userId = req.user.id
    console.log(req.body)
    const {  oldPassword, newPassword } = req.body;

    console.log("🚀 ~ file: auth.controller.js ~ line 191 ~ forgotPassword ~ req.body", req.body)
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(new ApiError(404, "User not found"));
    }


    // Validate old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json(new ApiError(401, "Invalid old password"));
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    user.password = hashedNewPassword;
    await user.save();

    return res.json(new ApiResponse(200, "Password updated successfully"));
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json(new ApiError(500, "Internal server error"));
  }
};

export { register, login, addManager, mapUserToManager, logout,forgotPassword };
