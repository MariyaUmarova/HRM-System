# Approved product decisions

These decisions are durable unless the Product Owner explicitly changes them.

## Product boundary

- The portal teaches the process and reduces HR routine work.
- Huntflow remains the only source of truth for vacancies and candidates.
- Do not recreate Huntflow vacancy lists, candidate pipelines or candidate cards.
- Store only the minimum external IDs, links, sync state and derived workflow data
  required for portal automation.
- The knowledge base is a primary recruiter workspace, not a secondary academy.
- There are no courses, tests or learner progress mechanics in the approved scope.

## Roles

- Recruiter.
- Head of Recruitment.
- HRD.
- Customer.
- Head of Recruitment and HRD have the same management permissions.
- There is no separate Administrator account in the approved user model.
- A signed-in user's role and interface are assigned by trusted server-side identity
  data; users cannot change roles from a site menu.
- HRBP, General Director and HR Operations/KDP may participate in business processes
  without receiving portal accounts in the current scope.
- Customers may access only their own request through an isolated protected surface.
- Every internal user has a personal account; accounts are not shared.
- Head of Recruitment and HRD may prepare invitations with the same permissions.
- Invitations accept only corporate addresses in the exact @ivideon.com domain.
- An invitation assigns either Recruiter or Customer. A Customer invitation also
  requires the person's department and position.

## Exact workflow order

1. Получена новая вакансия
2. Провожу бриф
3. Ищу кандидатов
4. Провожу HR-интервью
5. Показываю кандидата заказчику
6. Провожу совместное интервью с заказчиком
7. Согласовываю оффер
8. Делаю оффер кандидату
9. Готовлю выход сотрудника
10. Сопровождаю адаптацию

The same order must be used on the home screen, full route, knowledge navigation and
all generated material.

## Required structure of every stage

- Вход в процесс.
- Участники.
- Процесс завершён, когда.

Navigation back must work by level: detail → workflow/section → stage → full route →
home.

## Offer approval

- Entry condition: customer, recruiter, HRBP, Head of Recruitment and any other
  assessment participants agree that the candidate fits and an offer should be made.
- Approval participants: recruiter, Head of Recruitment, HRBP, HRD, General Director
  and KDP/HR Operations.
- Completion condition: the offer is approved by the HRD and General Director.
- Generated approval email is addressed strictly to Head of Recruitment and HRD.
- CC is fixed to the KDP direction: Alena Aleshova and Maria Komissarova. Their email
  addresses will be configured later, never hard-coded as guessed values.
- The package includes position type (new headcount/replacement), interview stages,
  source, position, department, manager, compensation, work format, Huntflow profile
  link, sanitized offer PDF and sanitized CV PDF.
- Every generated PDF/email must have an explicit version, author, timestamp and
  audit record. “Protected from unnoticed change” means the exact approved artifact
  can be traced and compared; it does not mean the user can never make a new version.
- The product owner's 2026 Ivideon offer PDF is the current visual reference. The
  filled source file and its personal data must not be committed; development and
  previews use synthetic values only.
- The current client-side PDF/PNG/PPTX implementation is a testable prototype. Every
  format uses the same fixed visual pages; PPTX pages are full-slide images for fidelity.
  Final legal copy and brand fidelity still require product-owner review before
  persistence or automated delivery is connected.

## UX and content

- Reduce visual noise; prefer calm layouts and progressive disclosure.
- A ? help marker remains visible while hovered or keyboard-focused and closes
  when the pointer/focus leaves. On touch it opens by tap and closes by outside tap.
- Search must be predictable, typo-tolerant and keyboard-accessible.
- Russian copy must be proofread; AI spelling correction is a future assistive
  feature and must not silently alter approved legal/business content.
- Adaptation-stage content must not be changed without explicit approval.

## Recruit shell and information architecture

- The Ivideon Recruit standalone HTML is the visual and wording reference for the
  selected Recruit workspace. The HTML is a read-only source; the production
  application remains a typed Next.js application and must not be replaced by one
  giant imperative HTML file.
- Approved standalone wording for the selected Recruit sections is transferred
  verbatim. AI agents must not silently shorten, rewrite, “improve” or reconcile that
  copy. Product-required structural changes are recorded explicitly instead.
- When the Product Owner upload and the repository historical standalone differ, the
  upload wins for approved selected content. The current implementation pins the exact
  upload identity and stores an attachment-derived delta for changed selected objects;
  the historical file may be reused only for objects proven identical by deterministic
  comparison. Historical-only objects absent from the upload must not leak into runtime.
- The permanent internal sidebar contains only: Главная; Рабочие ситуации; Скрипты;
  Шаблоны и чек-листы; Помощники; HR Radar.
- The full recruiter workflow remains contextual from Главная and keeps the exact
  approved ten-stage order above even if an older standalone reference used another
  grouping or order.
- A separate “База знаний” destination is removed from the target IA. Its relevant
  content lives contextually in the workflow, playbooks, scripts, templates,
  checklists and search.
- “Центр офферов” and “Анализ интервью” are not permanent sidebar items. They remain
  working routes entered through “Помощники”.
- “Помощники” currently contains exactly two approved tools: the existing HR Hub
  Interview Analysis implementation and the existing HR Hub Offer Builder. They must
  remain functional; decorative cards or reimplemented standalone mock generators are
  not an acceptable substitute.
- Constructors do not belong in “Шаблоны и чек-листы”. Constructors live under
  “Помощники”; templates and checklists remain reference/action materials.
- Adaptation content is not imported into the new Recruit workspace yet. Stage 10 may
  remain visible as a process boundary, but the adaptation vertical is backlog until a
  separate product decision.
- Existing role/access boundaries, customer requests, weekly focus, HR Radar and
  Offer/Interview functionality remain part of HR Hub. The redesign must not remove
  these technical/product capabilities merely because navigation is simplified.
- Head of Recruitment and HRD access platform management through a compact gear near
  the profile area. This does not create an Administrator role.
- New customer requests and team weekly focus remain visible to management on the
  home screen; “Все заявки заказчиков” remains a contextual management action.

## Weekly focus

- Head of Recruitment and HRD manage weekly focus with the same permissions.
- Recruiter sees only their own active weekly-focus items.
- Customer has no weekly-focus or platform-management access.
- A weekly-focus item contains the recruiter owner, task, priority/comment and only a
  Huntflow vacancy reference (external id/title/department/deep link). This must never
  become a vacancy catalog.
- Closing a focus removes it from the Recruiter's active view but the durable backend
  retains the closed record for management/history/audit instead of physically deleting
  it.
- Durable writes are server-controlled and audited; browser roles do not receive direct
  INSERT/UPDATE/DELETE privileges on weekly-focus storage.
- Reviewed durable create/update/close operations are service-role-only database RPCs.
  The future Next.js server layer must derive `actor_user_id` from the validated session;
  it must never trust an actor id supplied by the browser.
- Every successful durable weekly-focus mutation and its `audit_events` record are one
  atomic database transaction: if audit fails, the business mutation fails too.
- Update and close use optimistic concurrency. A weekly-focus row version must advance
  strictly on every update, even for multiple writes inside one PostgreSQL transaction;
  stale writes fail instead of silently overwriting a newer management edit.
- `closed_at` must never precede the final `updated_at` row version.
- Closed weekly-focus rows cannot be updated, reopened or physically deleted through the
  reviewed mutation RPC contract.
- The current accepted UI implementation may use browser/localStorage mock persistence
  until the approved HRM backend environment and real Auth/session boundary are ready.
  Mock persistence must never be described as production persistence.

## Customer requests

- Source Customer request data is visible only to the owning Customer and Head/HRD.
  Recruiter receives no direct source-request or source-event read access, including
  after assignment.
- The durable request state machine is exactly:
  - `draft` or `returned` → `submitted`;
  - `submitted` → `returned` or `accepted`;
  - `accepted` → `assigned`.
- Customer may edit narrative fields only while the request is `draft` or `returned`,
  and may edit/submit only their own request.
- Customer ownership is immutable after request creation.
- Returning for revision is a Head/HRD action and requires a non-empty revision comment.
- Accepting and assigning are Head/HRD actions. Assignment requires an active Recruiter.
- `assigned` is terminal in the currently approved request-management state machine;
  no reassignment, reopen or physical-delete application path is approved yet.
- Application transition history is append-only. Draft content edits produce audit but
  do not create fake status-transition events.
- Reviewed request mutations use strict optimistic concurrency and atomically write their
  business change, transition event where applicable, and `audit_events` record. If audit
  fails, the request transition/event must roll back.
- Audit metadata must not copy Customer request narrative or revision-comment content.
- The future server adapter must derive the actor from validated identity/session data;
  browser-supplied actor ids are never trusted.
- Secure expiring/single-purpose request-link issuance, revocation, expiry and request
  creation behind that link are a separate security boundary and are **not** implied by
  the current mock `[token]` route or by the database state-machine RPCs.
- Do not treat assignment as authorization to create a Huntflow vacancy automatically.

## Data and security

- Use synthetic data during development and demos.
- Never commit credentials, tokens, real CVs, real offer files or candidate PII.
- Access control is enforced server-side and with PostgreSQL RLS, not only in UI.
- Use least privilege, audit sensitive actions and encrypt data in transit and at rest.
- Application audit history should be append-only. Current top-stack usage contains
  INSERT writers and no legitimate UPDATE/DELETE writers; a dedicated hardening migration
  may revoke service-role UPDATE/DELETE while preserving database-owner maintenance.
- Do not apply HRM migrations to a cloud project selected only from stale docs/issues;
  the target environment must be explicitly identified and approved first.

## Interview material processing

- The input may combine a full transcript, a short summary, recruiter notes, feedback
  from other interviewers, audio and video.
- Audio processing means transcription and optional speaker diarization before the same
  evidence-linked analysis. Video processing separates the audio track and limited,
  reviewable observations from key frames.
- The product must not infer emotions, personality, honesty or protected traits from a
  face or voice.
- Sensitive/protected employment characteristics must not be used as evidence-matching,
  scoring, ranking or hiring criteria. The analysis model must exclude such criteria
  before evaluation rather than relying only on UI warnings. At minimum this boundary
  covers age/date of birth, sex/gender, race/ethnicity/nationality, religion, disability
  or health, pregnancy, family/children status, sexual orientation, political views and
  trade-union membership.
- A blocked sensitive criterion may be surfaced only as an excluded-policy item; it must
  not become a positive/negative conclusion, follow-up evaluation request, candidate
  ranking signal or Huntflow assessment criterion.
- Real candidate media cannot be accepted until a cloud processor, private storage,
  retention/deletion period, role access and audit trail are approved.
- The current preview validates formats but does not read or upload selected media.

## HR Radar automation

- Automatic discovery is intended to run every day at 09:00 Moscow time.
- A newly discovered link is stored as `pending_review` and is never published
  automatically.
- The first direct adapter is the public Mintrud document RSS feed.
- Any ChatGPT scheduled discovery task must be independently verified as active before
  it is described as running infrastructure.
- Search and summaries are a discovery layer, not a publication authority. HR review
  is mandatory before a card becomes visible.
- The ingestion flow stores source metadata, title, date, canonical link, short summary,
  relevance and tags, not a full copied article.
