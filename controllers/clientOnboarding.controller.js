import multer from "multer";
import cloudinary from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import ClientOnboarding from "../models/client-onboarding.model.js";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up Multer storage with Cloudinary for client documents
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "client-documents",
    allowed_formats: ["jpg", "jpeg", "png", "pdf", "doc", "docx"],
    // No transformation for documents as they can be various formats
  },
});

const upload = multer({ storage: storage });

// Middleware for handling multiple file uploads (doc1 and doc2)
const uploadDocuments = upload.fields([
  { name: "doc1", maxCount: 1 },
  { name: "doc2", maxCount: 1 },
]);

// Create a new client onboarding
const createClientOnboarding = async (req, res) => {
  try {
    const { clientName, email, phoneNumber, comment } = req.body;
    
    // Check if required files are uploaded
    if (!req.files || !req.files.doc1) {
      return res.status(400).json({ message: "Document 1 is required" });
    }
    console.log(req.user.id)
    const newClientOnboarding = new ClientOnboarding({
      clientName,
      email,
      phoneNumber,
      comment: comment || "",
      doc1: req.files.doc1[0].path, // Cloudinary URL for doc1
      doc2: req.files.doc2 ? req.files.doc2[0].path : undefined, // Optional doc2
      userId: req.user.id, // From authentication middleware
      status: "pending", // Default status
    });

    await newClientOnboarding.save();
    res.status(201).json(newClientOnboarding);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all client onboardings with pagination
const getAllClientOnboardings = async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Status filter if provided
    const statusFilter = req.query.status ? { status: req.query.status } : {};
    
    // Get total count for pagination info
    const totalCount = await ClientOnboarding.countDocuments(statusFilter);
    
    // Fetch clients with pagination and sorting
    const clients = await ClientOnboarding.find(statusFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit).populate("userId", "name email"); // Populate userId with name and email
    console.log(clients);
    res.status(200).json({
      clients,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalItems: totalCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get my clients (for logged in user)
const getMyClients = async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Status filter if provided + user filter
    const filter = { 
      userId: req.user.id,
      ...(req.query.status ? { status: req.query.status } : {})
    };
    
    // Get total count for pagination info
    const totalCount = await ClientOnboarding.countDocuments(filter);
    
    // Fetch clients with pagination and sorting
    const clients = await ClientOnboarding.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit).populate("userId", "name email");
    
    res.status(200).json({
      clients,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalItems: totalCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search clients by email, phone number, or name
const searchClients = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }
    
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build search filter
    let filter = {};
    
    // Regular user can only search their own clients, admin can search all
    if (!req.user) {
      filter.userId = req.user.id;
    }
    
    // Add search criteria - using regex for partial matches
    filter.$or = [
      { email: { $regex: query, $options: 'i' } },
      { phoneNumber: { $regex: query, $options: 'i' } },
      { clientName: { $regex: query, $options: 'i' } }
    ];
    
    // Status filter if provided
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Get total count for pagination info
    const totalCount = await ClientOnboarding.countDocuments(filter);
    
    // Fetch clients with pagination and sorting
    const clients = await ClientOnboarding.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit).populate("userId", "name email");
    
    res.status(200).json({
      clients,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalItems: totalCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single client onboarding by ID
const getClientOnboardingById = async (req, res) => {
  try {
    const client = await ClientOnboarding.findById(req.params.id).populate("userId", "name email");
    
    if (!client) {
      return res.status(404).json({ message: "Client onboarding not found" });
    }
    

    
    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a client onboarding
const updateClientOnboarding = async (req, res) => {
  try {
    const { clientName, email, phoneNumber, status, comment } = req.body;
    const updateData = { clientName, email, phoneNumber };
    
    // Add comment if provided
    if (comment !== undefined) {
      updateData.comment = comment;
    }

    // If status is provided and user is admin, update status
    if (status ) {
      updateData.status = status;
    }

    // Check if client exists and user is authorized
    const client = await ClientOnboarding.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: "Client onboarding not found" });
    }
    
   

    // Handle document updates if new files are uploaded
    if (req.files) {
      // If new doc1 is uploaded
      if (req.files.doc1) {
        updateData.doc1 = req.files.doc1[0].path;
        
        // Delete old doc1 from Cloudinary if it exists
        if (client.doc1) {
          const publicId = client.doc1.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(`client-documents/${publicId}`);
        }
      }
      
      // If new doc2 is uploaded
      if (req.files.doc2) {
        updateData.doc2 = req.files.doc2[0].path;
        
        // Delete old doc2 from Cloudinary if it exists
        if (client.doc2) {
          const publicId = client.doc2.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(`client-documents/${publicId}`);
        }
      }
    }

    const updatedClient = await ClientOnboarding.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.status(200).json(updatedClient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a client onboarding
const deleteClientOnboarding = async (req, res) => {
  try {
    const client = await ClientOnboarding.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ message: "Client onboarding not found" });
    }
    
    
    // Delete documents from Cloudinary
    if (client.doc1) {
      const publicId1 = client.doc1.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`client-documents/${publicId1}`);
    }
    
    if (client.doc2) {
      const publicId2 = client.doc2.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`client-documents/${publicId2}`);
    }
    
    await ClientOnboarding.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: "Client onboarding deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update client status (for admin)
const updateClientStatus = async (req, res) => {
  try {
    const { status, comment } = req.body;
    const updateData = {};
    
    // Validate status value if provided
    if (status) {
      if (!["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      updateData.status = status;
    }
    
    // Add comment if provided
    if (comment !== undefined) {
      updateData.comment = comment;
    }
    

    
    
    const updatedClient = await ClientOnboarding.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!updatedClient) {
      return res.status(404).json({ message: "Client onboarding not found" });
    }
    
    res.status(200).json(updatedClient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  createClientOnboarding,
  getAllClientOnboardings,
  getMyClients,
  getClientOnboardingById,
  updateClientOnboarding,
  deleteClientOnboarding,
  updateClientStatus,
  searchClients,
  uploadDocuments,
};