import { Client } from "../models/client.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { geocodeAddress } from "../utils/reverseGeocode.js";
import xlsx from "xlsx";
import moment from "moment";
import { Visit } from "../models/visit.model.js";

export const profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json(new ApiError(404, "User not found"));
    }
    res.json(new ApiResponse(200, user, "User found"));
  } catch (error) {
    console.error(error);
    return res.status(500).json(new ApiError(500, error.message));
  }
};

export const bulkUpload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let clientsToInsert = [];
    let skippedClients = [];

    for (const row of data) {
      const companyName = row["Company Name"] || "N/A";

      // Check if the company already exists in the database
      const existingClient = await Client.findOne({
        company_name: companyName,
      });
      if (existingClient) {
        skippedClients.push(companyName);
        continue; // Skip adding this company
      }

      const coordinates = await geocodeAddress(row["Client Location"]);

      const client = {
        company_name: companyName,
        address: row["Client Location"] || "N/A",
        contact_person: row["Client Name"] || "N/A",
        contact_email: "NA",
        contact_phone: row["Client Contact Number"] || "N/A",
        category: "HOT",
        status: "Active",
        best_for: "NA",
        no_of_employees: 10,
        comment: row["Comment"] || "N/A",
        location: {
          type: "Point",
          coordinates: coordinates || [0, 0], // Default to [0,0] if geocode fails
        },
        visits: [],
      };

      clientsToInsert.push(client);
    }

    // Insert only new clients
    if (clientsToInsert.length > 0) {
      await Client.insertMany(clientsToInsert);
    }

    res.status(200).json({
      message: "Bulk upload completed",
      inserted: clientsToInsert.length,
      skipped: skippedClients.length,
      skippedCompanies: skippedClients,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    res.status(500).json({ message: "Error uploading data", error });
  }
};

export const get_dashboard = async (req, res) => {
  try {
    const { id } = req.user;
    const MiddlUser = req.user;
    console.log(MiddlUser);

    // Fetch user with populated visits and clients
    const user = await User.findById(id)
      .populate({
        path: "visits",
        populate: {
          path: "client",
        },
      })
      .populate({
        path: "my_clients",
        populate: {
          path: "visits", // Populate the visits for each client
        },
      });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Extract clients from visits
    const clients = user.visits.map((visit) => visit.client);

    // Categorize clients into hot, warm, and cold
    const hotClients = clients
      .filter((client) => client.category === "HOT")
      .slice(0, 5);
    const warmClients = clients
      .filter((client) => client.category === "WARM")
      .slice(0, 5);
    const coldClients = clients
      .filter((client) => client.category === "COLD")
      .slice(0, 5);

    // Get visits this week grouped by day
    const startOfWeek = moment().startOf("week"); // Sunday (change to .isoWeek() for Monday start)
    const visitsThisWeek = user.visits.filter((visit) =>
      moment(visit.check_in_time).isSameOrAfter(startOfWeek)
    );

    // Group visits by day
    const visitsByDay = {};
    for (let i = 0; i < 7; i++) {
      const day = startOfWeek.clone().add(i, "days").format("YYYY-MM-DD");
      visitsByDay[day] = visitsThisWeek.filter(
        (visit) => moment(visit.check_in_time).format("YYYY-MM-DD") === day
      ).length;
    }

    // Get top 5 clients based on the latest visit date
    const my_top_clients = user.my_clients
      .map((client) => {
        // Find the most recent visit for each client
        const latestVisit = client.visits.reduce((latest, visit) => {
          const visitDate = moment(visit.check_in_time);
          const latestDate = latest ? moment(latest.check_in_time) : null;
          return !latestDate || visitDate.isAfter(latestDate) ? visit : latest;
        }, null);

        return {
          ...client.toObject(), // Convert Mongoose document to plain object
          latestVisitDate: latestVisit ? moment(latestVisit.check_in_time) : null,
        };
      })
      .sort((a, b) => {
        // Sort clients by the latest visit date (most recent first)
        if (!a.latestVisitDate) return 1; // Clients without visits go to the end
        if (!b.latestVisitDate) return -1;
        return b.latestVisitDate - a.latestVisitDate;
      })
      .slice(0, 5); // Select the top 5 clients

    const userClients = user.my_clients.length;
    const rating = user.avg_rating || 5; // Default to 5 if no rating exists
    res.json({
      user,
      stats: {
        totalClients: userClients,
        hotClients: {
          count: hotClients.length,
          list: hotClients,
        },
        warmClients: {
          count: warmClients.length,
          list: warmClients,
        },
        coldClients: {
          count: coldClients.length,
          list: coldClients,

        },
      },
      my_top_clients, // Send the top 5 clients based on the latest visit date
      visitsThisWeek: visitsByDay,
      rating,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching dashboard data", error });
  }
};

export const my_clients = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id).populate({
      path: "clients",
      populate: {
        path: "visits",
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user.clients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching dashboard data", error });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id)
      .select("-password")
      .populate({
        path: "visits",
        populate: {
          path: "client", // Populate the client field within each visit
        },
      })
      .populate("team"); // Populate the team field if needed

    if (!user) {
      return res.status(404).json(new ApiError(404, "User not found"));
    }

    return res.status(200).json(new ApiResponse(200, user, "User Found"));
  } catch (error) {
    console.error(error);
    res.status(500).json(new ApiError(500, error.message));
  }
};

export const getUserForReview = async(req,res)=> {
  try {
    const { id } = req.params;
    const user = await User.findById(id)
      .select("-password")
      

    if (!user) {
      return res.status(404).json(new ApiError(404, "User not found"));
    }
const response = {
  name: user.name,
  email: user.email,
}
    return res.status(200).json(new ApiResponse(200, response, "User Found"));
  } catch (error) {
    console.error(error);
    res.status(500).json(new ApiError(500, error.message));
  }

}
export const getTeamUnderMe = async (req, res) => {
  try {
    const user = req.user;

    if (user.role == "user") {
      return res
        .status(200)
        .json(
          new ApiResponse(200, [], "User Doesn't need to have this API :)")
        );
    }

    if (user.role == "manager") {
      const manager = await User.findById(user.id)
        .populate({
          path: "team",
          select: "-password", // Exclude password from populated team
        })
        .select("-password"); // Exclude password from manager

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            manager.team,
            "All users mapped to current admin are sent"
          )
        );
    }

    const allUsers = await User.find().select("-password");
    return res
      .status(200)
      .json(new ApiResponse(200, allUsers, "All Users sent to admin"));
  } catch (error) {
    console.error(error);
    res.status(500).json(new ApiError(500, error.message));
  }
};

export const getAllManagers = async (req, res) => {
  try {
    const managers = await User.find({ role: "manager" }).select("-password");

    return res
      .status(200)
      .json(new ApiResponse(200, managers, "Managers sent"));
  } catch (error) {
    console.error(error);
    res.status(500).json(new ApiError(500, error.message));
  }
};

export const getTeamOfManager = async (req, res) => {
  try {
    const { id } = req.params;
    const manager = await User.findById(id)
      .populate("team")
      .select("-password");
    if (!manager) {
      return res.status(404).json(new ApiError(404, "Manager not found"));
    }
    res.json(new ApiResponse(200, manager.team, "Manager found"));
  } catch (error) {
    console.error(error);
    return res.status(500).json(new ApiError(500, error.message));
  }
};

export const analytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { filter, startDate: queryStart, endDate: queryEnd } = req.query;
    const role = req.user.role;
    const user = await User.findById(userId);

    let startDate, endDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filter === "today") {
      startDate = today;
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
    } else if (filter === "yesterday") {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 1);
      endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
    } else if (filter === "custom" && queryStart && queryEnd) {
      startDate = new Date(queryStart);
      endDate = new Date(queryEnd);
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate = new Date();
      startDate.setDate(today.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
    }

    let visitsQuery = { createdAt: { $gte: startDate, $lte: endDate } };

    if (role === "manager") {
      visitsQuery.sales_rep = { $in: user.team };
    } else if (role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const visits = await Visit.find(visitsQuery)
      .populate("sales_rep", "name")
      .populate("client", "company_name category status");

    // **Find New Clients Added Today**
    const newClientsToday = await Client.find({
      createdAt: {
        $gte: today,
        $lte: new Date(today).setHours(23, 59, 59, 999),
      },
    }).select("company_name category status createdAt");

    // **Weekly Data for Charting**
    const weeklyVisits = await Promise.all(
      [...Array(7)].map(async (_, i) => {
        const dayStart = new Date();
        dayStart.setDate(today.getDate() - i);
        dayStart.setHours(0, 0, 0, 0);

        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);

        const dailyVisits = await Visit.find({
          createdAt: { $gte: dayStart, $lte: dayEnd },
          ...(role === "manager" && { sales_rep: { $in: user.team } }),
        }).countDocuments();

        return {
          date: dayStart.toISOString().split("T")[0],
          visits: dailyVisits,
        };
      })
    );

    // **Categorizing Visits**
    const categorizedVisits = {
      PricingPlan: visits.filter((v) => v.client.status === "Pricing Sent"),
      ProposalSent: visits.filter((v) => v.client.status === "Proposal Sent"),
      FollowUp: visits.filter((v) => v.client.status === "Follow-Up"),
      Closed: visits.filter((v) => v.client.status === "Closed"),
    };

    const analyticsData = {
      totalVisits: visits.length,
      categorizedVisits,
      newClientsToday,
      weeklyVisits: weeklyVisits.reverse(), // Arrange oldest to newest
      detailedVisits: visits.map((v) => ({
        salesRep: v.sales_rep.name,
        client: v.client.company_name,
        category: v.client.category,
        status: v.client.status,
        createdAt: v.createdAt,
        updatedAt: v.updatedAt,
        comments: v.comments,
      })),
    };

    res.status(200).json({ success: true, data: analyticsData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = { role: "user" };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query).select("-password");
    return res
      .status(200)
      .json(new ApiResponse(200, users, "Users retrieved successfully"));
  } catch (error) {
    console.error(error);
    res.status(500).json(new ApiError(500, error.message));
  }
};

export const getMyClients = async (req, res) => {
  try {
    const userId = req.user.id;

    const { page = 1, limit = 10 } = req.query; // Default page = 1, limit = 10

    // Convert page and limit to numbers
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    // Find the user and populate the my_clients field
    const user = await User.findById(userId).populate("my_clients");

    if (!user) {
      return res.status(404).json(new ApiError(404, "User not found"));
    }

    // Paginate the my_clients array
    const startIndex = (pageNumber - 1) * limitNumber;
    const endIndex = pageNumber * limitNumber;
    const paginatedClients = user.my_clients.slice(startIndex, endIndex);

    // Return the paginated clients along with pagination metadata
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          clients: paginatedClients,
          pagination: {
            currentPage: pageNumber,
            totalPages: Math.ceil(user.my_clients.length / limitNumber),
            totalClients: user.my_clients.length,
          },
        },
        "My clients retrieved successfully"
      )
    );
  } catch (error) {
    console.error(error);
    res.status(500).json(new ApiError(500, error.message));
  }
};
export const newClients = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Calculate default date range (previous 7 days)
    const defaultEndDate = new Date(); // Current date and time
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultEndDate.getDate() - 7); // Subtract 7 days from the current date

    // Use provided dates or default to the last 7 days
    const filterStartDate = startDate ? new Date(startDate) : defaultStartDate;
    const filterEndDate = endDate ? new Date(endDate) : defaultEndDate;

    // Fetch clients with the date filter
    const allClients = await Client.find({
      createdAt: {
        $gte: filterStartDate, // Greater than or equal to the start date
        $lte: filterEndDate, // Less than or equal to the end date
      },
    });

    if (!allClients || allClients.length === 0) {
      return res
        .status(404)
        .json({ message: "No clients found within the specified date range" });
    }

    res.json(allClients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching clients data", error });
  }
};


export const searchUser = async (req, res) => {
  try {
    const { search } = req.query;
    const users = await User.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    }).select("name email");
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching users data", error });
  }
};


