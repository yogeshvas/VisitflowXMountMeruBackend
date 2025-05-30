import { DailyRecord } from "../models/dailyRecord.js";
import { Visit } from "../models/visit.model.js";
import moment from "moment";
import { calculateTotalDistance } from "../utils/roadDistanceTravelled.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const startAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { lat, lng } = req.body;

    // Check if a daily record already exists for today
    const today = moment().startOf("day").toDate();
    const existingRecord = await DailyRecord.findOne({
      user: userId,
      startDateTime: { $gte: today },
    });

    if (existingRecord) {
      return res.status(400).json({ message: "Trip already started today" });
    }

    // Create new daily record
    const dailyRecord = new DailyRecord({
      user: userId,
      startDateTime: new Date(),
      startLocation: { lat, lng },
      kmTravelled: 0 // Initialize with 0
    });

    await dailyRecord.save();
    res.status(201).json({ message: "Attendance started", dailyRecord });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const endAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { lat, lng } = req.body;

    // Find the user's active daily record (started but not ended)
    const today = moment().startOf("day").toDate();
    const dailyRecord = await DailyRecord.findOne({
      user: userId,
      startDateTime: { $gte: today },
      endDateTime: { $exists: false }
    });

    if (!dailyRecord) {
      return res.status(400).json({ message: "No active trip found" });
    }

    // Set end time and location
    dailyRecord.endDateTime = new Date();
    dailyRecord.endLocation = { lat, lng };

    // Calculate and update distance including all visits
    await calculateDailyDistance(dailyRecord, userId, true);

    res.status(200).json({
      message: "Attendance ended",
      dailyRecord
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDailyRecords = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = moment().startOf("day").toDate();

    // Find the daily record for today
    const dailyRecord = await DailyRecord.findOne({
      user: userId,
      startDateTime: { $gte: today }
    });

    if (!dailyRecord) {
      return res.status(200).json({ 
        status: "not_started",
        message: "Attendance not started for today",
        kmTravelled: 0
      });
    }

    // Fetch all visits for the day
    const visits = await Visit.find({
      sales_rep: userId,
      check_in_time: { $gte: dailyRecord.startDateTime }
    }).populate("client");

    // Determine status based on existing fields
    const status = dailyRecord.endDateTime ? "completed" : "active";

    // Calculate distance (for active trips, include up to last client)
    await calculateDailyDistance(dailyRecord, userId, status === "completed");

    res.status(200).json({
      status,
      message: status === "active" 
        ? "Trip is active (not ended yet)" 
        : "Trip completed for today",
      dailyRecord,
      visits,
      kmTravelled: dailyRecord.kmTravelled || 0
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAttendanceStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = moment().startOf("day").toDate();

    const dailyRecord = await DailyRecord.findOne({
      user: userId,
      startDateTime: { $gte: today }
    });

    let status = "not_started";
    let message = "Attendance not started for today";
    let kmTravelled = 0;

    if (dailyRecord) {
      status = dailyRecord.endDateTime ? "completed" : "active";
      message = status === "active" 
        ? "Attendance started but not ended" 
        : "Attendance completed for today";
      
      // For active trips, calculate distance up to last client
      if (status === "active") {
        await calculateDailyDistance(dailyRecord, userId, false);
      }
      kmTravelled = dailyRecord.kmTravelled || 0;
    }

    res.status(200).json({
      status,
      message,
      date: new Date(),
      kmTravelled,
      hasStarted: status !== "not_started",
      hasEnded: status === "completed",
      dailyRecord: dailyRecord || null
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to calculate distance
async function calculateDailyDistance(dailyRecord, userId, includeEndLocation) {
  // Fetch all visits for the day
  const visits = await Visit.find({
    sales_rep: userId,
    check_in_time: { $gte: dailyRecord.startDateTime }
  }).populate("client");

  // Extract locations for distance calculation
  let waypoints = [{ 
    lat: dailyRecord.startLocation.lat, 
    lng: dailyRecord.startLocation.lng 
  }];

  visits.forEach((visit) => {
    if (visit.client?.location?.coordinates) {
      waypoints.push({ 
        lat: visit.client.location.coordinates[1], 
        lng: visit.client.location.coordinates[0] 
      });
    }
  });

  // If including end location and it exists
  if (includeEndLocation && dailyRecord.endLocation) {
    waypoints.push({ 
      lat: dailyRecord.endLocation.lat, 
      lng: dailyRecord.endLocation.lng 
    });
  }

  // Calculate total distance only if we have at least 2 points
  if (waypoints.length >= 2) {
    const totalDistance = await calculateTotalDistance(waypoints);
    dailyRecord.kmTravelled = totalDistance;
    await dailyRecord.save();
  } else if (waypoints.length === 1) {
    // Only start location exists
    dailyRecord.kmTravelled = 0;
    await dailyRecord.save();
  }

  return dailyRecord;
}


export const getReportFromTimestamp = async (req, res) => {
  try {
    const { id } = req.user;
    const { startDate, endDate } = req.body;
    
    // Validate the input dates
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Both startDate and endDate are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end day

    // Find all daily records for the user within the date range
    const records = await DailyRecord.find({
      user: id,
      $or: [
        { 
          startDateTime: { 
            $gte: start, 
            $lte: end 
          } 
        },
        { 
          endDateTime: { 
            $gte: start, 
            $lte: end 
          } 
        },
        { 
          $and: [
            { startDateTime: { $lte: start } },
            { endDateTime: { $gte: end } }
          ]
        }
      ]
    }).sort({ startDateTime: 1 });

    // Get all visits within this period with only essential client fields
    const visits = await Visit.find({
      sales_rep: id,
      check_in_time: { 
        $gte: start,
        $lte: end
      }
    }).populate({
      path: 'client',
      select: 'company_name address contact_person contact_phone location category status' // Only include these fields
    }).sort({ check_in_time: 1 });

    // Create a date-wise structure for the report
    const dateMap = {};
    let totalKm = 0;
    let totalVisits = 0;
    let totalDuration = 0;

    // Process each record
    records.forEach(record => {
      const recordDate = moment(record.startDateTime).format('YYYY-MM-DD');
      
      if (!dateMap[recordDate]) {
        dateMap[recordDate] = {
          date: recordDate,
          startTime: record.startDateTime,
          endTime: record.endDateTime,
          kmTravelled: record.kmTravelled || 0,
          visits: [],
          visitCount: 0,
          totalDuration: 0,
          locations: []
        };
        
        // Add start location
        if (record.startLocation) {
          dateMap[recordDate].locations.push({
            type: 'start',
            coordinates: [record.startLocation.lng, record.startLocation.lat],
            time: record.startDateTime
          });
        }
      } else {
        // Update existing date entry if needed
        dateMap[recordDate].kmTravelled += record.kmTravelled || 0;
        if (record.startLocation) {
          dateMap[recordDate].locations.push({
            type: 'start',
            coordinates: [record.startLocation.lng, record.startLocation.lat],
            time: record.startDateTime
          });
        }
      }
      
      // Add end location if exists
      if (record.endLocation) {
        dateMap[recordDate].locations.push({
          type: 'end',
          coordinates: [record.endLocation.lng, record.endLocation.lat],
          time: record.endDateTime
        });
        dateMap[recordDate].endTime = record.endDateTime;
      }
      
      totalKm += record.kmTravelled || 0;
    });

    // Process each visit and assign to the appropriate date
    visits.forEach(visit => {
      const visitDate = moment(visit.check_in_time).format('YYYY-MM-DD');
      
      if (!dateMap[visitDate]) {
        dateMap[visitDate] = {
          date: visitDate,
          startTime: null,
          endTime: null,
          kmTravelled: 0,
          visits: [],
          visitCount: 0,
          totalDuration: 0,
          locations: []
        };
      }
      
      // Create simplified visit object
      const simplifiedVisit = {
        client: {
          _id: visit.client._id,
          company_name: visit.client.company_name,
          address: visit.client.address,
          contact_person: visit.client.contact_person,
          contact_phone: visit.client.contact_phone,
          category: visit.client.category,
          status: visit.client.status,
          location: visit.client.location
        },
        check_in_time: visit.check_in_time,
        duration: visit.duration,
        comments: visit.comments
      };
      
      dateMap[visitDate].visits.push(simplifiedVisit);
      dateMap[visitDate].visitCount++;
      dateMap[visitDate].totalDuration += visit.duration || 0;
      totalVisits++;
      totalDuration += visit.duration || 0;
      
      // Add visit location if client has coordinates
      if (visit.client?.location?.coordinates) {
        dateMap[visitDate].locations.push({
          type: 'visit',
          client: visit.client._id,
          clientName: visit.client.company_name,
          coordinates: visit.client.location.coordinates,
          time: visit.check_in_time
        });
      }
    });

    // Convert dateMap to array sorted by date
    const dailyReports = Object.values(dateMap).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    // Calculate working hours for each day
    dailyReports.forEach(day => {
      if (day.startTime && day.endTime) {
        const start = moment(day.startTime);
        const end = moment(day.endTime);
        day.workingHours = end.diff(start, 'hours', true).toFixed(2);
      } else if (day.startTime) {
        const end = moment().isBefore(moment(day.date).endOf('day')) 
          ? moment() 
          : moment(day.date).endOf('day');
        day.workingHours = end.diff(moment(day.startTime), 'hours', true).toFixed(2);
      }
    });

    // Calculate overall statistics
    const totalWorkingDays = dailyReports.filter(day => day.startTime).length;
    const averageKmPerDay = totalWorkingDays > 0 ? (totalKm / totalWorkingDays).toFixed(2) : 0;
    const averageVisitsPerDay = totalWorkingDays > 0 ? (totalVisits / totalWorkingDays).toFixed(2) : 0;
    const averageDurationPerVisit = totalVisits > 0 ? (totalDuration / totalVisits).toFixed(2) : 0;

    res.status(200).json(
      new ApiResponse(200,{ data: {
        summary: {
          totalKm,
          totalVisits,
          totalDuration,
          totalWorkingDays,
          averageKmPerDay,
          averageVisitsPerDay,
          averageDurationPerVisit,
          dateRange: {
            start: startDate,
            end: endDate,
            days: moment(end).diff(moment(start), 'days') + 1
          }
        },
        dailyReports
      }},"Data Fetched Successfully")
    );
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};