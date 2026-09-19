# Security

- Never commit `.env`.
- Never store payment secrets in frontend code.
- Validate all client input on the server.
- Verify payment webhooks cryptographically.
- Use least-privilege database credentials in production.
- Keep PostgreSQL private.
- Add HTTPS before accepting real customer data.
- Add authentication/RBAC before opening vendor/admin operations.
- Keep audit logs for sensitive operations.
