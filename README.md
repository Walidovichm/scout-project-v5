# Scout — Consumer Geopolitical Intelligence Platform

*"Everything is political."*

Scout is a consumer-first geopolitical intelligence platform with a 100-company real-data dataset.

## Features

- **100 companies** with real geopolitical intelligence data
- **Scout Index** — rigorous composite score (see scout-index-methodology.md)
- **Colored logos** — brand-colored SVGs via CSS mask technique
- **Watchlist** — watch companies (eye icon) and get notifications for disruptive events
- **Money Journey** — visual flow of how money moves through each company
- **Connections** — leverage-ordered lanes with flag emojis and company logos
- **Method & About pages** — editorial transparency on methodology and purpose
- **Fonts** — Fraunces (serif headlines) + Inter (body)

## Run locally

```bash
cd scout-project
bun install   # or npm install
bun run dev
```

Open http://localhost:3000

## Regenerate dataset

Edit `/scripts/companies_dataset.py`, then:
```bash
python3 scripts/convert_to_typescript.py
```
