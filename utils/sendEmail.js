/** @format */

import nodemailer from "nodemailer";

const sendEmailToNewUsers = async (email, password) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail
        pass: process.env.EMAIL_PASS, // App Password
      },
    });

    const mailOptions = {
      from: `"Support Team" <${process.env.EMAIL_USER}>`,
      to: email,
      cc: "nature.c@mamastops.com", // Add the CC email here
      subject: "Welcome! Your Account Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: #333; text-align: center;">Welcome to Mount Meru Client Visit Software!</h2>
          <p style="font-size: 16px; color: #555; text-align: center;">Your account has been successfully created. Please find your login credentials below:</p>
          <div style="background: #fff; padding: 15px; border-radius: 8px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <p style="font-size: 18px; margin: 10px 0;"><strong>Email:</strong> ${email}</p>
            <p style="font-size: 18px; margin: 10px 0;"><strong>Password:</strong> <span style="background: #ffeb3b; padding: 5px 10px; border-radius: 5px;">${password}</span></p>
          </div>
          <p style="font-size: 14px; color: #888; text-align: center; margin-top: 20px;">For security reasons, please change your password after logging in.</p>
          <div style="text-align: center; margin-top: 20px;">
            <a href="https://mmt.visitflow.site" style="padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">Login Now</a>
          </div>
          <p style="font-size: 14px; color: #888; text-align: center; margin-top: 20px;">If you did not request this, please ignore this email.</p>
          <hr style="margin: 20px 0; border: 0; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #aaa; text-align: center;">&copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("❌ Email sending failed:", error);
  }
};

export default sendEmailToNewUsers;
