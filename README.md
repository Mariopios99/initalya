# Sito Initalya — landing di presentazione

Sito statico (HTML/CSS/JS puri, zero build) fedele al design della presentazione
`Initalya_presentazione_web_smartphone_luxury.pdf`.

## Come vederlo in locale

Doppio click su `index.html` funziona, ma per i video conviene un piccolo server:

```bash
python3 -m http.server 8741
```

(dalla cartella del sito)

poi apri http://127.0.0.1:8741/

## Struttura

- `index.html` — tutta la pagina (hero video, due anime, territorio pilota, assistente, 4 passi, gallery web app, catalogo, video social, CTA finale)
- `style.css` — design system: palette verde/crema/terracotta/oro del deck, font Fraunces + Inter (Google Fonts)
- `script.js` — animazioni reveal allo scroll, header sticky, menu mobile, drag della gallery, play del video social
- `assets/` — immagini ritagliate dal PDF di presentazione + video compressi:
  - `hero-loop.mp4` (5 MB) — primi 32s del video Sant'Angelo, muto, in loop nell'hero
  - `santangelo-full.mp4` (41 MB) — video completo compresso, nella sezione canale social

## Da sistemare prima di pubblicare

- **Email**: nei bottoni CTA c'è `info@initalya.it` come segnaposto — sostituire con l'indirizzo reale.
- **Video completo**: 41 MB è pesante per l'hosting; valutare di caricarlo su YouTube/Vimeo e sostituire il player, o accorciarlo.
- **Dominio**: il sito è pronto per qualsiasi hosting statico (Netlify, Vercel, hosting classico): basta caricare il contenuto della cartella `sito/`.

## Pubblicazione rapida (Netlify Drop)

1. Vai su https://app.netlify.com/drop
2. Trascina la cartella `sito/`
3. Il sito è online; poi si collega il dominio initalya.it dal pannello.
