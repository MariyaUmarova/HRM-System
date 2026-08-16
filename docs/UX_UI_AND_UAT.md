# UX/UI discovery and user acceptance testing

## Working agreement

- Every meaningful iteration is delivered through a GitHub pull request with a Vercel Preview URL.
- The product owner tests the iteration personally before it is merged.
- Feedback may affect any screen, flow, component, copy, navigation item, role, or interaction. The current implementation is a baseline, not a locked specification.
- A pull request is not merged into `main` until the product owner explicitly approves the tested iteration.
- Product data and integrations remain synthetic or isolated until their own implementation and approval gates are complete.

## Review package for every iteration

Each review request must contain:

1. the Vercel Preview URL;
2. the branch, pull request, and commit;
3. the exact screens and scenarios changed;
4. automated-check results;
5. known limitations;
6. a short manual test checklist;
7. screenshots for visual changes when useful.

## Product-owner test result

Use one of these statuses:

- **Approved** — the iteration can move to the next gate.
- **Changes requested** — feedback is converted into explicit tasks and the same Preview is updated.
- **Blocked** — a missing decision, asset, integration, or dependency prevents acceptance.

Recommended feedback format:

- Page or URL:
- Selected role:
- Scenario:
- Expected result:
- Actual result:
- What feels inconvenient or visually wrong:
- Screenshot or reference:
- Priority: blocker / important / improvement.

## UX/UI discovery inputs

Before high-fidelity design begins, collect and approve:

### Brand foundation

- current brandbook or identity guidelines;
- logo files and permitted variants, preferably SVG/PDF plus raster exports;
- primary, secondary, neutral, semantic, and accessibility colours;
- typography: font families, available weights, licences, and fallback fonts;
- iconography rules;
- illustration, photography, and motion principles;
- prohibited uses and legal brand requirements.

### Product references

For every reference, record both **what we like** and **what we do not want**:

- HR, ATS, CRM, knowledge-base, analytics, and AI-assistant products;
- dashboard and workflow patterns;
- density, navigation, tables, forms, cards, filters, search, and empty states;
- mobile and responsive examples where relevant.

### UX constraints and preferences

- target users, roles, and their most frequent jobs;
- supported devices, screen sizes, and browsers;
- language, terminology, and tone of voice;
- accessibility target and keyboard-navigation expectations;
- preferred information density;
- mandatory flows and information that must stay visible;
- current sections that should be preserved, simplified, combined, or rebuilt;
- desired emotional character of the product;
- technical or legal constraints.

## UX/UI process

1. Audit the current cloud baseline screen by screen.
2. Collect brand assets, references, constraints, and product-owner preferences.
3. Agree on information architecture and critical user flows.
4. Prepare moodboard and visual directions.
5. Approve design tokens: colours, typography, spacing, radii, elevation, icons, and motion.
6. Create low-fidelity flows and wireframes.
7. Create high-fidelity screens and an interactive prototype.
8. Run product-owner testing and record feedback for any affected section.
9. Implement an approved slice in a Preview deployment.
10. Retest before merging to `main`.

## Definition of ready for UX/UI implementation

UX/UI implementation starts only when:

- required brand assets and font usage rights are available;
- reference directions and anti-references are understood;
- priority roles and flows are agreed;
- the relevant wireframes or high-fidelity screens are approved;
- acceptance criteria and test scenarios are written;
- the change can be reviewed in a Vercel Preview without production data.
