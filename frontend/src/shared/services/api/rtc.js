import axios from "./axios";

export const getIceConfig = async () => {
  const response = await axios.get("/api/rtc/ice-config");
  return response.data;
};

