# FinTrack Admin Dashboard

This is an independent admin dashboard application for FinTrack. It can be deployed separately from the main client application.

## Features

- **Independent Deployment**: Can be deployed separately from the client app
- **Backend Authentication**: Authenticates with the backend API using database-stored credentials
- **System Management**: View and manage users, activities, and system statistics
- **Reports & Analytics**: Generate comprehensive system reports

## Login Credentials

The admin user credentials are configured via environment variables on the server:

- **ADMIN_EMAIL**: Email address for the admin user
- **ADMIN_PASSWORD**: Password for the admin user

> **Note**: The admin user is automatically created in the database when the server starts (if `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set). If you need to manually create or update the admin user, run `npm run create-admin` in the server directory with the credentials.

## Installation

1. Install dependencies:

```bash
npm install
```

## Development

Run the development server:

```bash
npm run dev
```

The admin dashboard will be available at `http://localhost:5173` (or the port Vite assigns).

## Building for Production

Build the admin app:

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment.

## Environment Variables

You can configure the API endpoint using environment variables:

- `VITE_API_BASE_URL`: Base URL for the API (defaults to `/api`)
- `VITE_API_PROXY_TARGET`: Proxy target for development (defaults to `https://finttrack-api.onrender.com`)

## Deployment

The admin app can be deployed independently to any static hosting service:

- **Vercel**: Connect your repository and set the build directory to `admin`
- **Netlify**: Set the build command to `cd admin && npm run build` and publish directory to `admin/dist`
- **GitHub Pages**: Build and deploy the `dist` folder
- **Any static host**: Upload the contents of the `dist` folder after building

## Notes

- The admin app uses separate localStorage keys (`fintrack_admin_token` and `fintrack_admin_user`) to avoid conflicts with the main client app
- Authentication is handled through the backend API - credentials are stored in the database
- The app requires the backend API to be running and accessible
- The admin user is automatically created when the server starts if `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables are set
- **Security**: Never commit admin credentials to version control. Use environment variables or a secure secrets manager.
