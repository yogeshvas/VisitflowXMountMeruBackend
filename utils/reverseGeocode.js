import axios from "axios";
// Function to geocode address
const geocodeAddress = async (address) => {
  const apiKey = "AIzaSyC8zy45f-dWZWg0P4A9mGAZjNlMYTnJRvI"; // Replace with your API key
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    const location = response.data.results[0]?.geometry?.location;
    return location ? [location.lng, location.lat] : null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};
export { geocodeAddress };
