

import { randomUUID } from "crypto";

export function createJitsiMeeting() {
  // Generate a unique room name
  const roomName = `meeting-${randomUUID()}`;

  // Jitsi public server
  const baseUrl = "https://meet.jit.si";

  // Full meeting link
  const meetingUrl = `${baseUrl}/${roomName}`;

  return {
    meetingUrl,
    participants: 2, // max 2 people (enforced by frontend logic)
  };
}
