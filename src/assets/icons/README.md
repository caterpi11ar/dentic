# Icons

Stroke icons here are adapted from [Lucide](https://lucide.dev) — ISC License.

WeChat `<Image>` renders SVG as bitmap, so CSS `color` does not propagate to
`stroke="currentColor"`. Each icon's stroke color is hardcoded per usage:

- `#C96442` — primary (active tabs, primary affordances)
- `#5E5D59` — content secondary (inactive tabs, neutral icons)
- `#FFFFFF` — on primary surface (e.g. completion checkmark)

If a new icon needs both colors, ship two files (`-active` / `-inactive`) and
keep the SVG paths identical, varying only the `stroke` value.
