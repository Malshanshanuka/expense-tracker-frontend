# Expense Tracker Frontend

React web application for Expense Tracker personal finance management platform.

Backend Repository: https://github.com/malshanshanuka/expense-tracker-api

## Features

- Interactive dashboard with category spending pie chart using Recharts
- Monthly budget tracker with progress bar and spending alert warnings
- Full CRUD operations for expenses with category filter and search
- CSV data export for expenses and monthly category reports
- Monthly PDF report download with JWT bearer authentication
- Toast notifications for application actions
- Responsive design styled with Tailwind CSS

## Technology Stack

- Framework: React 19
- Build Tool: Vite
- Styling: Tailwind CSS
- Charts: Recharts
- HTTP Client: Axios
- Router: React Router DOM v7

## Project Structure

```
src/
  api/          # Axios instance and API calls
  components/   # Reusable components
  context/      # Auth and Toast context providers
  pages/        # Dashboard, Expenses, Reports, Login, Register views
  App.jsx       # Routing setup
  main.jsx      # Entry point
```

## Local Setup Instructions

### Prerequisites
- Node.js v18+
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/malshanshanuka/expense-tracker-frontend.git
cd expense-tracker-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run development server:
```bash
npm run dev
```

The application will run at http://localhost:5173.

## Author

Malshan Shanuka
