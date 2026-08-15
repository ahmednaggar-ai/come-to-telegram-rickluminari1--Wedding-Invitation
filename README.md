# Wedding Invitation

A responsive digital wedding invitation for **Mohamed & Rahma**, built with HTML, CSS, and JavaScript. The page opens with an animated loading screen, double doors, and a fireworks celebration before revealing the full invitation.

## Features

- **Animated intro** — “We would like to invite you” with loading dots
- **Door opening effect** — 3D-style double doors reveal the invitation
- **Celebration animation** — Fireworks and confetti in gold, sage, and cream tones
- **Elegant layout** — Arabic calligraphy, Quranic verse, names, date, and venue
- **Responsive design** — Full viewport height (`100vh`), optimized for mobile and tablet
- **Decorative assets** — Floral left border and bride & groom silhouette

## Event Details

|            |                           |
| ---------- | ------------------------- |
| **Couple** | Mohamed & Rahma           |
| **Date**   | Thursday, August 20, 2026 |
| **Time**   | 08:00 PM                  |
| **Venue**  | Green Plaza, Kafr Abrash  |

## Project Structure

```
.
├── index.html              # Main HTML entry point
├── src/
│   ├── css/
│   │   └── style.css       # All styles and animations
│   ├── js/
│   │   ├── script.js       # Loader timing and door sequence
│   │   └── celebration.js  # Fireworks & confetti canvas effect
│   └── images/
│       ├── download-removebg-preview.png
│       └── AI generated Silhouette elements of the bride and….png
└── README.md
```

## Getting Started

No build step or dependencies required. Open the project in any modern browser.

### Option 1 — Direct open

Double-click `index.html` or open it in your browser.

### Option 2 — Local server (recommended)

Using Python:

```bash
python -m http.server 8080
```

Then visit `http://localhost:8080`

Using Node.js (npx):

```bash
npx serve .
```

## Customization

### Update wedding details

Edit the content inside `index.html`:

- Names — `.names-block`
- Date & time — `.date-section`
- Venue — `.venue`

### Change intro timing

Edit the `setTimeout` values in `src/js/script.js`:

| Action                 | Default |
| ---------------------- | ------- |
| Show invite text       | 200 ms  |
| Open doors + fireworks | 5000 ms |
| Show invitation        | 5800 ms |
| Hide loader            | 6000 ms |
| Remove loader          | 7000 ms |

### Change colors & fonts

CSS variables are defined at the top of `src/css/style.css`:

```css
:root {
  --paper: #faf6f0;
  --gold: #b8956a;
  --sage: #6d8f6a;
  --charcoal: #2c2824;
  /* ... */
}
```

Fonts are loaded from Google Fonts in `index.html` (Cormorant Garamond, Great Vibes, Amiri, Scheherazade New).

### Replace images

Swap files in `src/images/` and keep the same filenames, or update the `src` paths in `index.html`.

## Browser Support

Works in modern browsers that support:

- CSS Grid & Flexbox
- CSS 3D transforms
- HTML5 Canvas
- `100vh` viewport units

## License

Personal project for wedding use.
