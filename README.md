# DCA Lab — GitHub Pages edition

A self-contained, mobile-friendly **static website** for modeling dollar-cost averaging through stock-price drawdowns, and estimating investment returns if the share price recovers to an all-time high. Runs entirely in the browser. **No Python, Node, database, API key, paid host, or build step is required.**

## Publish on GitHub Pages (recommended)

1. Create a new GitHub repository, e.g. `dca-lab` (set it **Public** for straightforward GitHub Pages access).
2. Extract the provided ZIP and upload its **contents** to the repository's root. `index.html` must be at the root, next to `app.js` and `manifest.webmanifest` — do **not** nest the website under another folder.
3. In GitHub, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**, branch **main**, folder **/(root)**, then **Save**.
5. After GitHub finishes deploying, visit `https://YOUR-USERNAME.github.io/dca-lab/` (replace the username and repository name). You can find the exact URL in Settings → Pages.

For a `YOUR-USERNAME.github.io` repository, the website is at `https://YOUR-USERNAME.github.io/` instead.

The site uses only relative file paths, so it works in both repository and user-site hosting modes. The `.nojekyll` file asks GitHub Pages to publish the files unchanged.

## Try it locally

Run from the extracted directory:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/` in your browser. Opening `index.html` by double-clicking may show the calculator, but service worker/PWA installation needs localhost or HTTPS.

## Add it to your phone's Home Screen

- **iPhone:** Open your published HTTPS URL in Safari → Share → Add to Home Screen.
- **Android:** Open in Chrome → menu → Install app or Add to Home screen.

After the first successful visit, cached assets support offline usage. Settings are saved in browser local storage on the device.

## Features

- Change simulated target stock decline (5–90%) and buying interval (1–25 **percentage points** from starting price).
- Change purchase step-up multiplier (1×–4×), starting share price, ATH price, initial contribution, and total capital budget.
- View purchase schedule, budget usage, loss at target, highest interim loss, portfolio value and return at ATH.
- Interactive SVG risk chart, mobile navigation, CSV export, and plan sharing.
- All calculations happen on the device. No live stock quotes or brokerage connection.

## Important methodology

- Buy orders are triggered at declines measured from the original **starting price**: 10% interval triggers at −10%, −20%, etc., not at successive compounded declines.
- Loss is the unrealized loss divided by **cumulative amount invested**, not conventional high-watermark-to-trough drawdown.
- Peak loss includes moments immediately *before* purchases, and the target endpoint, along a monotonic, continuous-price decline.
- Capital is limited by the configured cap. A large contribution can reduce the *percentage* loss without reversing the euro loss.
- ATH profit assumes all shares are still held when the price reaches the selected ATH. It ignores dividends, taxes, fees, slippage and the time needed to recover.
- This is an educational scenario simulator, not trading software or an assurance of a strict maximum 10% loss. Price gaps may exceed any risk threshold.

## Files

| File | Purpose |
|---|---|
| `index.html` | Layout and responsive CSS |
| `app.js` | Scenario math, SVG chart, CSV export, and settings |
| `manifest.webmanifest` | Add-to-home-screen metadata |
| `service-worker.js` | Offline caching |
| `icons/` | Home-screen icons |
| `.nojekyll` | Bypass GitHub Pages' Jekyll processing |
