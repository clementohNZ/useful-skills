/**
 * Mockups registry — the `mockups` skill appends one entry per generated mockup.
 * Loaded by mockups.html via <script src="./manifest.js"> so it works over file://
 * (browsers block fetch() of local files, so we use a plain global instead).
 *
 * Append new entries with the shape below; never remove earlier ones — the `n`
 * value is a global, monotonically increasing sequence that preserves order.
 */
window.MOCKUPS = window.MOCKUPS || [];

// window.MOCKUPS.push({
//   n: 1,
//   id: "000001",
//   title: "Example mockup",
//   group: "example-group",
//   path: "example-group/000001-example.html",
//   concepts: 10,
//   createdAt: "2026-01-01",
//   prompt: "what was asked",
// });
