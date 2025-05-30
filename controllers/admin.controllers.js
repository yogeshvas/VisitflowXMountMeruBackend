import { DailyRecord } from "../models/dailyRecord.js";
import { User } from "../models/user.model.js";
import { Visit } from "../models/visit.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const userReport = async(req,res)=>{
    try {
        const email = req.query.email;
  
        const user = await User.findOne({email}).select("name email role total_visits manager").populate({
            path: "manager",
            select: "name email role"
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
       
       return res.status(200).json(new ApiResponse(200, "User found", user));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiError(500, "Unable to fetch user"));
    }
}

export const UserVisits = async (req, res) => {
    try {
        const { email, startDate, endDate } = req.query;
        
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }
        
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        // Build date filter
        const dateFilter = {};
        
        // If no dates provided, default to current month
        if (!startDate && !endDate) {
            const now = new Date();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            
            dateFilter.check_in_time = { 
                $gte: firstDayOfMonth,
                $lte: lastDayOfMonth
            };
        } else {
            // Handle provided date filters
            if (startDate) {
                dateFilter.check_in_time = { $gte: new Date(startDate) };
            }
            
            if (endDate) {
                if (dateFilter.check_in_time) {
                    dateFilter.check_in_time.$lte = new Date(endDate);
                } else {
                    dateFilter.check_in_time = { $lte: new Date(endDate) };
                }
            }
        }
        
        // Query for the visits of this user within the date range
        const visits = await Visit.find({
            sales_rep: user._id,
            ...dateFilter
        })
        .populate({
            path: 'client',
            select: 'company_name address contact_person category status'
        })
        .sort({ check_in_time: 1 });
        
        // Group visits by date
        const visitsByDate = {};
        
        visits.forEach(visit => {
            // Format date as YYYY-MM-DD for grouping
            const visitDate = new Date(visit.check_in_time).toISOString().split('T')[0];
            
            if (!visitsByDate[visitDate]) {
                visitsByDate[visitDate] = [];
            }
            
            visitsByDate[visitDate].push({
                _id: visit._id,
                client: visit.client,
                check_in_time: visit.check_in_time,
                duration: visit.duration,
                comments: visit.comments,
                createdAt: visit.createdAt
            });
        });
        
        return res.status(200).json({
            success: true,
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    total_visits: visits.length
                },
                visitsByDate
            }
        });
        
    } catch (error) {
        console.error("Error fetching user visits:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch user visits",
            error: error.message
        });
    }
}

export const getUserAttendance = async (req, res) => {
    try {
        const { email, startDate, endDate } = req.query;
        
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }
        
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        // Build date filter
        const dateFilter = {};
        
        // If no dates provided, default to current month
        if (!startDate && !endDate) {
            const now = new Date();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            
            dateFilter.createdAt = { 
                $gte: firstDayOfMonth,
                $lte: lastDayOfMonth
            };
        } else {
            // Handle provided date filters
            if (startDate) {
                dateFilter.createdAt = { $gte: new Date(startDate) };
            }
            
            if (endDate) {
                if (dateFilter.createdAt) {
                    dateFilter.createdAt.$lte = new Date(endDate);
                } else {
                    dateFilter.createdAt = { $lte: new Date(endDate) };
                }
            }
        }
        
        // Query for the attendance records of this user within the date range
        const attendanceRecords = await DailyRecord.find({
            user: user._id,
            ...dateFilter
        }).sort({ createdAt: 1 });
        
        // Group records by date
        const attendanceByDate = {};
        let totalKmTravelled = 0;
        
        attendanceRecords.forEach(record => {
            // Format date as YYYY-MM-DD for grouping
            const recordDate = new Date(record.createdAt).toISOString().split('T')[0];
            
            if (!attendanceByDate[recordDate]) {
                attendanceByDate[recordDate] = [];
            }
            
            // Add record to its corresponding date
            attendanceByDate[recordDate].push({
                _id: record._id,
                startDateTime: record.startDateTime,
                endDateTime: record.endDateTime,
                startLocation: record.startLocation,
                endLocation: record.endLocation,
                kmTravelled: record.kmTravelled || 0,
                createdAt: record.createdAt,
                updatedAt: record.updatedAt
            });
            
            // Add to total km travelled
            totalKmTravelled += (record.kmTravelled || 0);
        });
        
        return res.status(200).json({
            success: true,
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                summary: {
                    totalRecords: attendanceRecords.length,
                    totalKmTravelled: totalKmTravelled,
                    daysLogged: Object.keys(attendanceByDate).length
                },
                attendanceByDate
            }
        });
        
    } catch (error) {
        console.error("Error fetching user attendance:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch user attendance records",
            error: error.message
        });
    }
}
