# Assets

**Art direction:** Premium Arabic IQ assessment interface. Deep midnight navy, electric cyan, warm amber, dark translucent panels, clean geometric puzzle symbols, subtle grid and grain, editorial whitespace, and restrained motion.

| Asset | Role | Source | Runtime strategy |
|---|---|---|---|
| `iq-arena-reference.png` | Visual target/reference for the finished game | Manus built-in image generation, prompt: in-game screenshot of a premium Arabic IQ assessment web game with a geometric question card, progress bar, timer, and cyan/amber palette | Kept outside the deploy tree at `/home/ubuntu/webdev-static-assets/`; runtime UI uses lightweight CSS primitives so the final bundle stays portable for GitHub Pages |
