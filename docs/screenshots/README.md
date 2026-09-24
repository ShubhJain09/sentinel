# SENTINEL screenshot capture plan

This directory contains real, sanitized product screenshots used by the repository README. Do not add mockups or generated interfaces and do not capture production data.

## Recommended captures

| File | View | What the frame should demonstrate |
|---|---|---|
| `overview-product.png` | `/overview` | Security posture, scan/finding summary, and recent audit activity |
| `ai-workspace-trueforge.png` | `/ai-workspace` | A defensive response plus visible TrueForge session/model/run metadata |
| `finding-evidence.png` | `/findings/<id>` | Finding context, observed evidence, impact, and recommendation |
| `approval-review.png` | `/approvals/<id>` | Reviewable remediation diff and explicit human decision controls |
| `agent-passport.png` | `/agents/<id>` | Declared capabilities, approval requirements, and trust context |
| `audit-log.png` | `/owner/audit` | Actor/action/target history without sensitive metadata |

## Capture rules

- Use seeded or synthetic demonstration data only.
- Redact API keys, tokens, cookies, personal email addresses, private IDs, filesystem paths, and provider tenant details.
- Keep the same viewport, theme, and browser zoom across the set; `1440 × 900` is a good default.
- Capture the application viewport, not browser chrome or the desktop.
- Verify that text remains readable in GitHub’s rendered README width.
- Prefer PNG for interface captures and use concise alt text when embedding them.

## README gallery snippet

The README currently includes the safe Overview, Finding, Approval, and Agent Passport captures. Add AI Workspace or audit images only after their runtime session IDs and user identifiers have been masked or replaced with synthetic values.

For future gallery updates, use a compact table:

```markdown
| Overview | TrueForge-powered AI Workspace |
|---|---|
| ![SENTINEL overview](docs/screenshots/overview-product.png) | ![SENTINEL AI Workspace showing TrueForge run metadata](docs/screenshots/ai-workspace-trueforge.png) |

| Finding and evidence | Human approval |
|---|---|
| ![SENTINEL finding and evidence](docs/screenshots/finding-evidence.png) | ![SENTINEL approval review](docs/screenshots/approval-review.png) |
```
