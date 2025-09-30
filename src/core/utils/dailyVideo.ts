// This util is responsible for creating Daily.co video meetings
import axios from "axios";

const DAILY_API_URL = "https://api.daily.co/v1/rooms";

export const createDailyMeeting = async (
  roomName?: string,
  expMinutes: number = 30
): Promise<string> => {
  try {
    const response = await axios.post(
      DAILY_API_URL,
      {
        name: roomName || `room-${Date.now()}`,
        properties: {
          exp: Math.floor(Date.now() / 1000) + expMinutes * 60, // expires in expMinutes
        //   enable_chat: true,
        //   enable_screenshare: true,
        //   enable_recording: "cloud"
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.url; // meeting link
  } catch (error: any) {
    console.error("Error creating Daily meeting:", error.response?.data || error.message);
    throw new Error("Failed to create Daily meeting");
  }
};
