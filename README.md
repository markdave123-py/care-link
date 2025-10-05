# Care-Link API Documentation

A comprehensive healthcare management system API that provides authentication, scheduling, session management, and smart recommendation features for patients, health practitioners, and administrators.

## Base URL
```
http://localhost:3000/api/v1
```

## Table of Contents
- [Authentication](#authentication)
  - [Patient Authentication](#patient-authentication)
  - [Health Practitioner Authentication](#health-practitioner-authentication)
  - [Admin Authentication](#admin-authentication)
- [Health Practitioner Types](#health-practitioner-types)
- [Scheduling System](#scheduling-system)
- [Session Management](#session-management)
  - [Patient Sessions](#patient-sessions)
  - [Health Practitioner Sessions](#health-practitioner-sessions)
- [Smart System](#smart-system)
- [Error Handling](#error-handling)
- [Response Format](#response-format)

## Authentication

### Patient Authentication

#### 1. Google OAuth Initialization
```http
GET /auth/patient/google
```

**Description:** Initiates Google OAuth flow for patient login/registration.

**Response:**
```json
{
  "status": "redirect",
  "redirectUrl": "https://accounts.google.com/oauth/authorize?..."
}
```

#### 2. Google OAuth Callback
```http
GET /auth/patient/google/callback
```

**Description:** Handles Google OAuth callback and creates/logs in patient.

**Query Parameters:**
- `code` (string, required): Authorization code from Google

**Response:**
```json
{
  "status": "success",
  "message": "User created successfully",
  "data": {
    "id": "string",
    "email": "patient@example.com",
    "firstname": "John",
    "lastname": "Doe",
    "email_verified": true
  }
}
```

#### 3. Patient Registration
```http
POST /auth/patient/register
```

**Description:** Register a new patient account.

**Request Body:**
```json
{
  "firstname": "John",
  "lastname": "Doe",
  "email": "patient@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "User created successfully",
  "data": {
    "id": "string",
    "email": "patient@example.com",
    "firstname": "John",
    "lastname": "Doe"
  }
}
```

#### 4. Patient Login
```http
POST /auth/patient/login
```

**Description:** Authenticate patient with email and password.

**Request Body:**
```json
{
  "email": "patient@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Logged in successfully",
  "data": {
    "id": "string",
    "email": "patient@example.com",
    "firstname": "John",
    "lastname": "Doe"
  }
}
```

#### 5. Email Verification
```http
GET /auth/patient/verify-user
```

**Description:** Verify patient email address.

**Headers:**
```
Authentication required (cookies)
```

**Response:**
```json
{
  "status": "success",
  "message": "User verified successfully"
}
```

#### 6. Refresh Access Token
```http
POST /auth/patient/refresh-access-token
```

**Description:** Refresh expired access token using refresh token.

**Headers:**
```
Authentication required (cookies)
Cookie: refreshToken=<refresh_token>
```

**Response:**
```json
{
  "status": "success",
  "message": "Access Token refreshed successfully"
}
```

#### 7. Forgot Password
```http
POST /auth/patient/forgot-password
```

**Description:** Send password reset email to patient.

**Headers:**
```
Authentication required (cookies)
```

**Request Body:**
```json
{
  "email": "patient@example.com"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Link to reset password sent successfully"
}
```

#### 8. Reset Password
```http
POST /auth/patient/reset-password
```

**Description:** Reset patient password using token.

**Headers:**
```
Authentication required (cookies)
```

**Request Body:**
```json
{
  "password": "newpassword123"
}
```

**Query Parameters:**
- `token` (string, required): Password reset token

**Response:**
```json
{
  "status": "success",
  "message": "Password Reset successful"
}
```

#### 9. Logout
```http
POST /auth/patient/logout
```

**Description:** Logout patient and clear authentication tokens.

**Headers:**
```
Authentication required (cookies)
```

**Response:**
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

### Health Practitioner Authentication

#### 1. Google OAuth Initialization
```http
GET /auth/hp/google
```

**Description:** Initiates Google OAuth flow for health practitioner login/registration.

#### 2. Google OAuth Callback
```http
GET /auth/hp/google/callback
```

**Description:** Handles Google OAuth callback for health practitioners.

#### 3. Health Practitioner Registration
```http
POST /auth/hp/register
```

**Description:** Register a new health practitioner account.

**Request Body:**
```json
{
  "firstname": "Dr. Jane",
  "lastname": "Smith",
  "hp_type_id": "uuid-string",
  "email": "doctor@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "User created successfully",
  "data": {
    "id": "string",
    "email": "doctor@example.com",
    "firstname": "Dr. Jane",
    "lastname": "Smith",
    "hp_type_id": "uuid-string"
  }
}
```

#### 4. Health Practitioner Login
```http
POST /auth/hp/login
```

**Description:** Authenticate health practitioner.

**Request Body:**
```json
{
  "email": "doctor@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "User Logged in successfully",
  "data": {
    "id": "string",
    "email": "doctor@example.com",
    "firstname": "Dr. Jane",
    "lastname": "Smith"
  }
}
```

#### 5. Email Verification
```http
GET /auth/hp/verify-user
```

**Description:** Verify health practitioner email address.

**Headers:**
```
Authentication required (cookies)
```

#### 6. Refresh Access Token
```http
POST /auth/hp/refresh-access-token
```

**Description:** Refresh expired access token.

**Headers:**
```
Authentication required (cookies)
```

#### 7. Forgot Password
```http
POST /auth/hp/forgot-password
```

**Description:** Send password reset email.

**Request Body:**
```json
{
  "email": "doctor@example.com"
}
```

#### 8. Reset Password
```http
POST /auth/hp/reset-password
```

**Description:** Reset health practitioner password.

**Request Body:**
```json
{
  "password": "newpassword123"
}
```

**Query Parameters:**
- `token` (string, required): Password reset token

#### 9. Logout
```http
POST /auth/hp/logout
```

**Description:** Logout health practitioner.

**Headers:**
```
Authentication required (cookies)
```

### Admin Authentication

#### 1. Google OAuth Initialization
```http
GET /auth/admin/google
```

**Description:** Initiates Google OAuth flow for admin login/registration.

#### 2. Google OAuth Callback
```http
GET /auth/admin/google/callback
```

**Description:** Handles Google OAuth callback for admins.

#### 3. Admin Registration
```http
POST /auth/admin/register
```

**Description:** Register a new admin account.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "firstname": "Admin",
  "lastname": "User",
  "password": "password123"
}
```

#### 4. Admin Login
```http
POST /auth/admin/login
```

**Description:** Authenticate admin user.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

#### 5. Request Admin Privileges
```http
POST /auth/admin/request-admin
```

**Description:** Request admin privileges for existing user.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

#### 6. Invite Admin
```http
POST /auth/admin/invite-admin
```

**Description:** Accept admin invitation using invite token.

**Query Parameters:**
- `token` (string, required): Admin invitation token

**Request Body:**
```json
{
  "firstname": "Admin",
  "lastname": "User",
  "password": "password123"
}
```

#### 7. Refresh Access Token
```http
POST /auth/admin/refresh-access-token
```

**Description:** Refresh expired access token.

**Headers:**
```
Authentication required (cookies)
```

#### 8. Logout
```http
POST /auth/admin/logout
```

**Description:** Logout admin user.

**Headers:**
```
Authentication required (cookies)
```

## Health Practitioner Types

#### 1. Create Health Practitioner Type
```http
POST /hptype/type
```

**Description:** Create a new health practitioner type (Admin only).

**Request Body:**
```json
{
  "profession": "Cardiologist"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Created a new hptype successfully",
  "data": {
    "id": "uuid-string",
    "name": "Cardiologist"
  }
}
```

#### 2. Get All Health Practitioner Types
```http
GET /hptype/
```

**Description:** Retrieve all health practitioner types.

**Response:**
```json
{
  "status": "success",
  "message": "All Health Practitioner Types",
  "data": [
    {
      "id": "uuid-string",
      "name": "Cardiologist"
    },
    {
      "id": "uuid-string",
      "name": "Dermatologist"
    }
  ]
}
```

## Scheduling System

#### 1. Get Health Practitioner Schedule
```http
GET /schedule/:hp_id/working-hours
```

**Description:** Get working hours for a specific health practitioner.

**Path Parameters:**
- `hp_id` (string, required): Health practitioner ID

**Response:**
```json
{
  "status": "success",
  "message": "working hours retrieved",
  "data": [
    {
      "dow": 1,
      "starts": "09:00:00",
      "ends": "17:00:00"
    }
  ]
}
```

#### 2. Update Health Practitioner Schedule
```http
PUT /schedule/hp/working-hours
```

**Description:** Update working hours for authenticated health practitioner.

**Headers:**
```
Authentication required (cookies)
```

**Request Body:**
```json
{
  "schedule": [
    {
      "dow": 1,
      "start": "09:00",
      "end": "17:00"
    },
    {
      "dow": 2,
      "start": "10:00",
      "end": "16:00"
    }
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Working hours saved",
  "data": [
    {
      "dow": 1,
      "start": "09:00",
      "end": "17:00"
    }
  ]
}
```

## Session Management

### Patient Sessions

#### 1. Request Session
```http
POST /patient-sessions/request
```

**Description:** Request a new session with a health practitioner.

**Headers:**
```
Authentication required (cookies)
```

**Request Body:**
```json
{
  "patient_symptoms": "Headache and fever",
  "hp_id": "hp-uuid-string",
  "ongoing_medication": "Aspirin 100mg",
  "time": "2024-01-15T10:00:00Z"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Session request created successfully",
  "data": {
    "id": "request-uuid",
    "patient_id": "patient-uuid",
    "health_practitioner_id": "hp-uuid",
    "patient_symptoms": "Headache and fever",
    "status": "pending",
    "start_time": "2024-01-15T10:00:00Z",
    "end_time": "2024-01-15T10:30:00Z"
  }
}
```

#### 2. Get Patient Sessions
```http
GET /patient-sessions/
```

**Description:** Get all session requests for authenticated patient.

**Headers:**
```
Authentication required (cookies)
```

**Response:**
```json
{
  "status": "success",
  "message": "Session requests retrieved successfully",
  "data": [
    {
      "id": "request-uuid",
      "patient_symptoms": "Headache and fever",
      "status": "pending",
      "start_time": "2024-01-15T10:00:00Z"
    }
  ]
}
```

#### 3. Cancel Session Request
```http
PATCH /patient-sessions/:requestSession_id/cancel
```

**Description:** Cancel a pending session request.

**Headers:**
```
Authentication required (cookies)
```

**Path Parameters:**
- `requestSession_id` (string, required): Session request ID

**Response:**
```json
{
  "status": "success",
  "message": "Session request cancelled successfully",
  "data": {
    "id": "request-uuid",
    "status": "cancelled"
  }
}
```

#### 4. Rate Session
```http
PATCH /patient-sessions/:id/rate
```

**Description:** Rate a completed session.

**Headers:**
```
Authentication required (cookies)
```

**Path Parameters:**
- `id` (string, required): Session ID

**Request Body:**
```json
{
  "rating": 5
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Session rated successfully",
  "data": {
    "id": "session-uuid",
    "rating": 5
  }
}
```

#### 5. Download Session PDF
```http
GET /patient-sessions/:id/download-session
```

**Description:** Download session details as PDF.

**Headers:**
```
Authentication required (cookies)
```

**Path Parameters:**
- `id` (string, required): Session ID

**Response:** PDF file download

### Health Practitioner Sessions

#### 1. Accept Session Request
```http
PATCH /hp-sessions/:request_session_id/accept-request
```

**Description:** Accept a pending session request.

**Headers:**
```
Authentication required (cookies)
```

**Path Parameters:**
- `request_session_id` (string, required): Session request ID

**Response:**
```json
{
  "status": "success",
  "message": "Session Request accepted successfully!",
  "data": {
    "id": "session-uuid",
    "patient_id": "patient-uuid",
    "health_practitioner_id": "hp-uuid",
    "status": "scheduled",
    "start_time": "2024-01-15T10:00:00Z",
    "end_time": "2024-01-15T10:30:00Z"
  }
}
```

#### 2. Decline Session Request
```http
PATCH /hp-sessions/:request_session_id/decline-request
```

**Description:** Decline a pending session request.

**Headers:**
```
Authentication required (cookies)
```

**Path Parameters:**
- `request_session_id` (string, required): Session request ID

**Request Body:**
```json
{
  "reason": "Schedule conflict"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Session Request declined successfully!"
}
```

#### 3. Start Session
```http
POST /hp-sessions/:sessionId/start-session
```

**Description:** Start a scheduled session.

**Headers:**
```
Authentication required (cookies)
```

**Path Parameters:**
- `sessionId` (string, required): Session ID

**Response:**
```json
{
  "status": "success",
  "message": "Session started successfully!",
  "data": {
    "id": "session-uuid",
    "status": "inprogress"
  }
}
```

#### 4. End Session
```http
PATCH /hp-sessions/:sessionId/end-session
```

**Description:** End a session (requires diagnosis, prescription, and report).

**Headers:**
```
Authentication required (cookies)
```

**Path Parameters:**
- `sessionId` (string, required): Session ID

**Response:**
```json
{
  "status": "success",
  "message": "Session ended successfully!"
}
```

#### 5. Update Session Details
```http
PATCH /hp-sessions/:sessionId/update-session
```

**Description:** Update session diagnosis, prescription, and report.

**Headers:**
```
Authentication required (cookies)
```

**Path Parameters:**
- `sessionId` (string, required): Session ID

**Request Body:**
```json
{
  "health_practitioner_report": "Patient shows improvement",
  "diagnosis": "Common cold",
  "prescription": "Rest and fluids"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Session details updated successfully!"
}
```

#### 6. Create Follow-up Session
```http
POST /hp-sessions/:parentSessionId/create-followup
```

**Description:** Create a follow-up session based on a completed session.

**Headers:**
```
Authentication required (cookies)
```

**Path Parameters:**
- `parentSessionId` (string, required): Parent session ID

**Request Body:**
```json
{
  "time": "2024-01-20T10:00:00Z"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Follow-up session created",
  "data": {
    "id": "followup-session-uuid",
    "parentId": "parent-session-uuid",
    "status": "scheduled",
    "start_time": "2024-01-20T10:00:00Z"
  }
}
```

## Smart System

#### 1. Get Health Practitioners by Symptom
```http
POST /smart-sys/hp-by-symptom
```

**Description:** Get health practitioners that specialize in treating specific symptoms using AI-powered recommendations.

**Request Body:**
```json
{
  "symptom": "chest pain and shortness of breath"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Health Practitioners successfully retrieved",
  "data": [
    {
      "id": "hp-uuid",
      "firstname": "Dr. John",
      "lastname": "Cardio",
      "email": "cardio@example.com",
      "specialty": "Cardiology",
      "similarity_score": 0.95
    }
  ]
}
```

## Admin Management

#### 1. Get All Patients
```http
POST /auth/admin/all-patients
```

**Description:** Get all registered patients (Admin only).

**Response:**
```json
{
  "status": "success",
  "message": "All Patients",
  "data": [
    {
      "id": "patient-uuid",
      "email": "patient@example.com",
      "firstname": "John",
      "lastname": "Doe"
    }
  ]
}
```

#### 2. Get All Health Practitioners
```http
POST /auth/admin/all-hp
```

**Description:** Get all registered health practitioners (Admin only).

**Response:**
```json
{
  "status": "success",
  "message": "All Health Practitioners",
  "data": [
    {
      "id": "hp-uuid",
      "email": "doctor@example.com",
      "firstname": "Dr. Jane",
      "lastname": "Smith"
    }
  ]
}
```

#### 3. Search Patient by Email or Name
```http
POST /auth/admin/patients/search
```

**Description:** Search patients by email or name (Admin only).

**Request Body:**
```json
{
  "email": "patient@example.com",
  "name": "John Doe"
}
```

#### 4. Search Health Practitioner by Email or Name
```http
POST /auth/admin/hp/search
```

**Description:** Search health practitioners by email or name (Admin only).

**Request Body:**
```json
{
  "email": "doctor@example.com",
  "name": "Dr. Smith"
}
```

## Error Handling

The API uses consistent error response format:

```json
{
  "status": "error",
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional error details"
  }
}
```

### Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "status": "success",
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description",
  "error": {
    "code": "SPECIFIC_ERROR_CODE",
    "details": "Additional error information"
  }
}
```

## Authentication

Most endpoints require authentication using httpOnly cookies:

```
Cookie: accessToken=<access_token>; refreshToken=<refresh_token>
```

### Token Management:
- Access tokens expire after 15 minutes
- Refresh tokens expire after 7 days
- Use refresh token endpoint to get new access token
- Tokens are automatically set as httpOnly cookies by the server
- No manual token handling required for authenticated requests

## Rate Limiting

The API implements rate limiting to prevent abuse:
- 100 requests per 15-minute window per IP
- 1000 requests per 15-minute window per authenticated user

## File Upload

For health practitioner registration, the following files can be uploaded:
- `profile_picture` - Profile image
- `passport` - Passport photo
- `idcard` - ID card image

Files should be sent as multipart/form-data.

## WebSocket Support

The API supports real-time communication for:
- Session notifications
- Chat messaging during sessions
- Live session status updates

## Environment Variables

Required environment variables:
- `POSTGRES_URI` - Database connection string
- `JWT_SECRET` - JWT token signing secret
- `JWT_REFRESH_TOKEN_SECRET` - Refresh token secret
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `RABBITMQ_URL` - RabbitMQ connection URL (for email services)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start the development server:
```bash
npm run dev
```

4. The API will be available at `http://localhost:3000/api/v1`

## Support

For API support or questions, please contact the development team or create an issue in the project repository.