# SMS Forwarder

Cloudflare Worker that accepts an authenticated JSON request from iOS Shortcuts and forwards it to Discord as an Embed.

## GitHub Actions deployment secrets

Configure these repository secrets:

- `CLOUDFLARE_API_TOKEN`: Cloudflare API token with permission to deploy Workers.
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare account ID.

Pushing changes to `main` deploys the Worker automatically.

## Cloudflare Worker runtime secrets

After the first successful deployment, open **Cloudflare Dashboard → Workers & Pages → sms-forwarder → Settings → Variables and Secrets** and add:

- `SMS_FORWARDER_API_KEY`: a long random key used to authenticate incoming requests.
- `DISCORD_WEBHOOK_URL`: the Discord webhook URL. Keep this secret.

Do not put the Discord webhook URL or API key in the source code, Shortcut text, or a public issue.

## Endpoint

- `GET /`: health check.
- `POST /` or `POST /sms`: forwards a message to Discord.

Send JSON with these fields:

```json
{
  "sender": "Service name",
  "message": "Example notification",
  "receivedAt": "2026-10-27 12:00:00"
}
```

Authenticate with the `X-API-Key` header set to the value of `SMS_FORWARDER_API_KEY`.

Successful response:

```json
{ "ok": true }
```

The Worker does not intentionally log message content. Treat forwarded SMS as sensitive because messages can contain login codes.
