# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```

## Deploying to Railway

This app is a static Vite build, so it ships as a small Docker image (`Dockerfile`) that builds the app with Node and serves the resulting `dist/` folder with [Caddy](https://caddyserver.com/) (`Caddyfile`). `railway.json` pins Railway to that Dockerfile builder so it doesn't try to auto-detect a different build strategy.

Steps to deploy:

1. Create a new Railway service from this GitHub repo.
2. Since this repo is a monorepo, set the service's **Root Directory** to `frontend` in the Railway dashboard (Settings → Source).
3. Railway will build the `Dockerfile` and serve the app on the port it assigns automatically — no start command needed.
4. Environment variables: production defaults already live in `.env.production` (checked into the repo), so no variables are strictly required. To override them per-deployment, set a Railway service variable with the matching name (e.g. `VITE_API_BASE`, `VITE_ENABLE_ROLE_SWITCHER`) — these are wired up as Docker build args in the `Dockerfile` and will take precedence over the `.env.production` values.
5. Once deployed, Railway gives you a `*.up.railway.app` URL (or attach a custom domain). That URL is what the marketing site (`droughtsmart-solutions`) should link to for "Login to Portal".

# frontend
