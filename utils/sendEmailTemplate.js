import nodemailer from "nodemailer";
import { marked } from "marked";

// Utility function to send email
const sendEmail = async (email, title, markdownBody) => {
  console.log("email", email);
  try {
    // Convert markdown to HTML
    const htmlBody = marked(markdownBody);

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
      subject: title,
      cc:"nature.c@mamastops.com",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 10px; background-color: #ffffff; border: 1px solid #e0e0e0; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://media.licdn.com/dms/image/v2/D4D0BAQGp4-7iN0ZmbA/company-logo_200_200/company-logo_200_200/0/1680948781186/mamastops_logo?e=1749081600&v=beta&t=ajpIOKATuEt_tEvAwxJbkUE2eIAifccSu5DwUi0bcDw" alt="Company Logo" style="width: 100px; height: auto; border-radius: 10px;">
          </div>
          <h2 style="color: #333; text-align: center;">${title}</h2>
          <div style="padding: 15px; background-color: #f4f4f4; border-radius: 8px; line-height: 1.6; color: #444;">
            ${htmlBody}
          </div>
          <div style="margin-top: 20px; text-align: center;">
            <a href="https://mamastops.visitflow.site" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">Visit Our Website</a>
          </div>
          <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #777;">
            <p>Need help? Contact our <a href="#" style="color: #007bff; text-decoration: none;">support team</a>.</p>
            <p>&copy; ${new Date().getFullYear()} MamaStops. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully");
  } catch (error) {
    console.error("❌ Email sending failed:", error);
  }
};

export default sendEmail;
