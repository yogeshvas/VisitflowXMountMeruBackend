import { Client } from "../models/client.model.js";
import { Task } from "../models/tasks.model.js";
import { User } from "../models/user.model.js";
import { sendTaskAssignmentToUserEmail, sendTaskNotificationToClientEmail } from "../utils/emails/emailActions.js";

export const assignTask = async (req, res) => {
    try {
        const { userId, type, clientId, task, description, date, time, product } = req.body;
        
        if (!userId || !type || !clientId || !task || !description || !date || !time || !product) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        const [user, client] = await Promise.all([
            User.findById(userId),
            Client.findById(clientId)
        ]);
        console.log(user);
        console.log(client);
    
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        if(!client){
            return res.status(400).json({ message: "Client not found" });
        }

        const taskData = {
            user: userId,
            type,
            client: clientId,
            description,
            date,
            time,
            product
        };

        const newTask = await Task.create(taskData);
        await User.findByIdAndUpdate(userId, { $push: { tasks: newTask._id } });

        // Prepare task details for emails
        const taskDetails = {
            type,
            product,
            description,
            date,
            time
        };

        // Send emails to user and client
        await Promise.all([
            sendTaskAssignmentToUserEmail(user.email, client.company_name, taskDetails),
            sendTaskNotificationToClientEmail(client.contact_email, user.name, taskDetails, user.name)
        ]);

        return res.status(201).json({ 
            message: "Task assigned successfully", 
            task: newTask 
        });

    } catch (error) {
        console.error("Error assigning task:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const myTasks = async (req, res) => {
    try {
      const { id } = req.user;
      const { startDate, endDate } = req.query; // Get dates from query parameters
      
      // Validate date inputs
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Both startDate and endDate are required" });
      }
      
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0); // Start of day
      
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // End of day
      
      
      console.log(start);
      console.log(end);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      // Find user and populate tasks, then filter
      const user = await User.findById(id).populate({
        path: 'tasks',
        match: {
          date: { 
            $gte: start, 
            $lte: end 
          }
        },
        populate: {
          path: 'client',
          model: 'Client',
          select: 'company_name address contact_person contact_email contact_phone'
        }
      });
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user.tasks);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching tasks", error });
    }
  }

  export const changeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }
        const task = await Task.findByIdAndUpdate(id, { status }, { new: true });
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        return res.status(200).json({ message: "Task status updated successfully", task });
    } catch (error) {
        console.error("Error updating task status:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}