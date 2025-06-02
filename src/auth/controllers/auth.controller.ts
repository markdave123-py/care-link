import type { Request, Response } from "express";
import { buildUrl } from "../utils/google";
import { google } from "../config/oauth";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, GOOGLE_TOKEN_INFO_URL } from "../config/env";

export const initializeGoogleAuth = async (_: Request, res: Response) => {
	const consent_screen = buildUrl(google);
	res.redirect(consent_screen);
};

export const getToken = async (req: Request, res: Response): Promise<void> => {
  console.log(req.query);

  const { code } = req.query;

  const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

  if (
    !GOOGLE_CLIENT_ID ||
    !GOOGLE_CLIENT_SECRET ||
    !GOOGLE_REDIRECT_URI ||
    !code
  ) {
    res.status(400).json({ error: "Missing required OAuth parameters" });
    return;
  }

  try {
    const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code: code as string,
        grant_type: "authorization_code",
        redirect_uri: GOOGLE_REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      // Get error details from the response
      const errorText = await response.text();
      console.error("Token exchange failed:", errorText);
      res.status(400).json({ 
        error: "Token exchange failed",
        details: errorText 
      });
      return;
    }

    const access_token_data = await response.json();
    console.log(access_token_data);

    const { id_token } = access_token_data;

    const token_info_response = await fetch(`${GOOGLE_TOKEN_INFO_URL}?id_token=${id_token}`);

    res.json({
      success: true,
      data: await token_info_response.json()
    });

  } catch (err) {
    console.error("OAuth callback error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};