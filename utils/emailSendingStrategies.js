import nodemailer from "nodemailer";
const sendWelcomeEmail = async (email) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail
        pass: process.env.EMAIL_PASS, // App Password
      },
    });

    const mailOptions = {
      from: `"Mount Meru Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to Mount Meru – We're Excited to Have You!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: #333; text-align: center;">Welcome to Mount Meru Client Platform!</h2>
          <p style="font-size: 16px; color: #555; text-align: center;">
            We're thrilled to have you on board! Our platform is designed to enhance your experience and make client visits seamless.
          </p>
          <div style="background: #fff; padding: 15px; border-radius: 8px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <p style="font-size: 18px; margin: 10px 0;"><strong>Email:</strong> ${email}</p>
          </div>
          <p style="font-size: 14px; color: #888; text-align: center; margin-top: 20px;">
            Log in to explore all the features and get started with your client visits effortlessly.
          </p>
          <div style="text-align: center; margin-top: 20px;">
            <a href="https://yourwebsite.com/login" style="padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">Access Your Account</a>
          </div>
          <p style="font-size: 14px; color: #888; text-align: center; margin-top: 20px;">
            Need any help? Our support team is always here for you.
          </p>
          <hr style="margin: 20px 0; border: 0; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #aaa; text-align: center;">&copy; ${new Date().getFullYear()} Mount Meru Group. All rights reserved.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Welcome email sent successfully");
  } catch (error) {
    console.error("❌ Failed to send welcome email:", error);
  }
};

export { sendWelcomeEmail };
