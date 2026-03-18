# Donor Confirmation Scope Alignment

This project now treats donor confirmation notifications as an in-scope donations capability.

## Scope Statement

- Monetary donations trigger donor confirmation notification dispatch after successful donation persistence.
- Physical donations trigger donor confirmation notification dispatch after successful donation persistence.
- Notification payload includes donor name, donor email, product name, donation type, and donation date.
- Monetary payload also includes donation amount in cents.

## Delivery Contract

- Delivery is configured via `DONATION_NOTIFICATION_WEBHOOK_URL`.
- Optional authentication uses `DONATION_NOTIFICATION_WEBHOOK_TOKEN` as a Bearer token.
- Donation persistence is not rolled back when notification delivery fails.
- Notification failures are exposed in the action response `details.notification` to avoid silent failures.
