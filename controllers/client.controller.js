import { Client } from "../models/client.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { sendWelcomeEmail } from "../utils/emailSendingStrategies.js";
import { distanceCalculation } from "../helpers/miniHelpers.js";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
const add_client = async (req, res) => {
  try {
    // Extract client details from request body
    const {
      company_name,
      contact_person,
      contact_email,
      contact_phone,
      category,
      best_for,
      no_of_employees,
      comment,
      location,
      address,
      fleet_size
    } = req.body;
    console.log(req.body);
    // Validate required fields
//     if (
//       !company_name ||
//       !contact_person ||
//       !contact_email ||
//       !contact_phone ||
//       !category ||
//       best_for.lat === 0 ||
//       !no_of_employees ||
//       !location ||
//       !location.lat ||
//       !location.lng ||
//       !fleet_size
//     ) {
//       // Update the validation part:
// if (
//   !company_name ||
//   !contact_person ||
//   !contact_email ||
//   !contact_phone ||
//   !category ||
  
//   !best_for.length === 0 || // Explicitly check array length
//   !no_of_employees ||
//   !location ||
//   !location.lat ||
//   !location.lng ||
//   !fleet_size
// ) {
//   return res.status(400).json({ 
//     message: "Missing required fields",
//     details: {
//       missing_fields: {
//         company_name: company_name,
//         contact_person: contact_person,
//         contact_email: contact_email,
//         contact_phone: contact_phone,
//         category: category,
//         best_for: best_for || best_for.length === 0,
//         no_of_employees: no_of_employees,
//         location: location,
//         fleet_size: fleet_size
//       }
//     }
//   });
// }
//     }

    // Check if client already exists
    const existingClient = await Client.findOne({ contact_email });
    if (existingClient) {
      return res.status(400).json({ message: "Client already exists" });
    }

    // Create new client with GeoJSON location format
    const newClient = await Client.create({
      company_name,
      contact_person,
      contact_email,
      contact_phone,
      category,
      best_for,
      no_of_employees,
      comment,
      address,
      fleet_size,
     location
    });


 
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (user) {
      user.my_clients.push(newClient._id);
      await user.save();
    }
    return res.status(201).json({
      success: true,
      message: "Client added successfully",
      client: newClient,
    });
  } catch (error) {
    console.error("Error adding client:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }

};

const get_all_clients = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const clients = await Client.aggregate([
      {
        $sort: { createdAt: -1 }, // Sort by latest update first
      },
      {
        $group: {
          _id: "$company_name", // Group by unique company_name
          doc: { $first: "$$ROOT" }, // Keep only the latest document per company
        },
      },
      {
        $replaceRoot: { newRoot: "$doc" }, // Unwrap grouped documents
      },
      {
        $skip: (page - 1) * limit, // Pagination skip
      },
      {
        $limit: limit, // Limit results per page
      },
    ]);

    const totalClients = await Client.aggregate([
      {
        $group: {
          _id: "$company_name",
        },
      },
      {
        $count: "total",
      },
    ]);

    const total = totalClients.length > 0 ? totalClients[0].total : 0;
    const totalPages = Math.ceil(total / limit);

    return res.json(
      new ApiResponse(
        200,
        { clients, totalPages, currentPage: page, totalClients: total },
        "Clients found"
      )
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json(new ApiError(500, error.message));
  }
};
const get_client_by_id_and_visits = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findById(id).populate({
      path: 'visits',
      populate: {
        path: 'sales_rep',
        model: 'User'
      }
    });

    if (!client) {
      return res.status(404).json(new ApiError(404, "Client not found"));
    }

    return res.json(new ApiResponse(200, client, "Client found"));
  } catch (error) {
    console.error(error);
    return res.status(500).json(new ApiError(500, error.message));
  }
};
export const search_client = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q)
      return res.status(400).json({ message: "Search query is required" });

    const clients = await Client.aggregate([
      {
        $match: {
          $or: [
            { company_name: { $regex: q, $options: "i" } },
            { contact_person: { $regex: q, $options: "i" } },
            { contact_email: { $regex: q, $options: "i" } },
            { contact_phone: { $regex: q, $options: "i" } },
            { category: { $regex: q, $options: "i" } },
            { best_for: { $regex: q, $options: "i" } },
          ],
        },
      },
      {
        $group: {
          _id: "$company_name",
          doc: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: { newRoot: "$doc" },
      },
      {
        $lookup: {
          from: "visits", // Name of the collection that stores visits
          localField: "visits", // Field in the Client collection
          foreignField: "_id", // Field in the Visits collection
          as: "visits", // Name for the new field in the output
        },
      },
      { $limit: 10 },
    ]);

    res.status(200).json(new ApiResponse(200, clients, "Clients found"));
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const edit_client_details = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      company_name,
      address,
      contact_person,
      contact_email,
      contact_phone,
      category,
      status,
      best_for,
      no_of_employees,
      comment,
      location,
      visits,
    } = req.body;

    // if (!mongoose.Types.ObjectId.isValid(clientId)) {
    //   return res.status(400).json({ message: "Invalid client ID" });
    // }

    const updatedClient = await Client.findByIdAndUpdate(
      id,
      {
        company_name,
        address,
        contact_person,
        contact_email,
        contact_phone,
        category,
        status,
        best_for,
        no_of_employees,
        comment,
        location,
        visits,
      },
      { new: true, runValidators: true }
    );

    if (!updatedClient) {
      return res.status(404).json({ message: "Client not found" });
    }

    res
      .status(200)
      .json({ message: "Client details updated successfully", updatedClient });
  } catch (error) {
    console.error("Error updating client details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const client_near_me = async (req, res) => {
  try {
    let { user_lat, user_lng,range } = req.query;
    if (!user_lat || !user_lng) {
      return res
        .status(400)
        .json({ message: "Latitude and longitude are required." });
    }

    const numericRange = range*1000;
    const radius = numericRange / 6378100; // Convert meters to radians

    const clients = await Client.aggregate([
      {
        $match: {
          location: {
            $geoWithin: {
              $centerSphere: [
                [parseFloat(user_lng), parseFloat(user_lat)],
                radius,
              ],
            },
          },
        },
      },
      { $sort: { updatedAt: -1 } }, // Sort by latest update first
      {
        $group: {
          _id: "$company_name", // Group by company_name
          doc: { $first: "$$ROOT" }, // Keep only the latest document per company
        },
      },
      {
        $replaceRoot: { newRoot: "$doc" }, // Unwrap grouped documents
      },
    ]);

    return res.status(200).json({
      success: true,
      count: clients.length,
      clients,
    });
  } catch (error) {
    console.error("Error fetching nearby clients:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


export {
  add_client,
  get_all_clients,
  client_near_me,
  edit_client_details,
  get_client_by_id_and_visits,
};
