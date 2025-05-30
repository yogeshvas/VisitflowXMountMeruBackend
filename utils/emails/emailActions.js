/** @format */

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
      from: `"Welcome at Mamastops" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Enhancing Your Business with Our Digital Solutions",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: #333; text-align: center;">Thank You for Meeting with Us</h2>
          <p style="font-size: 16px; color: #555;">
            Thank you for giving our sales representative a chance to meet and discuss with you the products and services we have on offer to make your process digital and improve profitability by offering full logistics services.
          </p>
          <p style="font-size: 16px; color: #555;">
            We look forward to more engagements and doing business together. We hope you will give us the opportunity to present our solution to showcase how our services will benefit your business.
          </p>
          <p style="font-size: 16px; color: #555;">
            Best regards,<br>
           Mamastops.
          </p>
          <hr style="margin: 20px 0; border: 0; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #aaa; text-align: center;">&copy; ${new Date().getFullYear()} Mamastops. All rights reserved.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Business proposal email sent successfully");
  } catch (error) {
    console.error("❌ Failed to send business proposal email:", error);
  }
};
const sendFollowUpMetEmail = async (email, userId, clientId) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const reviewLink = `https://mamastops.visitflow.site/reviews?user=${userId}&client=${clientId}`;

    const mailOptions = {
      from: `"Mamastop Sales Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Follow-Up on Our Products and Services",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: #333; text-align: center;">Dear Valued Prospect,</h2>
          <p style="font-size: 16px; color: #555;">
            Thank you for giving our Sales representative time to follow-up with you on your last discussion regarding our products and services.
          </p>
          <p style="font-size: 16px; color: #555;">
            We hope to get your time to showcase our products to the entire management team.
          </p>
          <p style="font-size: 16px; color: #555;">
            If you'd like to provide feedback or review the discussion, please click the link below:
          </p>
          <p style="text-align: center; margin: 20px 0;">
            <a href="${reviewLink}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Review Our Sales Representative</a>
          </p>
          <p>if link does not work, copy and paste this link in your browser: <a href="${reviewLink}">${reviewLink}</a></p>
          <p style="font-size: 16px; color: #555;">
            Best regards,<br>
            <strong>Mamastop Sales Team</strong>
          </p>
          <hr style="margin: 20px 0; border: 0; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #aaa; text-align: center;">&copy; ${new Date().getFullYear()} Mamastop. All rights reserved.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Follow-up email sent successfully");
  } catch (error) {
    console.error("❌ Failed to send follow-up email:", error);
  }
};
const sendFollowUpNotMetEmail = async (email, userId, clientId) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail
        pass: process.env.EMAIL_PASS, // App Password
      },
    });
    const reviewLink = `https://mamastops.visitflow.site/reviews?user=${userId}&client=${clientId}`;

    const mailOptions = {
      from: `"Mamastop Sales Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Follow-Up on Our Products and Services",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: #333; text-align: center;">Dear Valued Prospect,</h2>
          <p style="font-size: 16px; color: #555;">
            Please note that our Sales representative passed through your office to follow-up on your last discussion regarding our products and services.
          </p>
          <p style="font-size: 16px; color: #555;">
            We hope you could make some time for us to meet and finalise and move to the next level.
          </p>
                    <p style="font-size: 16px; color: #555;">
            If you'd like to provide feedback or review the discussion, please click the link below:
          </p>
          <p style="text-align: center; margin: 20px 0;">
            <a href="${reviewLink}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Review Our Sales Representative</a>
          </p>
          <p>if link does not work, copy and paste this link in your browser: <a href="${reviewLink}">${reviewLink}</a></p>
          
          <p style="font-size: 16px; color: #555;">
            Best regards,<br>
            <strong>Mamastop Sales Team</strong>
          </p>
          <hr style="margin: 20px 0; border: 0; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #aaa; text-align: center;">&copy; ${new Date().getFullYear()} Mamastop. All rights reserved.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Follow-up email sent successfully");
  } catch (error) {
    console.error("❌ Failed to send follow-up email:", error);
  }
};

const sendProposAndPricingEmail = async (
  email,
  attachments,
  userId,
  clientId
) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail
        pass: process.env.EMAIL_PASS, // App Password
      },
    });
    const reviewLink = `https://mamastops.visitflow.site/reviews?user=${userId}&client=${clientId}`;

    const mailOptions = {
      from: `"Mamastop Sales Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Product Proposal, Price List, and Company Profile",
      attachments,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: #333; text-align: center;">Dear Valued Prospect,</h2>
          <p style="font-size: 16px; color: #555;">
            We are super excited at your request for the product proposal, price list, and company profile.
          </p>
          <p style="font-size: 16px; color: #555;">
            Kindly find attached for your review and please revert back to us at your earliest for any clarification.
          </p>
                    <p style="font-size: 16px; color: #555;">
            If you'd like to provide feedback or review the discussion, please click the link below:
          </p>
          <p style="text-align: center; margin: 20px 0;">
            <a href="${reviewLink}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Review Our Sales Representative</a>
          </p>
          <p>if link does not work, copy and paste this link in your browser: <a href="${reviewLink}">${reviewLink}</a></p>
          <p style="font-size: 16px; color: #555;">
            Best regards,<br>
            <strong>Mamastop Sales Team</strong>
          </p>
          <hr style="margin: 20px 0; border: 0; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #aaa; text-align: center;">&copy; ${new Date().getFullYear()} Mamastop. All rights reserved.</p>
        </div>
      `,
      attachments: attachments, // Add attachments here
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Proposal email sent successfully with attachments");
  } catch (error) {
    console.error("❌ Failed to send proposal email:", error);
  }
};

const sendOnboardingEmail = async (email, userId, clientId) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail
        pass: process.env.EMAIL_PASS, // App Password
      },
    });
    const reviewLink = `https://mamastops.visitflow.site/reviews?user=${userId}&client=${clientId}`;

    const mailOptions = {
      from: `"Mamastop Sales Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to Mamastop – Let’s Win Together!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: #333; text-align: center;">Dear Valued Customer,</h2>
          <p style="font-size: 16px; color: #555;">
            We are super excited to onboard you on the Mamastop platform and for being a part of the winning team in the market.
          </p>
          <p style="font-size: 16px; color: #555;">
            We look forward to a wonderful business relationship with you.
          </p>
                    <p style="font-size: 16px; color: #555;">
            If you'd like to provide feedback or review the discussion, please click the link below:
          </p>
          <p style="text-align: center; margin: 20px 0;">
            <a href="${reviewLink}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Review Our Sales Representative</a>
          </p>
          <p>if link does not work, copy and paste this link in your browser: <a href="${reviewLink}">${reviewLink}</a></p>
          <p style="font-size: 16px; color: #555;">
            Warm regards,<br>
            <strong>Mamastop Sales Team</strong>
          </p>
          <hr style="margin: 20px 0; border: 0; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #aaa; text-align: center;">&copy; ${new Date().getFullYear()} Mamastop. All rights reserved.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Onboarding email sent successfully");
  } catch (error) {
    console.error("❌ Failed to send onboarding email:", error);
  }
};

const sendTaskAssignmentToUserEmail = async (
  userEmail,
  clientName,
  taskDetails
) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Mamastop Task Management" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "New Task Assigned to You",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: #333; text-align: center;">New Task Assignment</h2>
          <p style="font-size: 16px; color: #555;">
            Hello, a new task has been assigned to you with the following details:
          </p>
          <div style="background-color: #fff; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Client:</strong> ${clientName}</p>
            <p><strong>Task Type:</strong> ${taskDetails.type}</p>
            <p><strong>Product:</strong> ${taskDetails.product}</p>
            <p><strong>Description:</strong> ${taskDetails.description}</p>
            <p><strong>Scheduled Date:</strong> ${new Date(
              taskDetails.date
            ).toLocaleDateString()}</p>
            <p><strong>Scheduled Time:</strong> ${taskDetails.time}</p>
          </div>
          <p style="font-size: 16px; color: #555;">
            Please prepare accordingly and ensure you complete the task on time.
          </p>
          <p style="font-size: 16px; color: #555;">
            Best regards,<br>
            <strong>Mamastop Team</strong>
          </p>
          <hr style="margin: 20px 0; border: 0; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #aaa; text-align: center;">&copy; ${new Date().getFullYear()} Mamastop. All rights reserved.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Task assignment email sent to user successfully");
  } catch (error) {
    console.error("❌ Failed to send task assignment email to user:", error);
  }
};

const sendTaskNotificationToClientEmail = async (
  clientEmail,
  userName,
  taskDetails,
  employeeName
) => {
  console.log("Sending task notification email to client:", clientEmail);
  console.log("Task details:", taskDetails);
  console.log("User name:", userName);
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Mamastop Customer Support" <${process.env.EMAIL_USER}>`,
      to: clientEmail,
      subject: "Your Scheduled Appointment",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: #333; text-align: center;">Your Service Appointment</h2>
          <p style="font-size: 16px; color: #555;">
            Dear Valued Customer,
          </p>
          <p style="font-size: 16px; color: #555;">
            We're pleased to inform you that ${userName} has been assigned to assist you with your ${
        taskDetails.product
      } needs.
          </p>
          <div style="background-color: #fff; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Employee Name:</strong> ${employeeName}</p>
            <p><strong>Service Type:</strong> ${taskDetails.type}</p>
            <p><strong>Scheduled Date:</strong> ${new Date(
              taskDetails.date
            ).toLocaleDateString()}</p>
            <p><strong>Scheduled Time:</strong> ${taskDetails.time}</p>
            <p><strong>Description:</strong> ${taskDetails.description}</p>
          </div>
          <p style="font-size: 16px; color: #555;">
            Our representative will contact you shortly to confirm the appointment. Please ensure someone is available at the scheduled time.
          </p>
          <p style="font-size: 16px; color: #555;">
            Best regards,<br>
            <strong>Mamastop Customer Support Team</strong>
          </p>
          <hr style="margin: 20px 0; border: 0; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #aaa; text-align: center;">&copy; ${new Date().getFullYear()} Mamastop. All rights reserved.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Task notification email sent to client successfully");
  } catch (error) {
    console.error(
      "❌ Failed to send task notification email to client:",
      error
    );
  }
};

export {
  sendTaskAssignmentToUserEmail,
  sendTaskNotificationToClientEmail,
  sendWelcomeEmail,
  sendFollowUpMetEmail,
  sendFollowUpNotMetEmail,
  sendProposAndPricingEmail,
  sendOnboardingEmail,
};
