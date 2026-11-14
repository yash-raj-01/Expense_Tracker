# Ledger – Expense Tracker

A modern full-stack personal finance and expense tracking desktop application built with **React**, **Vite**, **Electron**, **Express**, **Prisma ORM**, and **PostgreSQL**.

---

## 🚀 Features

- **Dashboard:** Real-time summary metrics, total spending, monthly expenses, and quick stats.
- **Transactions Management:** Filter transactions by category, search by description, filter by date range, and paginate entries.
- **Analytics & Reporting:**
  - Summary cards (Total Expenses, Monthly Expenses, Average Monthly Spending, Highest Category).
  - Interactive SVG Category Donut Chart with percentage breakdown and legend.
  - Responsive SVG Monthly Spending Bar Chart with 6M/12M view toggle and benchmark average line.
  - Expense Reports with highest expense spotlight, top 5 expenses, and category/monthly tables.
- **Settings & Preferences:** Customizable user profile, Dark/Light theme switcher, multi-currency support (INR, USD, EUR, etc.), and CSV data export.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Electron, CSS3
- **Backend:** Node.js, Express.js, Prisma ORM 7 (`@prisma/adapter-pg`)
- **Database:** PostgreSQL
- **Testing:** Native Node.js test runner (`node:test`, `node:assert`)

---

## 📚 Academic & Curriculum Topics

### [Mobile Virtual Reality and Artificial Intelligence (SWAYAM / NPTEL)](docs/MOBILE_VIRTUAL_REALITY_AND_AI_SWAYAM.md)
Comprehensive study syllabus and reference notes on the **SWAYAM** course offered by **IIT Mandi** (Course Code: **CS 662**, Instructor: **Prof. Varun Dutt**):
- **Module 1:** Virtual Reality Foundations & Unity 3D Environment Setup
- **Module 2:** AI Simulation & A\* Pathfinding Algorithms
- **Module 3:** 3D Modeling with Blender & Google Cardboard VR Development
- **Module 4:** Neural Networks, Imitation Learning & Behavioral Cloning in Games
- **Module 5:** Deep Reinforcement Learning (PPO), Unity ML-Agents & TensorBoard Analysis

👉 **Full Course Documentation:** [`docs/MOBILE_VIRTUAL_REALITY_AND_AI_SWAYAM.md`](docs/MOBILE_VIRTUAL_REALITY_AND_AI_SWAYAM.md)

---

## 📦 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)

### 2. Backend Setup
```bash
cd server
cp .env.example .env
# Configure your DATABASE_URL in .env
npm install
npx prisma migrate deploy
npm start
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev      # Run in browser (Vite)
npm run electron # Run as Desktop App
```

### 4. Running Backend Tests
```bash
cd server
npm test
```

---

## 👥 Contributors

- **Yash Raj** (Lead, Desktop Architecture & Settings)
- **Satyam Raj** (Transactions, Pagination & Preferences)
- **Saurabh Singh Airee** (Analytics Dashboard, SVG Charts, Backend Reports API, Full-Stack Integration)
