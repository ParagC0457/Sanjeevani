# Sanjeevani - Healthcare Platform

A comprehensive healthcare platform built with Next.js, featuring AI-powered symptom checking, prescription parsing, medicine comparison, and health news.

## Features

- 🤖 **AI-Powered Health Assistant**: Symptom checker chatbot using Google Gemini AI
- 📋 **Prescription Parser**: Extract and analyze prescription information from images
- 💊 **Medicine Comparator**: Compare medicines and find alternatives
- 📰 **Health News**: Stay updated with the latest health news
- 🗺️ **Location Services**: Find nearby pharmacies, hospitals, and blood banks
- 🔐 **Authentication**: Secure login with credentials or Google OAuth
- 🌙 **Dark Mode**: Full dark mode support
- 🌍 **Multi-language**: Support for multiple languages

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js v5
- **AI**: Google Gemini AI via Genkit
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Maps**: Google Maps API

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 20 or higher
- PostgreSQL (or Docker to run PostgreSQL)
- npm or yarn

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd studio-main
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up PostgreSQL Database

#### Option A: Using Docker (Recommended)

```bash
# Run PostgreSQL in Docker
docker run --name sanjeevani-postgres -e POSTGRES_PASSWORD=admin -e POSTGRES_USER=postgres -e POSTGRES_DB=mydb -p 5432:5432 -d postgres

# Verify it's running
docker ps
```

#### Option B: Local PostgreSQL Installation

Install PostgreSQL locally and create a database named `mydb` with user `postgres` and password `admin`.

### 4. Configure Environment Variables

The `.env` file has been set up with the following configuration:

```env
# Database Configuration
DATABASE_URL="postgres://postgres:admin@localhost:5432/mydb?schema=public"

# Authentication
AUTH_SECRET="secret"

# Google AI API (for Genkit AI features)
GOOGLE_API_KEY="your-api-key-here"
```

**Optional Environment Variables:**

For Google OAuth login, add:
```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```
Get these from: https://console.cloud.google.com/apis/credentials

For Google Maps (location features), add:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
```
Get this from: https://console.cloud.google.com/google/maps-apis

### 5. Generate and Run Database Migrations

```bash
# Generate migration files
npx drizzle-kit generate

# Push schema to database
npx drizzle-kit push
```

### 6. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:9002`

## Available Scripts

- `npm run dev` - Start development server on port 9002
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run genkit:dev` - Start Genkit development server
- `npm run genkit:watch` - Start Genkit with watch mode

## Database Schema

The application uses the following tables:
- `user` - User accounts
- `account` - OAuth accounts
- `session` - User sessions
- `verificationToken` - Email verification tokens

## API Keys Setup

### Google AI API (Required for AI features)
1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key
3. Add it to `.env` as `GOOGLE_API_KEY`

### Google OAuth (Optional)
1. Go to https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `http://localhost:9002/api/auth/callback/google`
4. Add credentials to `.env`

### Google Maps API (Optional)
1. Go to https://console.cloud.google.com/google/maps-apis
2. Enable Maps JavaScript API and Places API
3. Create an API key
4. Add it to `.env` as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running: `docker ps` (if using Docker)
- Verify DATABASE_URL in `.env` matches your PostgreSQL configuration
- Check if port 5432 is available

### PowerShell Script Execution Error
If you encounter "running scripts is disabled" error:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Build Errors
The project has `ignoreBuildErrors: true` in `next.config.ts` to allow builds with TypeScript warnings. This is intentional for development.

## Project Structure

```
studio-main/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── ai/              # AI flows and Genkit configuration
│   ├── lib/             # Utility functions
│   ├── db/              # Database schema
│   ├── data/            # Static data (medicines, symptoms)
│   └── context/         # React context providers
├── public/              # Static assets
├── drizzle/            # Database migrations (generated)
└── .env                # Environment variables
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.
