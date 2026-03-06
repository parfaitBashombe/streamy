# Streamy

**A production-grade movie watchlist REST API built for developers who care about security, clean architecture, and great developer experience.**

Streamy gives your users the power to discover movies, build personal watchlists, track progress, rate films, and leave notes — all through a thoughtfully designed, secure API that any frontend, mobile app, or HTTP client can plug into.

---

## Why Streamy

Most watchlist APIs are toy projects. Streamy is not. It ships with enterprise-level authentication, input validation at every boundary, ownership-enforced access control, and a database schema designed for real-world use.

**Built to be extended.** Whether you are building a React frontend, a mobile app with React Native, or integrating with a third-party service, Streamy handles the heavy lifting on the backend so you can focus on the experience.

---

## Features

- **Dual JWT Authentication** — Short-lived access tokens paired with long-lived, rotatable refresh tokens. Refresh tokens are SHA-256 hashed and stored in the database. No plaintext secrets, ever.

- **Secure Cookie Management** — Refresh tokens are delivered via httpOnly, secure, sameSite-strict cookies. Built for browser-based clients without sacrificing security for API consumers.

- **Session Lifecycle** — Full support for register, login, token refresh, and logout. Sessions are tracked server-side with revocation and expiry, so you always know who is active.

- **Movie Catalog with Ownership** — Authenticated users can create, update, and delete movies they own. Public read access lets anyone browse the catalog. Ownership middleware ensures no unauthorized mutations.

- **Personal Watchlists** — Every user gets their own watchlist. Add movies, set a status (Planned, Watched, Completed, Dropped), rate on a 1-10 scale, and attach personal notes. Duplicate entries are prevented at the database level.

- **Smart Filtering and Pagination** — Browse movies by title, genre, or release year. Browse watchlists by status. Both support cursor-free offset pagination with configurable page sizes up to 100.

- **Zod-Powered Validation** — Every request body, query string, and route parameter is validated through Zod schemas before it reaches a controller. Invalid input gets a structured, field-level error response.

- **Graceful Error Handling** — Unhandled rejections, uncaught exceptions, and SIGTERM signals are all caught and handled cleanly. The server shuts down without dropping active connections.

---

## Tech Stack

| Layer           | Technology                                |
| --------------- | ----------------------------------------- |
| Runtime         | Node.js with TypeScript (ESNext modules)  |
| Framework       | Express 5                                 |
| ORM             | Prisma 7 with PostgreSQL driver adapter   |
| Database        | PostgreSQL                                |
| Validation      | Zod 4                                     |
| Authentication  | JSON Web Tokens (jsonwebtoken) + bcryptjs |
| Package Manager | pnpm                                      |
| Dev Tooling     | nodemon, tsx                              |

---

## API Reference

### Authentication

| Method | Endpoint         | Auth | Description                                                                         |
| ------ | ---------------- | ---- | ----------------------------------------------------------------------------------- |
| `POST` | `/auth/register` | No   | Create a new account. Returns access token and sets refresh cookie.                 |
| `POST` | `/auth/login`    | No   | Authenticate with email and password. Returns access token and sets refresh cookie. |
| `POST` | `/auth/refresh`  | No   | Rotate both access and refresh tokens using the refresh cookie.                     |
| `POST` | `/auth/logout`   | Yes  | Revoke the current session and clear the refresh cookie.                            |

### Movies

| Method   | Endpoint      | Auth        | Description                                                                                                    |
| -------- | ------------- | ----------- | -------------------------------------------------------------------------------------------------------------- |
| `GET`    | `/movies`     | No          | List all movies. Supports filtering by `title`, `genre`, `release_year` and pagination via `page` and `limit`. |
| `POST`   | `/movies`     | Yes         | Add a new movie to the catalog.                                                                                |
| `GET`    | `/movies/:id` | No          | Retrieve a single movie by ID, including creator details.                                                      |
| `PATCH`  | `/movies/:id` | Yes + Owner | Update a movie you created. Partial updates supported.                                                         |
| `DELETE` | `/movies/:id` | Yes + Owner | Permanently delete a movie you created.                                                                        |

### Watchlist

| Method   | Endpoint         | Auth        | Description                                                                      |
| -------- | ---------------- | ----------- | -------------------------------------------------------------------------------- |
| `GET`    | `/watchlist`     | Yes         | List your watchlist items. Filter by `status`, paginate with `page` and `limit`. |
| `POST`   | `/watchlist`     | Yes         | Add a movie to your watchlist with optional status, rating, and notes.           |
| `GET`    | `/watchlist/:id` | Yes + Owner | Retrieve a single watchlist entry.                                               |
| `PATCH`  | `/watchlist/:id` | Yes + Owner | Update the status, rating, or notes on a watchlist entry.                        |
| `DELETE` | `/watchlist/:id` | Yes + Owner | Remove a movie from your watchlist.                                              |

---

## Project Structure

```
streamy/
├── prisma/
│   ├── migrations/         Database migration history
│   ├── schema.prisma       Data models and relations
│   └── seed.ts             Sample movie data seeder
├── src/
│   ├── config/             Prisma client initialization with PG adapter
│   ├── controllers/        Request handlers for auth, movies, and watchlist
│   ├── middleware/          Auth guard, request validation, ownership checks
│   ├── routes/             Express route definitions
│   ├── schemas/            Zod validation schemas
│   ├── types/              Express Request type augmentation
│   ├── utils/              JWT generation, token hashing, cookie helpers
│   └── server.ts           Application entry point and shutdown handlers
├── prisma.config.ts        Prisma configuration
├── tsconfig.json           TypeScript compiler options
├── nodemon.json            Dev server file watcher config
└── package.json            Dependencies and scripts
```

---

## Database Schema

Four models power the entire application:

- **user** — Stores account credentials and serves as the identity anchor for all owned resources.
- **refresh_token** — One-to-one with user. Tracks hashed tokens, expiry timestamps, and revocation state.
- **movie** — The catalog. Each movie is owned by the user who created it. Supports genres as a string array.
- **watchlist_item** — The junction between users and movies. Enforces a unique constraint on `(user_id, movie_id)` to prevent duplicate entries.

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or hosted)
- pnpm installed globally (`npm install -g pnpm`)

### Installation

```bash
git clone https://github.com/parfaitBashombe/streamy.git
cd streamy
pnpm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://user:password@host:5432/streamy
JWT_ACCESS_SECRET=your-access-token-secret
JWT_REFRESH_SECRET=your-refresh-token-secret
ACCESS_TOKEN_EXPIRES_IN=900
REFRESH_TOKEN_EXPIRES_IN=604800
REFRESH_TOKEN_COOKIE_DAYS=7
NODE_ENV=development
```

| Variable                    | Required | Default  | Description                                  |
| --------------------------- | -------- | -------- | -------------------------------------------- |
| `DATABASE_URL`              | Yes      | —        | PostgreSQL connection string                 |
| `JWT_ACCESS_SECRET`         | Yes      | —        | Secret key for signing access tokens         |
| `JWT_REFRESH_SECRET`        | Yes      | —        | Secret key for signing refresh tokens        |
| `ACCESS_TOKEN_EXPIRES_IN`   | No       | `900`    | Access token TTL in seconds (15 minutes)     |
| `REFRESH_TOKEN_EXPIRES_IN`  | No       | `604800` | Refresh token TTL in seconds (7 days)        |
| `REFRESH_TOKEN_COOKIE_DAYS` | No       | `7`      | Refresh cookie max-age in days               |
| `NODE_ENV`                  | No       | —        | Set to `production` to enable secure cookies |

### Database Setup

```bash
pnpm dlx prisma migrate deploy
pnpm dlx prisma generate
```

### Seed Sample Data (Optional)

Set `CREATOR_ID` in your `.env` to the UUID of an existing user, then run:

```bash
pnpm seed:movies
```

This populates the database with 10 classic films.

### Start the Server

```bash
pnpm dev
```

The API will be available at `http://localhost:5000`.

---

## Available Scripts

| Command            | Description                                              |
| ------------------ | -------------------------------------------------------- |
| `pnpm dev`         | Start the development server with hot reload via nodemon |
| `pnpm build`       | Compile TypeScript to JavaScript for production          |
| `pnpm start`       | Run the compiled production build                        |
| `pnpm seed:movies` | Seed the database with sample movie data                 |

---

## License

ISC
