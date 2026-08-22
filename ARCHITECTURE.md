# Architecture

## Overview

This repository is a small monorepo: `backend` provides the REST API and owns the MongoDB data model; `frontend` will be a React single-page application that consumes that API.

```text
React + Tailwind client
        |
        | HTTPS / JSON + Bearer JWT
        v
Express API
  ├─ auth module      (register, login, password hashing, JWT)
  ├─ vehicle module   (CRUD, search, validation)
  ├─ inventory module (purchase and restock business rules)
  └─ middleware       (authentication, role checks, errors)
        |
        v
MongoDB Atlas via Mongoose
  ├─ users
  └─ vehicles
```

## Backend layers

Each feature will use the same one-way dependency flow:

```text
route -> controller -> service -> Mongoose model
```

- **Routes** define HTTP method, URL, validation middleware, and access policy.
- **Controllers** translate HTTP requests into service calls and return HTTP responses.
- **Services** contain business rules, such as preventing negative vehicle stock.
- **Models** define persistent MongoDB document shape and indexes.

This separation makes services easy to unit-test and makes API integration tests easy to read.

## Data model

`User`: `name`, `email` (unique), `passwordHash`, `role` (`customer` or `admin`), timestamps.

`Vehicle`: `make`, `model`, `category`, `price`, `quantity`, timestamps. MongoDB supplies `_id`; the API exposes it as `id`.

Vehicle purchase will use an atomic MongoDB update with a `quantity > 0` condition. That prevents two simultaneous purchases from making inventory negative.

## Security boundaries

- Passwords are hashed with bcrypt and are never returned by the API.
- JWTs identify authenticated users.
- Authentication middleware protects vehicle and inventory routes.
- Role middleware restricts deletion and restocking to admins.
- Request validation rejects malformed input before it reaches the service layer.

## Testing strategy

- **Service tests**: business rules and edge cases.
- **API integration tests**: endpoint status, payloads, authentication, and authorization.
- **Frontend tests**: visible user behavior, such as disabled purchase buttons for zero stock.

Every behavior starts with a failing test, followed by the smallest passing implementation, then refactoring.
