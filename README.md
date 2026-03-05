# Streamy

Your personal movie watchlist, powered by a modern REST API.

Streamy makes it effortless to track what you want to watch, what you have watched, and what you loved along the way. Register an account, build your watchlist, rate your favorites, and keep notes on every film — all through a clean, secure API.

---

## What Streamy Does

**Manage your movie journey from start to finish.**

- **Sign up in seconds** — Create an account with your name, email, and a password. Streamy handles the rest, hashing your credentials and issuing a secure token so you can get started immediately.

- **Build your watchlist** — Found a movie you want to see? Add it to your personal watchlist with a single request. Streamy prevents duplicates, so your list stays clean and organized.

- **Track your progress** — Mark movies as Planned, Watched, Completed, or Dropped. Update your status as you go, and always know where you left off.

- **Rate and review** — Give each movie a rating from 1 to 10 and attach personal notes. Whether it is a quick star rating or a detailed thought, Streamy keeps it all in one place.

- **Browse with ease** — View your full watchlist with pagination and smart filtering. Want to see only your planned movies? Filter by status. Need just the first page? Set your limit. The API adapts to how you want to browse.

- **Stay in control** — Every watchlist item is tied to your account. Nobody else can view, edit, or delete your entries. Your data is yours.

---

## How It Works

Streamy is a backend API — it does not include a user interface. Instead, it exposes a set of endpoints that any frontend application, mobile app, or HTTP client can talk to.

### Accounts

Create an account at `/auth/register`, log in at `/auth/login`, and log out at `/auth/logout`. On registration and login, Streamy returns a JSON Web Token that authenticates all future requests. The token is also set as a secure cookie for browser-based clients.

### Movies

The `/movies` endpoint provides access to the movie catalog. Movies include a title, overview, release year, genre tags, runtime, and a poster URL.

### Watchlist

The `/watchlist` endpoints are the core of Streamy. Once authenticated, you can:

- **Add** a movie to your watchlist by providing its ID, with an optional status, rating, and notes.
- **View** your full watchlist, paginated and filterable by status.
- **View** a single watchlist entry by its ID.
- **Update** the status, rating, or notes on any entry you own.
- **Remove** a movie from your watchlist when you no longer need it.

Every watchlist operation verifies ownership, ensuring that only you can interact with your entries.

---

## Getting Started

1. Clone the repository and install dependencies with `pnpm install`.
2. Set up a PostgreSQL database and add its connection string to a `.env` file alongside a `JWT_SECRET` of your choice.
3. Run database migrations with `pnpm dlx prisma migrate deploy` and generate the client with `pnpm dlx prisma generate`.
4. Optionally seed the database with sample movies using `pnpm seed:movies`.
5. Start the development server with `pnpm dev`. The API will be available at `http://localhost:5000`.

---

## Available Commands

- `pnpm dev` — Start the development server with automatic reload on file changes.
- `pnpm build` — Compile the project for production.
- `pnpm start` — Run the production build.
- `pnpm seed:movies` — Populate the database with a curated set of sample movies.
