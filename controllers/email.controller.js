import { Email } from "../models/email.model.js";
import sendEmail from "../utils/sendEmailTemplate.js";

// Create Email (POST)
export const createEmail = async (req, res) => {
  try {
    const { title, body, type } = req.body;
    const newEmail = new Email({ title, body, type });
    await newEmail.save();
    res
      .status(201)
      .json({ message: "Email created successfully", email: newEmail });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Emails (GET)
export const getEmails = async (req, res) => {
  try {
    const emails = await Email.find().sort({ createdAt: -1 });
    res.status(200).json(emails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Email (PATCH)
export const updateEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedEmail = await Email.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedEmail)
      return res.status(404).json({ message: "Email not found" });

    res
      .status(200)
      .json({ message: "Email updated successfully", email: updatedEmail });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const sendEmailToClient = async (req, res) => {
  const { email, title, body } = req.body;

  if (!email || !title || !body) {
    return res
      .status(400)
      .json({ message: "Email, title, and body are required" });
  }

  try {
    await sendEmail(email, title, body);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send email" });
  }
};
