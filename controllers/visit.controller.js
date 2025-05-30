import { User } from "../models/user.model.js";
import { Client } from "../models/client.model.js";
import { Visit } from "../models/visit.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { distanceCalculation } from "../helpers/miniHelpers.js";
import { sendFollowUpMetEmail, sendFollowUpNotMetEmail, sendOnboardingEmail, sendProposAndPricingEmail, sendWelcomeEmail } from "../utils/emails/emailActions.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert the module URL to a file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const add_visit = async (req, res) => {
  try {
    // Extract details from request body
    const { client_id, visit_conclusion, user_lat, user_lng, status, followup_date } = req.body;

    // Find the client
    const client = await Client.findById(client_id);
    if (!client) {
      return res.status(404).json(new ApiError(404, "Client not found"));
    }

    const formattedEmail = client.contact_email.toLowerCase();

    // Handle email sending based on status
    if (status === "Follow-Up-Met") {
      await sendFollowUpMetEmail(formattedEmail,req.user.id,client._id);
    } else if (status === "Follow-Up-Not-Met") {
      await sendFollowUpNotMetEmail(formattedEmail,req.user.id,client._id);
    } else if (status === "Pricing Sent" || status === "Proposal Sent") {
      // Define paths for both attachments
      const proposalPath = path.join(__dirname, 'static', 'proposal.pdf');
      const profilePath = path.join(__dirname, 'static', 'company.pdf');

      // Check if both files exist
      if (!fs.existsSync(proposalPath)) {
        console.error("Proposal file not found:", proposalPath);
        return res.status(404).json(new ApiError(404, "Proposal file not found"));
      }
      if (!fs.existsSync(profilePath)) {
        console.error("Profile file not found:", profilePath);
        return res.status(404).json(new ApiError(404, "Profile file not found"));
      }

      // Define attachments array
      const attachments = [
        {
          filename: "proposal.pdf",
          path: proposalPath,
          contentType: "application/pdf",
        },
        {
          filename: "profile.pdf",
          path: profilePath,
          contentType: "application/pdf",
        },
      ];

      try {
        await sendProposAndPricingEmail(formattedEmail, attachments,req.user.id,client._id);
      } catch (error) {
        console.error("Failed to send proposal email:", error);
        return res.status(500).json(new ApiError(500, "Failed to send proposal email"));
      }
    } else if (status === "Closed") {
      await sendOnboardingEmail(formattedEmail,req.user.id,client._id);
    }else if (status === "Active") {
      await sendWelcomeEmail(formattedEmail);
    }

    // Update the client status
    if (status) client.status = status;

    // Calculate distance between user and client location
    const distance = distanceCalculation(
      client.location.coordinates[1], // latitude
      client.location.coordinates[0], // longitude
      user_lat,
      user_lng
    );

    if (distance > 1) {
      return res.status(418).json(
        new ApiError(403, "User must be within 1 km range to create a client visit")
      );
    }

    // Create a new visit
    const newVisit = new Visit({
      sales_rep: req.user.id,
      client: client_id,
      check_in_time: new Date(),
      comments: visit_conclusion,
    });

    await newVisit.save();

    // Add Visit to Client's visit history
    client.visits.push(newVisit._id);

    // Add Follow-Up Date to Client (if provided)
    if (followup_date) {
      client.follow_up_dates.push({
        date: followup_date,
        user: req.user.id,
      });
    }

    await client.save();

    // Update Sales Rep's Data
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json(new ApiError(404, "User not found"));
    }

    if (!user.my_clients.includes(client_id)) {
      user.my_clients.push(client_id);
    }

    user.visits.push(newVisit._id);
    user.total_visits += 1;

    await user.save();

    // Return Success Response
    return res.json(new ApiResponse(200, "Visit added successfully", newVisit));
  } catch (error) {
    console.error("Error in add_visit:", error);
    return res.status(500).json(new ApiError(500, error.message));
  }
};

export { add_visit };
