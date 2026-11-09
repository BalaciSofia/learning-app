# Learning App

A full-stack, gamified e-learning platform built by a team of 7 during the **AROBS practice program (2026)**.

Teachers create courses, lessons and tests (with AI-generated wrong answers for multiple-choice questions). Students enroll, learn, take tests, and stay motivated through XP, streaks, medals, daily puzzles, a conquest map and 1v1 duels.

---

## Features

### Accounts & roles
- Register, log in, log out, change password, and reset a forgotten password by email
- JWT authentication with token revocation (blacklist) and automatic logout when inactive
- Four roles: **Admin**, **Teacher**, **Student**, **Basic**, enforced with route guards and a `*hasRole` directive
- Admin panel for managing users and their roles

### Courses
- Courses split into **units** and **lessons** (video, reading, activity, quiz)
- Enrollment and lesson progress tracking
- Draft courses, visible only to their teacher until published

### Tests
- Teachers build tests with a question builder and a review step
- **AI distractors:** Google Gemini suggests plausible wrong answers for multiple-choice questions
- Students take tests, see their results and look back at previous attempts
- Teachers see per-test statistics, with Excel export (`xlsx`)

### Gamification
- **Study Quest:** XP, levels, daily streaks, daily quest progress and a **daily puzzle** for each course
- **Medals:** first question, 3/7/30-day streaks, battles won, levels, perfect score, duel champion
- **Conquest:** a map of zones you unlock one after another by answering questions, with treasures to find
- **Battles:** challenge another student to a duel and compare results

---

## Tech stack

| Area | Technologies |
|---|---|
| Frontend | Angular 20 (standalone components, signals), Angular Material/CDK, RxJS, jwt-decode, xlsx, canvas-confetti |
| Backend | .NET 10, ASP.NET Core Web API, Entity Framework Core (SQL Server), FluentValidation, Mapperly, Swagger |
| Integrations | Google Gemini (AI distractors), MailKit/SMTP (password reset emails) |
| Testing | Playwright end-to-end tests, xUnit backend tests, Karma/Jasmine unit tests |
| DevOps | Azure Pipelines, Azure App Service, Azure SQL, Docker |

---

## Repository structure

```
learning-app/
├── NET_Angular1/            # Angular frontend
│   ├── src/app/
│   │   ├── core/            # guards, interceptors, layout, core services
│   │   ├── features/        # admin, authentication, courses, tests, dashboard,
│   │   │                    # profile, study-quest, conquest, battles
│   │   └── shared/          # reusable components, directives, utils, constants
│   └── tests/               # Playwright E2E suite (page objects, fixtures, specs per role)
│
└── NET_Backend/             # ASP.NET Core API (Clean Architecture)
    ├── Domain/              # entities and enums
    ├── Application/         # use cases, interfaces, contracts, options
    ├── Infrastructure/      # EF Core DbContext, migrations, repositories, email & AI clients
    ├── API/                 # controllers, DTOs, validators, mapping, middleware, Program.cs
    └── Tests/               # backend tests
```

The backend follows **Clean Architecture**: dependencies only point inward (`API → Application → Domain`, `Infrastructure → Application → Domain`). See [`NET_Backend/README.md`](NET_Backend/README.md) and [`NET_Backend/DevContext.md`](NET_Backend/DevContext.md) for the team's conventions.

---

## Getting started

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/)
- [Node.js](https://nodejs.org/) (LTS) and npm
- SQL Server (local, Docker, or Azure SQL)
- A Google Gemini API key (only needed for AI distractors)

### 1. Backend

Configure the API using user secrets or environment variables. **Don't commit real secrets.**

| Setting | Purpose |
|---|---|
| `ConnectionStrings:DefaultConnection` | SQL Server connection string |
| `JWT_SECRET_KEY` | Key used to sign JWTs |
| `Jwt:Issuer`, `Jwt:Audience`, `Jwt:ExpiryMinutes` | JWT settings |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | Google Gemini access |
| `EmailSettings:*` | SMTP server used for password reset emails |
| `FrontEndUrl` | Frontend URL, used for CORS and links in emails |

```bash
cd NET_Backend/API
dotnet user-secrets set "JWT_SECRET_KEY" "<a-long-random-secret>"
dotnet user-secrets set "GEMINI_API_KEY" "<your-key>"
dotnet user-secrets set "GEMINI_MODEL" "<model-name>"

dotnet ef database update --project ../Infrastructure --startup-project .
dotnet run
```

The API runs at `http://localhost:5030`, with Swagger UI at `http://localhost:5030/swagger` in Development.

### 2. Frontend

```bash
cd NET_Angular1
npm install
npm start
```

Open `http://localhost:4200`. To change the API URL, edit `src/environments/environment*.ts`.

---

## Testing

**Backend**
```bash
cd NET_Backend
dotnet test
```

**Frontend unit tests**
```bash
cd NET_Angular1
npm test
```

**End-to-end tests (Playwright).** The frontend and the API must both be running.
```bash
cd NET_Angular1/tests
npm install
cp .env.example .env      # then fill in the test account credentials
npx playwright install
npx playwright test
```
Specs are grouped by role (`admin`, `teacher`, `student`, `user`, `auth`) and use the Page Object pattern (`tests/pages`).

---

## CI/CD

- `NET_Backend/azure-pipeline.yml` restores, builds, tests and publishes the API
- `NET_Angular1/azure-pipelines-angular.yml` builds the Angular app and publishes the build output

Both are set up to deploy to Azure App Service.

---

## Team

Built by a team of 7 during the AROBS practice program.
Thanks to **AROBS** and our mentors for their guidance throughout the program.
