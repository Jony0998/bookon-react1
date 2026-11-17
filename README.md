# BookOn - Frontend (React + Redux Toolkit)

Customer-facing web app for **[BookOn](https://bookon.sale)**, a live online bookstore.

**Live:** https://bookon.sale | **Backend repo:** [bookOn](https://github.com/Jony0998/bookOn)

## Tech stack

- **React** (TypeScript)
- **Redux Toolkit** for state management
- REST API client for the Express backend
- Deployed on a Linux VPS with PM2 (`deploy.sh`, `ecosystem.config.cjs`)

## Features

- Book catalog with search and category filters
- Book detail pages
- Cart and checkout flow
- Order history and user account
- Responsive layout

## Project structure

```
src/
  app/   # screens, components and Redux store
  lib/   # API config, types and helpers
  css/   # styles
```

## Run locally

```bash
npm install
npm start
```

Set `REACT_APP_API_URL` to your backend URL (see `.env.production`).

## Author

**Janobiddin Bozorov (Jony)** - Full-Stack Developer
[GitHub](https://github.com/Jony0998) | [LinkedIn](https://www.linkedin.com/in/janobiddin-bozorov-a03429412)
