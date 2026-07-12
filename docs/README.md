# 🚍 TransitOps – Smart Transport Operations Platform

TransitOps is a modern Fleet Management ERP built for the Odoo Hackathon 2026.

## 🚀 Features

- JWT Authentication
- Role-Based Access Control (RBAC)
- Dashboard with KPIs
- Vehicle Management
- Driver Management
- Trip Management
- Maintenance Tracking
- Fuel Log Management
- Expense Management
- Reports & Analytics

## 🛠 Tech Stack

### Frontend
- React + Vite
- Tailwind CSS
- React Router DOM
- Axios
- React Hook Form
- Recharts

### Backend
- Node.js
- Express.js
- JWT
- bcrypt
- Multer

### Database
- MongoDB Atlas
- Mongoose

## 👥 Team

| Member | Responsibility |
|---------|---------------|
| Milan | Frontend Lead |
| Karan | Backend Lead |
| Harshit | Trip & Maintenance |
| Kirtan | Fuel, Reports & Testing |

## 📂 Project Structure

```
client/
server/
docs/
```

## ⚙️ Installation

### Frontend

```bash
cd client
npm install
npm run dev
```

### Backend

```bash
cd server
npm install
npm run dev
```

## 🌿 Git Workflow

- Never push directly to main
- Work only on your branch
- Commit frequently
- Create Pull Requests
- Merge only tested code

## 📌 Business Rules

- Vehicle number must be unique.
- Retired vehicles cannot be dispatched.
- Suspended drivers cannot be assigned.
- Vehicle and Driver cannot have two active trips.
- Cargo cannot exceed vehicle capacity.
- Maintenance automatically changes vehicle status.
- Trip completion restores availability.

## 📄 License

Odoo Hackathon 2026
