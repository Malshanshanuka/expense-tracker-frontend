# ExpenseFlow — Modern Expense Tracker Frontend

A React single-page application for personal expense tracking and financial analytics, built to interface with the [Spring Boot Expense Tracker REST API](https://github.com/Malshanshanuka/expense-tracker-api).

---

## Key Features

- **JWT Authentication Flow**: Login & Registration screens with instant feedback and toast notifications.
- **Interactive Dashboard**:
  - Real-time stat cards (Monthly Total, Transaction Count, Average Expense, Top Sector).
  - Interactive Donut & Bar charts powered by Recharts.
  - Recent transactions overview with category badges.
- **Advanced Expense Management**:
  - Live search filtering by description.
  - Category selector filter.
  - Multi-column sorting (Date, Amount) with ascending/descending toggles.
  - Client-side pagination.
  - Custom glassmorphism modal for delete confirmation.
- **Financial Reports & PDF Export**:
  - Monthly category comparison bar and pie charts.
  - Summary metrics (Daily average, highest sector).
  - One-click PDF statement downloading via JWT authentication token.
- **Custom Toast Notification System**: Success, Error, and Info alert toasts with auto-dismissal.
- **Responsive Layout**: Sidebar with mobile drawer, user profile badge, and smooth dark theme design.

---

## Tech Stack

- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4 + Vanilla CSS animations & glassmorphism
- **Routing**: React Router DOM v7
- **Charts**: Recharts
- **HTTP Client**: Axios with JWT interceptors
- **Font**: Inter (Google Fonts)

---

## Getting Started

### Prerequisites

- Node.js 18+ and `npm`
- Running backend instance of [Expense Tracker REST API](https://github.com/Malshanshanuka/expense-tracker-api) on `http://localhost:8080`

### Installation

```bash
git clone https://github.com/Malshanshanuka/expense-tracker-frontend.git
cd expense-tracker-frontend
npm install
```

### Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```
