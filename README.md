# LaunchLens

A business feasibility analysis tool for entrepreneurs. LaunchLens helps users evaluate business ideas by providing comprehensive feasibility reports covering costs, competition, profitability, and market analysis.

## Features

- **Business Idea Analysis**: Input your business concept and get a detailed feasibility report
- **AI-Powered Insights**: Uses Groq API (Llama 3.1) to analyze business ideas
- **Cost Estimation**: Detailed startup and operating cost breakdowns
- **Competitor Analysis**: Market saturation and differentiation suggestions
- **Profitability Forecast**: Revenue projections and break-even analysis
- **Feasibility Scoring**: Overall feasibility rating with recommendations
- **PDF Export**: Download reports for offline viewing

## Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL with SQLAlchemy
- **Authentication**: JWT tokens with bcrypt
- **AI**: Groq API (Llama 3.1 70B)

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **State Management**: Zustand + React Query

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL
- Groq API Key (free tier available at https://console.groq.com)

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# - Set DATABASE_URL to your PostgreSQL connection
# - Set GROQ_API_KEY to your Groq API key
# - Set JWT_SECRET to a secure random string

# Run database migrations (if using Alembic)
# alembic upgrade head

# Start the server
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

### Using Docker

```bash
# Start all services
docker-compose up -d

# Backend will be available at http://localhost:8000
# Frontend will be available at http://localhost:5173
```

## Environment Variables

### Backend (.env)

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/launchlens
GROQ_API_KEY=your-groq-api-key
JWT_SECRET=your-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000/api
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (returns JWT)
- `GET /api/auth/me` - Get current user

### Reports
- `POST /api/reports/questions` - Get follow-up questions
- `POST /api/reports/generate` - Generate feasibility report
- `GET /api/reports` - List user's reports
- `GET /api/reports/:id` - Get specific report
- `DELETE /api/reports/:id` - Delete report

## Project Structure

```
business-feasibility/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── routers/
│   │   ├── services/
│   │   └── utils/
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── package.json
│   └── .env.example
└── docker-compose.yml
```

## License

MIT License - feel free to use this project for your own purposes.
