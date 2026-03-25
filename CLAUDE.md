# LaunchLens - Business Feasibility Analysis Tool

## Project Overview

LaunchLens is a web application that helps entrepreneurs evaluate business ideas by generating comprehensive feasibility reports. Users input a business concept and receive AI-powered analysis covering costs, competition, profitability, and market potential.

### Core Value Proposition
- Transform business ideas into actionable insights
- Reduce entrepreneurial risk through data-driven analysis
- Provide structured feasibility reports with actionable recommendations

## MVP Features (from Wiki Documentation)

### Primary Goal
Allow users to input a business idea → receive a basic feasibility report with cost + market insights.

### Success Criteria
- Users can input a business idea easily
- System generates clear feasibility reports
- Costs and profitability estimates are understandable
- App demonstrates real value for early users

### Feasibility Report Components
1. **Startup Cost Estimation** - Equipment, setup costs, initial inventory, licenses/permits
2. **Monthly Operating Costs** - Rent, labor, software/tools, utilities, misc overhead
3. **Competitor Analysis** - Competitor types, market saturation, differentiation suggestions
4. **Pricing & Profitability** - Estimated price range, monthly revenue, break-even estimate
5. **Feasibility Score** - 🟢 Strong opportunity / 🟡 Moderate risk / 🔴 High risk
6. **Location Analysis** - Ideal locations, foot traffic, competition density
7. **Skill Analysis** - Required skills, staffing needs, training recommendations
8. **Legal Analysis** - Required licenses, regulatory considerations, compliance costs

### Target Users
- Aspiring entrepreneurs
- Students exploring business ideas
- Side-hustle founders
- Early-stage startup builders

---

## Architecture Decisions

### AI Model Choice: Groq API (Llama 3.1 70B)
**Decision**: Use Groq's free tier with Llama 3.1 70B model

**Rationale**:
- Generous free tier with millions of tokens/month
- Very fast inference speeds
- Good model quality for structured output generation
- No local hardware requirements
- Easy API integration

**Alternatives Considered**:
- Ollama (local) - Requires hardware, but truly free
- Together AI - Good alternative, similar free tier

### Tech Stack: FastAPI + React
**Decision**: Python FastAPI backend with React + TypeScript frontend

**Rationale**:
- User preference for FastAPI + React combination
- FastAPI: Excellent for AI integration, async support, automatic OpenAPI docs
- React: Mature ecosystem, good DX with TypeScript + Vite
- Tailwind CSS for rapid UI development

### Authentication: Basic Auth with JWT
**Decision**: Include authentication for saving/loading reports

**Rationale**:
- User preference for saving reports
- JWT tokens provide stateless authentication
- Allows for future premium features

### PDF Export: Included in MVP
**Decision**: Include PDF download functionality using react-to-pdf

**Rationale**:
- User explicitly requested this feature
- Entrepreneurs often need to share reports with partners/investors
- react-to-pdf provides simple client-side PDF generation

### No Caching
**Decision**: Skip Redis caching for MVP

**Rationale**:
- Simpler architecture
- Groq free tier is sufficient for MVP scale
- Can add caching layer later if needed

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  Landing │  │  Input   │  │Questions │  │  Report  │     │
│  │   Page   │→ │   Form   │→ │  Flow    │→ │ Dashboard│     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
│        ↓                                          ↑          │
│  ┌──────────┐                              ┌──────────┐      │
│  │  Auth    │                              │  Saved   │      │
│  │  Pages   │                              │ Reports  │      │
│  └──────────┘                              └──────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend (FastAPI)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  Auth    │  │ Report   │  │   AI     │  │Database  │     │
│  │ Routes   │  │ Routes   │  │ Service  │  │ Models   │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┐
        ▼                     ▼
   ┌─────────┐          ┌──────────┐
   │  Groq   │          │ PostgreSQL│
   │   API   │          │  (Data)   │
   └─────────┘          └──────────┘
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Reports Table
```sql
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_idea TEXT NOT NULL,
    location VARCHAR(255),
    budget_range VARCHAR(100),
    business_type VARCHAR(100),
    target_customer TEXT,
    raw_response JSONB,
    processed_report JSONB,
    feasibility_score INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create new user |
| POST | /api/auth/login | Login, returns JWT |
| GET | /api/auth/me | Get current user |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/reports/questions | Get follow-up questions for idea |
| POST | /api/reports/generate | Generate new feasibility report |
| GET | /api/reports | List user's saved reports |
| GET | /api/reports/{id} | Get specific report |
| DELETE | /api/reports/{id} | Delete report |

---

## Project Structure

```
business-feasibility/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI app entry
│   │   ├── config.py               # Environment config
│   │   ├── database.py             # DB connection
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   └── report.py
│   │   ├── schemas/
│   │   │   ├── user.py
│   │   │   └── report.py
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── reports.py
│   │   │   └── health.py
│   │   ├── services/
│   │   │   └── ai_service.py       # Groq integration
│   │   └── utils/
│   │       ├── auth.py             # JWT helpers
│   │       └── prompts.py          # AI prompt templates
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   ├── forms/
│   │   │   ├── report/
│   │   │   └── ui/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── package.json
│   └── vite.config.ts
│
├── docker-compose.yml
└── README.md
```

---

## Implementation Progress

### Completed ✅
- [x] Phase 1: Project Setup
  - Backend FastAPI project initialized
  - Frontend React + Vite project initialized
  - PostgreSQL database configured
  - Environment variables set up
  - CORS and middleware configured
  - Basic UI components created
  - Authentication routes implemented
  - Report routes implemented
  - AI service with Groq integration
  - PDF export functionality

### Pending ⏳
- [ ] Phase 2: Authentication System (frontend pages done, needs testing)
- [ ] Phase 3: AI Integration (backend done, needs testing)
- [ ] Phase 4: Report Generation (backend done, needs testing)
- [ ] Phase 5: Dashboard & UX (frontend done, needs testing)
- [ ] Phase 5.5: PDF Export (implemented, needs testing)
- [ ] Phase 6: Testing & Polish

---

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

---

## Running the Project

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL
- Groq API Key (free at https://console.groq.com)

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Add your GROQ_API_KEY
uvicorn app.main:app --reload
```

### Database (Docker)
```bash
docker-compose up -d db
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Key Design Decisions

### User Flow
1. User lands on homepage → registers/logs in
2. User inputs business idea → system asks follow-up questions
3. System sends to Groq API → receives structured analysis
4. User views report dashboard → can download PDF

### AI Prompt Strategy
- System prompt defines role as "business feasibility analyst"
- Structured JSON output for consistent parsing
- Follow-up questions generated dynamically based on idea
- Default questions for location, budget, business type, target customer

### Feasibility Scoring Algorithm
Weighted scoring based on:
- Market demand: 20%
- Competition level: 15%
- Startup cost feasibility: 20%
- Profitability: 25%
- Break-even time: 10%
- Location fit: 10%

---

## Future Enhancements (Post-MVP)
- Real-time supplier pricing APIs
- Live market data integrations
- Investor-ready PDF exports
- User dashboard with analytics
- Multi-business tracking
- Collaboration features

---

## Notes for Future Sessions

1. **Groq API**: Free tier has rate limits - monitor usage during development
2. **Database**: Using PostgreSQL JSONB for flexible report storage
3. **Auth**: JWT stored in localStorage, persisted via Zustand
4. **PDF**: Using react-to-pdf for client-side PDF generation
5. **Styling**: Tailwind CSS with custom primary color palette
6. **State**: Zustand for auth, React Query for server state