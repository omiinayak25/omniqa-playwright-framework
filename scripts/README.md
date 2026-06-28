# Scripts — OMNIQA Playwright Framework

- **Purpose** — Operational scripts for provisioning the dedicated PostgreSQL test database used by the DB and E2E suites.

## Files

| File              | Responsibility                                                                                                                                                                          |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `db/provision.sh` | Idempotent Bash provisioner — creates the `automation_user` role and `automation_db` database (if absent) and applies `schema.sql`.                                                     |
| `db/schema.sql`   | Idempotent, re-runnable schema + seed — `departments`/`employees`/`products` tables, FKs, CHECK constraints, an `active_employees` view, indexes, and a `give_raise()` stored function. |

## Responsibilities

- Stand up an isolated test database from scratch, safe to re-run.
- Define the schema and seed data that repositories and DB tests rely on.

## Dependencies

- PostgreSQL (`psql`), `sudo` access to the `postgres` role; honors `DB_NAME`/`DB_USER`/`DB_PASS` env overrides.

## Interacts With

- Produces the schema exercised by `@repositories/*`, `@database/*`, and `tests/db/*` / DB-touching E2E specs.

## Usage Example

```bash
sudo bash scripts/db/provision.sh
# or override defaults:
DB_NAME=automation_db DB_USER=automation_user DB_PASS=secret sudo -E bash scripts/db/provision.sh
```
