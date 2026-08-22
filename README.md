# Car Dealership Inventory System

A REST API for dealership inventory, built with TypeScript, Express, MongoDB/Mongoose, JWT authentication, and test-driven development.

## Backend setup

1. Install dependencies from the repository root: `npm install`.
2. Create `backend/.env` using `backend/.env.example` as a placeholder-only guide. Never commit `.env`.
3. Add your MongoDB Atlas connection string and a long random JWT secret:

   ```env
   PORT=3000
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=use-a-long-random-secret
   ```

4. Start the API with `npm run dev:backend`.
5. Run the test suite with `npm run test:backend`.

The API is available at `http://localhost:3000`.

## Create an administrator

Registration intentionally creates customer accounts only. In PowerShell, set the three temporary values and run the seed command:

```powershell
$env:ADMIN_NAME="Admin User"
$env:ADMIN_EMAIL="admin@example.com"
$env:ADMIN_PASSWORD="UseALongUniquePassword"
npm run seed:admin --workspace=backend
```

The command creates or updates that account with the `admin` role. It does not print the password.

## Thunder Client API guide

All responses and request bodies use JSON. For protected routes, set the `Authorization` header to `Bearer <token>` using the token returned from registration or login.

| Purpose | Method and URL | Body / notes |
| --- | --- | --- |
| Confirm server | `GET /health` | No authentication |
| Register customer | `POST /api/auth/register` | `{"name":"Ava Driver","email":"ava@example.com","password":"at-least-8-characters"}` |
| Login | `POST /api/auth/login` | `{"email":"ava@example.com","password":"at-least-8-characters"}` |
| List available stock | `GET /api/vehicles` | Bearer token required |
| Search stock | `GET /api/vehicles/search?make=Toyota&minPrice=10000&maxPrice=30000` | Bearer token required; `model` and `category` also supported |
| Add vehicle | `POST /api/vehicles` | Admin token; `{"make":"Toyota","model":"Camry","category":"Sedan","price":25000,"quantity":3}` |
| Update vehicle | `PUT /api/vehicles/:id` | Admin token; send any vehicle fields |
| Delete vehicle | `DELETE /api/vehicles/:id` | Admin token |
| Purchase vehicle | `POST /api/vehicles/:id/purchase` | Customer or admin token; decrements stock atomically |
| Restock vehicle | `POST /api/vehicles/:id/restock` | Admin token; `{"quantity":5}` |

## Learning notes

- **Authentication** proves identity with a signed JWT; it is required on every vehicle and inventory endpoint.
- **Authorization** checks the authenticated role, so only admins can add, update, delete, or restock.
- **Validation** happens at the HTTP boundary with Zod before services touch MongoDB.
- **Atomic purchase** uses one MongoDB update conditioned on `quantity > 0`; concurrent requests cannot drive stock below zero.
- **TDD** is visible in paired test and feature commits, especially the health endpoint and atomic purchase rule.

## My AI Usage

I used Codex as a learning partner to explain architecture, propose TDD test cases, generate initial implementation drafts, and diagnose TypeScript issues. I reviewed each change, ran the test suite and build locally, and retained responsibility for the final design decisions and commits.

`PROMPTS.md` will contain the required raw AI chat transcript before final submission.
