# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| `main` branch | Yes |
| Tagged releases | Latest only |

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Email **security@catalystnexus.io** with:

- Description of the vulnerability and its potential impact
- Steps to reproduce or proof-of-concept (if safe to share)
- Any suggested mitigations

You will receive an acknowledgment within 48 hours. We aim to release a fix within 14 days for critical issues and 30 days for non-critical ones. We will credit reporters who wish to be named after the fix is released.

## Security Architecture Notes

### Authentication

The current auth mechanism is a shared **API key** passed as a bearer token or `X-Api-Key` header. This is appropriate for single-unit isolated deployments; for multi-tenant or enterprise use, replace with:

- CAC/PIV mutual TLS (X.509 client certificates via PKCS#11)
- DoD PKI-signed JWTs
- Integration with Keycloak or Istio auth policies

### Network

- The React SPA communicates only with the local API; all requests are same-origin in production (nginx reverse proxy).
- `CORS_ORIGIN` must be set to a specific hostname in production. The value `*` is only appropriate in truly isolated, single-workstation deployments.
- In Kubernetes, use `NetworkPolicy` to restrict pod-to-pod communication to only required paths (web→api, api→postgres, etl→postgres).

### Data

- All seed data in `seed/` is **completely synthetic** — no real personnel records.
- The platform is designed to process data classified up to the level of the network it is deployed on. Classification controls (including proper markings and handling) are the responsibility of the deploying organization.
- The ETL drop directory (`ETL_DROP_DIR`) should be write-accessible only to authorized SOR feed processes, and read-only for the ETL CronJob. The API container has no access to this path.

### Container Hardening

- All containers run as non-root (UID 10001 / 10002).
- For STIG compliance: switch to distroless base images, add `seccomp` profiles, set `readOnlyRootFilesystem: true`, and configure `PodSecurityAdmission` enforcement.

### Secrets Management

- Secrets (`API_KEY`, `PG_PASSWORD`, `DATABASE_URL`) are injected at runtime via Kubernetes Secrets or environment variables.
- Never commit `.env` files. Only `.env.example` (with no real values) is committed.
- In air-gap deployments via Zarf/UDS, credentials are prompted interactively at deploy time and injected as Kubernetes Secrets — they do not travel inside the package archive.
