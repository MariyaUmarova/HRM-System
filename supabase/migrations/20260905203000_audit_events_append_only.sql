-- Application audit history is append-only.
--
-- Git-only hardening: do not apply to an unapproved cloud project.
-- Existing reviewed writers only INSERT audit events. Application service_role may read
-- and append audit records, but cannot rewrite or delete prior history. Database-owner
-- maintenance remains outside the application role and requires a separate operational
-- procedure/decision.

revoke update, delete on table public.audit_events from service_role;
