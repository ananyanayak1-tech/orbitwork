# <img src="frontend/src/assets/pic.png" width="40" height="40" style="vertical-align: middle; margin-right: 10px;" /> OrbitWorks - Enterprise Management System

OrbitWorks is a comprehensive, role-based Employee Portal and Coordination System built on the **MERN (MongoDB, Express, React, Node.js)** stack. It integrates attendance registers, task delegation boards, automated onboarding checklists, recruitment trackers, financial simulators, and dynamic reporting tools into a single responsive dashboard.

---

## 🚀 Key Features

### 🔑 Role-Based Access Control (RBAC)
The system adapts its interface dynamically depending on the authenticated user's role:
*   **CEO & Founder Panel**: Access to overall company analytics, department budgeting, cost simulation, project logs, and productivity leaderboards.
*   **HR & Admin Panel**: Manage employee records, log manual attendance, approve/deny leave requests, organize onboarding checklists, and track applicants in the recruitment pipeline.
*   **Employee Portal**: View assigned tasks, register daily check-ins/check-outs, submit leaves, log daily progress, view wellness metrics, and download digital ID badges.

### 📅 QR-Code Entrance Gate Scanner
*   **Digital Badges**: Employees can generate and download a unique QR-code ID badge containing their encrypted Employee ID.
*   **Gate Scanner**: HR can scan badges using a browser camera link or by uploading badge image files to instantly check employees in/out.

### 📊 CEO Insights & Budget Simulator
*   **Financial Runway**: Simulate hire/fire scenarios, adjust operational budgets, and track monthly burn rate and runway stats.
*   **Productivity Metrics**: Tracks average days taken to complete tasks and rates team productivity.

### 📝 Document & Report Exports
*   **Excel/CSV Exports**: Instantly download compliance and performance data logs in spreadsheet formats.
*   **PDF Exporter**: Print styled corporate summary reports directly from the CEO dashboard.

---

## 🛠️ Tech Stack

*   **Frontend**: React.js, Recharts (Data Visualizations), HTML5-QRCode (Computer Vision scanning), Lucide React (Icons), Context API.
*   **Backend**: Node.js, Express.js, JWT (JSON Web Tokens) Authentication, Bcryptjs (Password encryption), Nodemailer (Email notifications).
*   **Database**: MongoDB (Atlas cloud database).

---

## ⚙️ Installation & Setup

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) and a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account ready.

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
4. **Seed the Database** (Sets up default CEO, HR, and Employee accounts with secure default passwords):
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
4. Open `http://localhost:3000` in your web browser.

---

## 🔒 Security Practices
*   Passwords are never stored in plain text. They are hashed using **bcryptjs** (work factor 10).
*   API endpoints are protected with **JSON Web Token (JWT)** auth headers.
*   All environment secrets (`.env`) are listed in `.gitignore` to prevent leakage.
