import { Client } from "../models/client.model.js";
import { Review } from "../models/reviews.model.js";
import { User } from "../models/user.model.js";

export const addReview = async (req, res) => {
  try {
    const { user, review, rating, client } = req.body;

    // Validate required fields
    if (!user || !review || !rating || !client) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate user and client existence
    const existingUser = await User.findById(user);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existingClient = await Client.findById(client);
    if (!existingClient) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // Validate rating value
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Create review
    const newReview = await Review.create({
      user,
      review,
      rating,
      client,
    });

    // Add review reference to user
    existingUser.ratings.push(newReview._id);
    await existingUser.save();

    // Recalculate average rating
    const reviews = await Review.find({ user });
    const totalRatings = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRatings / reviews.length;

    // Update avg_rating field
    existingUser.avg_rating = avgRating;
    await existingUser.save();

    return res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: newReview,
    });
  } catch (error) {
    console.error("Error adding review:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const myReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    // Get page and limit from query parameters, with defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch reviews with pagination
    const myReviews = await Review.find({ user: userId })
      .populate({
        path: "client",
        select: "company_name address contact_person contact_email",
      })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination metadata
    const totalReviews = await Review.countDocuments({ user: userId });

    return res.status(200).json({
      success: true,
      message: "Reviews retrieved successfully",
      data: {
        reviews: myReviews,
        pagination: {
          currentPage: page,
          pageSize: limit,
          totalReviews: totalReviews,
          totalPages: Math.ceil(totalReviews / limit),
        },
      },
    });
  } catch (error) {
    console.log("Error in fetching the reviews", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};