# Approved product decisions

These decisions are durable unless the product owner explicitly changes them.

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
- HRBP, General Director and HR Operations/KDP may participate in business processes
  without receiving portal accounts in the current scope.
- Customers may access only their own request through an isolated protected surface.

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
- The current browser-print implementation is a testable prototype. Final pagination,
  legal copy and brand fidelity require product-owner review before persistence or
  automated delivery is connected.

## UX and content

- Reduce visual noise; prefer calm layouts and progressive disclosure.
- A ? help marker remains visible while hovered or keyboard-focused and closes
  when the pointer/focus leaves. On touch it opens by tap and closes by outside tap.
- Search must be predictable, typo-tolerant and keyboard-accessible.
- Russian copy must be proofread; AI spelling correction is a future assistive
  feature and must not silently alter approved legal/business content.
- Adaptation-stage content must not be changed without explicit approval.

## Data and security

- Use synthetic data during development and demos.
- Never commit credentials, tokens, real CVs, real offer files or candidate PII.
- Access control is enforced server-side and with PostgreSQL RLS, not only in UI.
- Use least privilege, audit sensitive actions and encrypt data in transit and at rest.
