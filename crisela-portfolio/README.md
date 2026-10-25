# Crisela M. Valerio - Portfolio (v2)

A responsive, interactive portfolio built with plain HTML, CSS and JavaScript.
No build step, no libraries.

## Folder structure
```
crisela-portfolio/
├── index.html
├── css/
│   └── style.css         colors (light + dark), layout, animations
├── js/
│   ├── main.js           theme, nav, scroll animations, badge, skills, form
│   └── features.js       quick menu, planner, typing challenge, easter eggs
├── assets/
│   ├── README.md
│   └── images/
│       ├── profile.jpg   <- put your photo here
│       ├── placeholder.svg
│       └── favicon.svg
└── README.md
```

## Run it
Open `index.html` in any browser. (Internet is only needed for the Google Fonts.)

## Interactive features
- Student ID badge: moves with your mouse, press it to flip it
- Light and dark mode button
- Quick menu: press Ctrl K (Cmd K on Mac)
- Skills filter with animated rings
- "Try my desk": a task planner and a typing challenge
- Draggable sticky note, copy-email button, back-to-top progress ring
- Easter eggs: can you find them?

## Things to edit
- **Photo:** add `assets/images/profile.jpg`
- **Email and phone:** the Contact section in `index.html` (the form sends to the email shown there)
- **Skill levels:** the `data-level` number on each `.skill-card`
- **Planner tasks and typing sentences:** the lists at the top of those sections in `js/features.js`
- **Earlier schools:** copy the commented block inside the Education timeline in `index.html`
- **Colors:** the variables at the top of `css/style.css`

## Publish for free
Upload the whole folder to GitHub Pages, Netlify Drop, or Cloudflare Pages.
