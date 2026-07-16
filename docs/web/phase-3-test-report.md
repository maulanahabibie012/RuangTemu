# Phase 3 — Registration & Ticketing: Test Report

**Date:** 2026-07-16  
**Total Tests:** 109 (60 API + 49 Web) — ALL PASSING ✅

---

## Backend API Tests (`apps/api`)

### Test Suites: 6 passed, 6 total | Tests: 60 passed

| Suite | Tests | Status |
|-------|-------|--------|
| `registrations.service.spec.ts` | 18 | ✅ PASS |
| `payments.service.spec.ts` | 14 | ✅ PASS |
| `events.service.spec.ts` | 14 | ✅ PASS |
| `events.controller.spec.ts` | 9 | ✅ PASS |
| `app.controller.spec.ts` | 3 | ✅ PASS |
| `app.service.spec.ts` | 2 | ✅ PASS |

### New Phase 3 Test Coverage

**RegistrationsService (18 tests):**
- Service instantiation
- Register: event not found (NotFoundException)
- Register: event not active (BadRequestException)
- Register: event full (BadRequestException)
- Register: organizer self-register blocked (BadRequestException)
- Register: duplicate registration (ConflictException)
- Register: free event → CONFIRMED immediately + QR code
- Register: paid event → PENDING + heldUntil timeout
- getMyRegistrations: returns user registrations excluding cancelled
- getRegistrationById: not found (NotFoundException)
- getRegistrationById: not owner (ForbiddenException)
- getRegistrationById: returns for owner
- cancelRegistration: not found (NotFoundException)
- cancelRegistration: not owner (ForbiddenException)
- cancelRegistration: already cancelled (BadRequestException)
- cancelRegistration: success + decrement count
- confirmPayment: not found (NotFoundException)
- confirmPayment: not pending (BadRequestException)
- confirmPayment: success + QR code generation

**PaymentsService (14 tests):**
- Service instantiation
- createPayment: registration not found (NotFoundException)
- createPayment: not owner (ForbiddenException)
- createPayment: not pending (BadRequestException)
- createPayment: free event blocked (BadRequestException)
- createPayment: success with amount + platformFee
- handleWebhook: payment not found (NotFoundException)
- handleWebhook: settlement → confirm payment
- handleWebhook: cancel → mark FAILED
- handleWebhook: expire → mark FAILED
- simulatePayment: registration not found (NotFoundException)
- simulatePayment: not owner (ForbiddenException)
- simulatePayment: success → confirm registration

---

## Frontend Web Tests (`apps/web`)

### Test Suites: 12 passed, 12 total | Tests: 49 passed

| Suite | Tests | Status |
|-------|-------|--------|
| `registrations-api.test.ts` | 8 | ✅ PASS |
| `e-ticket.test.tsx` | 5 | ✅ PASS |
| `page.test.tsx` (home) | 3 | ✅ PASS |
| `search.test.tsx` | 1 | ✅ PASS |
| `event-detail.test.tsx` | 4 | ✅ PASS |
| `event-form.test.tsx` | 6 | ✅ PASS |
| `create-event.test.tsx` | 3 | ✅ PASS |
| `my-events.test.tsx` | 3 | ✅ PASS |
| `event-card.test.tsx` | 2 | ✅ PASS |
| `button.test.tsx` | 5 | ✅ PASS |
| `utils.test.ts` | 3 | ✅ PASS |
| `demo-events.test.ts` | 6 | ✅ PASS |

### New Phase 3 Test Coverage

**registrations-api.test.ts (8 tests):**
- registerForEvent: POST /api/registrations with eventId
- getMyRegistrations: GET /api/registrations/me
- getRegistrationById: GET /api/registrations/:id
- cancelRegistration: POST /api/registrations/:id/cancel
- createPayment: POST /api/payments/create with registrationId
- simulatePayment: POST /api/payments/simulate/:registrationId
- Error handling: throws on non-ok response
- Auth: includes Authorization header when token exists

**e-ticket.test.tsx (5 tests):**
- Renders ticket with event info and QR code section
- Renders download and print buttons
- Shows free ticket type label
- Returns null if status is not CONFIRMED
- Returns null if no qrCode

---

## Phase 3 Deliverables Summary

### Backend (`apps/api`)
- ✅ Prisma schema: Registration, Payment models (enums: RegistrationStatus, PaymentStatus)
- ✅ RegistrationsModule, RegistrationsService, RegistrationsController
- ✅ PaymentsModule, PaymentsService, PaymentsController
- ✅ EmailModule, EmailService (stub for future notifications)
- ✅ RegistrationTimeoutService (auto-expire held registrations)
- ✅ DTOs: CreateRegistrationDto, CreatePaymentDto
- ✅ RSVP/Register endpoint: POST /api/registrations
- ✅ My registrations: GET /api/registrations/me
- ✅ Registration detail: GET /api/registrations/:id
- ✅ Cancel registration: POST /api/registrations/:id/cancel
- ✅ Create payment: POST /api/payments/create
- ✅ Webhook handler: POST /api/payments/webhook
- ✅ Payment simulation: POST /api/payments/simulate/:registrationId
- ✅ Free event: instant CONFIRMED + QR code
- ✅ Paid event: PENDING + 15-min hold + payment flow
- ✅ QR code generation (UUID-based)
- ✅ Capacity management (increment on register, decrement on cancel)
- ✅ Ownership guards on all user-specific endpoints
- ✅ Unit tests: 32 new tests (18 registrations + 14 payments)

### Frontend (`apps/web`)
- ✅ Registration types (`src/types/registration.ts`)
- ✅ Registrations API client (`src/lib/registrations-api.ts`)
- ✅ RSVP page (`/events/[id]/rsvp`)
- ✅ Payment page (`/events/[id]/payment`)
- ✅ Payment result page (`/events/[id]/payment/result`)
- ✅ My Tickets page (`/my-tickets`)
- ✅ Ticket detail page (`/my-tickets/[id]`)
- ✅ E-Ticket component with QR code display
- ✅ Download QR + Print functionality
- ✅ Event detail page: Register/RSVP button integration
- ✅ Layout: My Tickets nav link
- ✅ Unit tests: 13 new tests (8 registrations-api + 5 e-ticket)

---

## Run Commands

```bash
# Backend tests
cd Website/apps/api && npm test

# Frontend tests
cd Website/apps/web && npx vitest run
```
