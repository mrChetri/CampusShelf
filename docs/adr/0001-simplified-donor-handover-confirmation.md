# 0001: Simplified Single-Sided Handover Confirmation for MVP

For the MVP physical campus handover, only the donor is required to confirm handover completion by clicking "Mark as Donated", which immediately transitions the listing and request to `COMPLETED`. The recipient does not enter an OTP code or submit a second confirmation. Recipients are provided an asynchronous "Report a Problem" option to flag disputes or unfulfilled handovers for moderator review.

## Considered Options

- **Two-sided confirmation with hashed OTP**: Required the recipient to type an expiring 6-digit code or scan a QR code presented by the donor, and both parties to click confirm before completion. Rejected for MVP because it creates friction during quick in-person campus exchanges and adds failure modes (network latency, dead phone batteries) on physical handover.
- **Single-sided donor confirmation with recipient dispute path**: Low-friction completion with safety guardrails against false claims via report/dispute escalation. Accepted.

## Consequences

- Simplifies database schema and endpoints: no OTP code generation, hashing, rate-limiting, or expiration tables required in MVP.
- Simplifies CS-008 vertical slice to focus on meeting location agreement, "Mark as Donated" action, and "Report a Problem" flow.
