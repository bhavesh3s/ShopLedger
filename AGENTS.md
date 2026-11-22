# Repository Guidelines

## Project Structure

- `server.js` starts Express, serves `public/`, mounts the JSON API under `/api`, and serves printable invoices. `config.js` defines the port, shop details, GST slabs, and coupon rules.
- `routes/` contains the product, order, customer, and report handlers. Keep HTTP handling there and put reusable business logic in `lib/`. The browser UI lives in `public/index.html`, `public/js/app.js`, and `public/css/style.css`.
- `data/db.json` is the tracked data store for stock, orders, customer balances, settlements, and audit entries. See [the architecture diagram](docs/architecture.svg) for the order flow.

## Local Development and Testing

- `npm install` installs the Express and body-parser dependencies. `npm start` runs `node server.js` on port 3000 by default. Set `PORT` to override it. The browser assets are served directly.
- `npm test` is a placeholder that exits with an error. The repository has no configured test framework, coverage target, or test naming convention.
- Use a disposable checkout with a copy of `data/db.json` for manual checks that place orders, cancel orders, or record settlements. For pricing changes, exercise a mixed-GST cart with a capped coupon. Compare the preview, saved order, printable invoice, and reconciliation report. For Khata or stock changes, verify balances and inventory after placement and cancellation.

## Coding Style

Use two-space indentation, single quotes, and semicolons in JavaScript. Follow the surrounding CommonJS style using `require()` and `exports` or `module.exports`. Use camelCase for functions and variables, and short lowercase filenames such as `pricing.js`. There is no configured linter or formatter.

## Commits and Pull Requests

Recent commits use short, lowercase, descriptive subjects such as `invoice page for accountant`, with no required prefix evident in history. In a PR, summarize the behavior change, link the relevant issue if there is one, and list the checks you ran. Include screenshots for visible UI changes and expected totals for billing changes. Review the diff for accidental data changes or customer details before sharing.
