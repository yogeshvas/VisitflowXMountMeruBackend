import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(403).json({ message: "Refresh token missing" });

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(403).json({ message: "User not found" });

    // Generate a new Access Token
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30d" }
    );
    const refreshToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30d" }
    );


    res.json({ accessToken, refreshToken });
  } catch (error) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};

export { refreshToken };
