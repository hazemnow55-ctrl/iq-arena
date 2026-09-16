# Game Plan: IQ Arena

## Visual direction

IQ Arena uses a premium analytical visual language: deep navy background, electric cyan primary accent, warm amber secondary accent, glass-like dark panels, geometric SVG/CSS puzzle visuals, and a restrained grain/grid texture. The interface is Arabic-first RTL but keeps the IQ ARENA brand in Latin characters for a clear product signature.

## Risk tasks

### 1. Timed question state machine
- **Why isolated:** Each question has its own timer, answer lock, delayed transition, and final scoring path. Timer races can otherwise double-submit or skip a question.
- **Approach:** Keep `current`, `selected`, `answers`, and `timeLeft` in the quiz component; disable answer buttons immediately, clear interval on effect cleanup, and score from the immutable question bank.
- **Verify:** Selecting an option advances once, timeout records `-1`, the timer resets per question, and the final score is shown after question 12.

### 2. Responsive visual puzzle renderer
- **Why isolated:** Multiple puzzle families must remain legible without image assets across desktop, tablet, and narrow mobile widths.
- **Approach:** Render semantic CSS/SVG-like primitives for sequences, matrices, odd-one-out cards, rotation, and arithmetic instead of loading large media.
- **Verify:** All visual types are visible at 1280px, 768px, and 390px widths with no clipping or overlap.

## Main build

- **Assets needed:** One generated visual reference at `/home/ubuntu/webdev-static-assets/iq-arena-reference.png` used to anchor the color, spacing, and visual density. Runtime puzzle art is procedural CSS so the GitHub Pages build remains portable and lightweight.
- **Gameplay:** Landing screen → 12-question timed test → score report with approximate IQ indicator, category breakdown, sharing, and restart.
- **Question coverage:** numeric sequence, verbal logic, shape sequence, Raven-style matrix, odd-one-out, mental rotation, pattern completion, logical arithmetic, comparison, quick thinking, analogy, and compound numeric matrix.
- **Verify:**
  - Start CTA opens the first question without navigation or network dependency.
  - Answers work by touch/click and keyboard 1–4.
  - Progress indicator, per-question timer, difficulty tag, feedback states, and side rail remain readable.
  - Results compute locally and can be copied/shared through the browser.
  - No missing assets, no backend dependency, and no console errors during capture.
  - Mobile layout collapses to one column and keeps actions reachable.
