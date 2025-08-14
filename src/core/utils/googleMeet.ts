import express, { Request, Response } from "express";
import { google, calendar_v3 } from "googleapis";
import * as dotenv from "dotenv";

dotenv.config();

// const app = express();
// app.use(express.json());

// OAuth2 setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID as string,
  process.env.GOOGLE_CLIENT_SECRET as string,
  process.env.GOOGLE_REDIRECT_URI as string
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN as string,
});

const calendar = google.calendar({ version: "v3", auth: oauth2Client });

// Function to create Google Meet event
export async function createGoogleMeetEvent(
  summary: string,
  startTime: string,
  endTime: string
): Promise<string | undefined> {
  const event: calendar_v3.Schema$Event = {
    summary,
    start: { dateTime: startTime, timeZone: "Africa/Lagos" },
    end: { dateTime: endTime, timeZone: "Africa/Lagos" },
    conferenceData: {
      createRequest: {
        requestId: String(Date.now()),
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };

  const response = await calendar.events.insert({
    calendarId: "primary",
    resource: event,
    conferenceDataVersion: 1,
  });

  return response.data.hangoutLink; // Google Meet link
}


