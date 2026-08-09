# Ivideon HR Hub — targeted QA correction

Work only inside this project. Read `CLAUDE.md` and the approved source
`../deliverables/Ivideon_HR_Hub_Final_Concept_for_Approval_v1_1.md`, especially sections 9 and 10.

The Phase 1 build passes lint, tests and production build, but visual QA found a product-content mismatch on workflow stage 7, `Согласовываю оффер`.

Correct it so the UI exactly reflects the approved concept:

1. Entry to the process must explicitly say that the customer, recruiter, HRBP, Head of Recruitment, and other evaluation participants agree that the candidate fits and the company is ready to make an offer.
2. The process participants must be: recruiter, Head of Recruitment, HRBP, HRD / Director of HR, CEO / General Director, and HR Operations / кадровая функция.
3. Keep the separately approved fixed email routing rule: To — Head of Recruitment and HRD; CC — Alena Aleshova and Maria Komissarova from KDP. Make clear that the email-routing list is not the same thing as the full set of business-process participants.
4. Restore the detailed recruiter instruction from the approved concept: where to start, who the email goes to, email subject, what the body must contain, what files are attached, new headcount versus replacement, interview stages, candidate source, position, department, manager, compensation, work format, Huntflow profile link, cleaned CV PDF, final offer PDF, separate role-tasks page, version confirmation, and the final review screen before creating a draft email.
5. The completion criteria must explicitly include: conditions confirmed by route participants; offer approved by HRD / Director of HR; offer approved by the General Director; the exact approved PDF version is saved; offer is ready to present to the candidate. A material change must invalidate the prior approval and start re-approval.
6. Update the stage 7 short description so it does not incorrectly imply that only Head of Recruitment and HRD approve the offer.
7. Preserve the exact fixed 10-stage order and do not change the adaptation-stage content.
8. Add or update focused tests so this regression cannot return. Keep existing 51 tests passing or increase the count.
9. Keep the interface calm and readable; if the detailed instruction becomes long, structure it into compact sections rather than one dense paragraph.

After editing, run `pnpm lint`, `pnpm test`, and `pnpm build`. Finish with a concise list of changed files and check results.
