# <img src="frontend/src/assets/pic.png" width="40" height="40" style="vertical-align: middle; margin-right: 10px;" /> OrbitWorks - Enterprise Management System

OrbitWorks is a comprehensive, role-based Employee Portal and Coordination System built on the MERN (MongoDB, Express, React, Node.js) stack.

---

## Key Features

* **Role-Based Access Control**: Tailored dashboards and permissions for CEO, HR, and standard Employee accounts.
* **Digital ID Badges**: Generates personal employee identification badges with downloadable QR-code images.
* **Gate Attendance Scanner**: Real-time barcode/QR reader utilizing camera inputs and image file uploads.
* **Centralized Chat Suite**: Real-time communication portal for employees.
* **Task Kanban Board**: Set priorities, assign tasks, write comments, and track sprint deadlines.
* **Daily Work Logs**: Simple submission register for employees to log daily task progress updates.
* **Attendance Management**: Logs check-in/out times, tracking Present, WFH, and Late Entry stats.
* **Leave Pipeline**: System for submitting leave requests and allowing HR to approve or deny them.
* **Holiday Calendar**: Lists annual corporate holidays and calculates countdowns to upcoming events.
* **Announcement Board**: Broadcasts company notices and general policy updates.
* **CEO Insights**: Analyzes employee task workloads and identifies burnout risks using wellness scores.
* **Budget Simulator**: Models cost changes, salary calculations, and company funding runway.
* **Document Vault**: Manages uploaded employee personal files and validation proofs securely.
* **Reports Exporter**: Generates styled PDF files and downloadable Excel/CSV spreadsheets for corporate reports.

---

## Tech Stack

* **Frontend**: React.js, Recharts, HTML5-QRCode, Lucide React, Context API.
* **Backend**: Node.js, Express.js, JWT (JSON Web Tokens), Bcryptjs, Nodemailer.
* **Database**: MongoDB (Atlas).

---

## Installation and Setup

### 1. Prerequisites
Ensure you have Node.js and a MongoDB Atlas account ready.

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory and configure the variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_signing_key
   SMTP_HOST=smtp.mailtrap.io
   SMTP_PORT=2525
   SMTP_USER=your_smtp_username
   SMTP_PASS=your_smtp_password
   ADMIN_EMAIL=ceo@orbitworks.com
   ```
4. Seed the Database:
   ```bash
   node scripts/seed.js
   ```
5. Start the backend server:
   ```bash
   node server.js
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm start
   ```
4. Open http://localhost:3000 in your web browser.

---

## Security Practices
* Passwords are hashed using bcryptjs (work factor 10).
* API endpoints are protected with JSON Web Token (JWT) headers.
* All environment secrets (.env) are listed in .gitignore to prevent leakage.
