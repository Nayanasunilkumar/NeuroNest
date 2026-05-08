export default async function handler(request, response) {
  const BACKEND_URL = "https://neuronest-backend-2rn0.onrender.com/api/health";
  
  try {
    const start = Date.now();
    const res = await fetch(BACKEND_URL);
    const duration = Date.now() - start;
    
    if (res.ok) {
      return response.status(200).json({
        success: true,
        message: "Backend pinged successfully",
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });
    } else {
      return response.status(500).json({
        success: false,
        message: `Backend returned status: ${res.status}`,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    return response.status(500).json({
      success: false,
      message: "Failed to reach backend",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
