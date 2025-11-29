# Finance Dashboard

A modern, full-stack finance tracking application built with React and Node.js. Track your income and expenses, analyze your financial data, and gain insights into your spending patterns.

## Features

- **User Authentication** - Secure login and registration with JWT tokens
- **Transaction Management** - Add, view, and manage income and expense transactions
- **CSV Import** - Upload and parse transaction data from CSV files
- **SMS Parsing** - Parse transaction data from SMS messages (CBE bank format)
- **Analytics Dashboard** - Visualize your financial data with interactive charts
- **Transaction Calendar** - View transactions organized by date
- **Financial Insights** - Get automated insights about your spending patterns
- **Dark Mode** - Toggle between light and dark themes
- **Profile Management** - Manage your user profile and account settings

## Tech Stack

### Frontend

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **PapaParse** - CSV parsing

### Backend

- **Node.js** - Runtime environment
- **Express** - Web framework
- **SQLite3** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

## Project Structure

```
finance-dashboard/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   └── utils/          # Utility functions
│   └── package.json
├── server/                 # Backend Express API
│   ├── controllers/        # Route controllers
│   ├── routes/             # API routes
│   ├── middleware/         # Express middleware
│   ├── utils/              # Utility functions
│   └── package.json
└── README.md
```
## Link: https://fin-track-eth.vercel.app

## License

ISC

## Support

For issues and questions, please open an issue on the repository.
