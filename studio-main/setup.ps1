# Sanjeevani Setup Script
# This script helps set up the database and verify the environment

Write-Host "🏥 Sanjeevani Setup Script" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (-Not (Test-Path ".env")) {
    Write-Host "❌ Error: .env file not found!" -ForegroundColor Red
    Write-Host "Please create a .env file based on the README instructions." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ .env file found" -ForegroundColor Green

# Check if node_modules exists
if (-Not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

# Check if PostgreSQL is running
Write-Host ""
Write-Host "🔍 Checking PostgreSQL connection..." -ForegroundColor Yellow

# Try to connect to PostgreSQL using pg_isready or docker
$dockerRunning = docker ps --filter "name=sanjeevani-postgres" --format "{{.Names}}" 2>$null

if ($dockerRunning -eq "sanjeevani-postgres") {
    Write-Host "✅ PostgreSQL Docker container is running" -ForegroundColor Green
} else {
    Write-Host "⚠️  PostgreSQL Docker container not found" -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "Would you like to start PostgreSQL in Docker? (y/n)"
    
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Host "🐳 Starting PostgreSQL in Docker..." -ForegroundColor Yellow
        docker run --name sanjeevani-postgres -e POSTGRES_PASSWORD=admin -e POSTGRES_USER=postgres -e POSTGRES_DB=mydb -p 5432:5432 -d postgres
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ PostgreSQL started successfully" -ForegroundColor Green
            Write-Host "⏳ Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
            Start-Sleep -Seconds 5
        } else {
            Write-Host "❌ Failed to start PostgreSQL" -ForegroundColor Red
            Write-Host "Please ensure Docker is installed and running." -ForegroundColor Yellow
            exit 1
        }
    } else {
        Write-Host "⚠️  Please ensure PostgreSQL is running before continuing" -ForegroundColor Yellow
    }
}

# Generate and push database migrations
Write-Host ""
Write-Host "📊 Setting up database schema..." -ForegroundColor Yellow

# Check if drizzle folder exists
if (-Not (Test-Path "drizzle")) {
    Write-Host "Generating migrations..." -ForegroundColor Yellow
    npx drizzle-kit generate
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to generate migrations" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Migrations generated" -ForegroundColor Green
}

Write-Host "Pushing schema to database..." -ForegroundColor Yellow
npx drizzle-kit push

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database schema updated" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to push schema to database" -ForegroundColor Red
    Write-Host "Please check your DATABASE_URL in .env file" -ForegroundColor Yellow
    exit 1
}

# Summary
Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Review your .env file and add optional API keys if needed" -ForegroundColor White
Write-Host "2. Run 'npm run dev' to start the development server" -ForegroundColor White
Write-Host "3. Open http://localhost:9002 in your browser" -ForegroundColor White
Write-Host ""
Write-Host "Optional API Keys:" -ForegroundColor Yellow
Write-Host "- Google OAuth: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET" -ForegroundColor White
Write-Host "- Google Maps: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" -ForegroundColor White
Write-Host ""
Write-Host "Happy coding! 💻" -ForegroundColor Cyan
