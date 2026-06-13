# URL Shortener — Katomaran Hackathon 2026

LinkSnip is a secure, high-performance, full-stack URL shortener application. It allows registered users to create shortened links, set optional expiration dates, use custom aliases, download base64 QR codes, and monitor redirection analytics (including click trend timelines and visitor IP/User-Agent data).

---

## ✨ Features

- **User Authentication**: Secure signup and login flow protected by JSON Web Token (JWT) credentials.
- **Custom Aliases**: Users can supply their own clean aliases or default to unique 7-character generated short codes.
- **Link Expiration**: Set an optional expiration timestamp after which the short link automatically deactivates.
- **Click Tracking & Statistics**: Stores visit timestamps, IP addresses, and user-agent metadata.
- **QR Code Generator**: Generates base64 QR codes dynamically for immediate viewing and download.
- **Daily Trend Timeline**: Interactive bar charts tracking visitor traffic over the last 7 days.
- **Responsive Dashboard**: Premium Tailwind CSS interface supporting desktop, tablet, and mobile views.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Recharts, Lucide React, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcryptjs
- **QR Code**: qrcode npm package

---

## 📁 Project Structure

```text
url-shortener/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   └── urlController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   └── Url.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── redirect.js
│   │   └── urls.js
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── UrlCard.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Analytics.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Signup.jsx
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
└── .gitignore
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+ or later
- MongoDB instance running locally (defaulting to port `27017`)

---

### Backend Setup

1. Open your terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```
4. Verify/edit values in `.env` (details below).
5. Start development server:
   ```bash
   npm run dev
   ```

---

### Frontend Setup

1. Open your terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Launch development local server:
   ```bash
   npm run dev
   ```

---

### Environment Variables

Create a `.env` file in the `backend/` directory based on `.env.example`:

| Key | Description | Example Value |
| :--- | :--- | :--- |
| `PORT` | Local port backend server binds to | `5000` |
| `MONGO_URI` | Connection URI pointing to MongoDB | `mongodb://localhost:27017/urlshortener` |
| `JWT_SECRET` | Secret key used to sign JWTs | `your_secret_hash` |
| `BASE_URL` | Base redirection redirection target | `http://localhost:5000` |
| `CLIENT_URL` | Cross-Origin authorized client URL | `http://localhost:5173` |

---

## 🔌 API Endpoints

### Auth Endpoint `/api/auth`
- `POST /signup` — Register a new account.
- `POST /login` — Authenticate and issue JWT.
- `GET /me` — Fetch currently logged-in user details (Protected).

### Urls Endpoint `/api/urls`
- `POST /` — Create a shortened URL (Protected).
- `GET /` — List URLs of currently authenticated user (Protected).
- `PUT /:id` — Update destination URL mapping (Protected, Owner only).
- `DELETE /:id` — Delete a shortened URL entry (Protected, Owner only).
- `GET /:id/analytics` — Fetch clicks counter, last-visited timestamp, and daily trend logs (Protected, Owner only).
- `GET /:id/qr` — Generate QR code base64 source PNG image (Protected, Owner only).

### Redirection Fallback `/`
- `GET /:shortCode` — Fallback route performing redirects. Increments click counter and records IP/UA metadata.

---

## 📐 Architecture Diagram

```text
  +------------------+                   +------------------+
  |                  |    HTTP API       |                  |
  |  React Frontend  |------------------>|  Express Server  |
  |  (Vite + CSS)    |<------------------|  (Node.js App)   |
  |                  |    JSON / Token   |                  |
  +------------------+                   +------------------+
           |                                       |
           | Redirect Request                      | Mongoose ODM
           v                                       v
  +------------------+                   +------------------+
  |                  |                   |                  |
  |  User Web Browser|                   |  MongoDB         |
  |  (Original URL)  |                   |  (Collections)   |
  |                  |                   |                  |
  +------------------+                   +------------------+
```

---

## 🤔 Assumptions Made

- **Authenticated Creation**: Anonymous users cannot shorten links. Login/Registration is mandatory.
- **Short Code Length**: Default autogenerated codes use a unique `nanoid(7)` slug.
- **Analytics Scope**: Visitor analytics details (IP and User-Agent) are embedded inside each parent URL document rather than separate schema joins.
- **Password Security**: Credentials passwords are hashed using `bcryptjs` with 10 salt rounds before being stored.

---

## 📸 Sample Output

*(To be filled with database screenshot links or dashboard images)*

---

## 🎥 Demo Video

[Watch the demo on Loom](YOUR_LOOM_LINK_HERE)

---

## 📝 Note

This project is built as part of a hackathon run by [Katomaran](https://katomaran.com).
