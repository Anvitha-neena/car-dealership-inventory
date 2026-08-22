# Test Report

**Status:** Passing  
**Generated:** 22 August 2026  
**Test framework:** Vitest

## Summary

| Area | Test files | Tests | Result |
| --- | ---: | ---: | --- |
| Backend | 5 | 9 | Passed |
| Frontend | 1 | 1 | Passed |
| **Total** | **6** | **10** | **Passed** |

## Commands executed

```bash
npm run test:backend
npm run test --workspace=@car-dealership/frontend
npm run build --workspace=backend
npm run build --workspace=@car-dealership/frontend
```

Both TypeScript production builds completed successfully after the test suites.

## Backend coverage scope

- Health endpoint returns the expected service status.
- Runtime environment configuration requires a MongoDB URI and JWT secret.
- User documents normalize email addresses, require password hashes, and default to customer roles.
- Password hashing verifies valid credentials and rejects invalid credentials.
- Purchasing uses an atomic quantity update and rejects out-of-stock inventory.

## Frontend coverage scope

- The vehicle purchase button is disabled and labelled **Out of stock** when quantity is zero.

## Manual end-to-end verification

The following flows should be demonstrated manually against MongoDB Atlas using the running application or Thunder Client:

1. Register and log in as a customer.
2. Seed and log in as an administrator.
3. Create, filter, edit, restock, and delete a vehicle as an administrator.
4. Purchase an in-stock vehicle as a customer and confirm the purchase pop-up.
5. Confirm an out-of-stock vehicle cannot be purchased.
