import axios from "axios";
import dotenv from "dotenv";
dotenv.config()

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
export const calculateTotalDistance = async (waypoints) => {
    try {
      let totalDistance = 0;
  
      for (let i = 0; i < waypoints.length - 1; i++) {
        const origin = `${waypoints[i].lat},${waypoints[i].lng}`;
        const destination = `${waypoints[i + 1].lat},${waypoints[i + 1].lng}`;
  
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${GOOGLE_MAPS_API_KEY}`
        );
  
        const distance = response.data.rows[0].elements[0].distance.value / 1000; // Convert to KM
        totalDistance += distance;
      }
  
      return totalDistance;
    } catch (error) {
      console.error("Error fetching distance:", error.message);
      return 0;
    }
  };