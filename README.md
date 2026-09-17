# Drafter

A simple canvas for notes and connected ideas. Write rich-text cards, arrange them freely, and connect them with arrows.

## Run locally

Install [Bun](https://bun.sh/) and Node.js 22.12 or newer, then run:

```sh
bun install --frozen-lockfile
bun run dev
```

Open http://localhost:3000. No API keys, environment variables, or backend are required.

## Use

- Double-click a card to write. Click outside, press Escape, or press Ctrl/Cmd+Enter to finish.
- Use Markdown-style shortcuts for headings, lists, bold text, and quotes.
- Drag dot to dot to connect ideas. Click the line to restyle, reverse, or delete it.
- Use the workspace menu to create, rename, switch, or delete workspaces.
- Choose a paper color to recolor selected cards or set the color for new cards.

## Storage and privacy

Private by design — everything stays in your browser. Workspaces are saved in your browser's local storage. There is no account, server synchronization, or export feature. Clearing browser data removes your notes. The reset button replaces **all workspaces** with the examples, and deletions cannot be undone.

Newsreader and JetBrains Mono are loaded from Google Fonts. This makes requests to Google; note content is not sent to a backend by Drafter.

## Development

```sh
bun run typecheck
bun run build
bun run preview
```

The build produces a static site in `dist/`, which can be served by a static hosting provider.

The app uses React, TypeScript, React Flow, TipTap, Tailwind CSS, and Vite.

```text
src/
  App.tsx          Canvas state, workspace persistence, and actions
  components/      Cards, editor, connections, and controls
  data/            Example workspaces
  index.css        Typography and canvas styles
  types.ts         Shared types and paper themes
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for development conventions and a manual test checklist.

## Deploy to GitHub Pages

1. Push the project to GitHub.
2. In **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source.
3. Push to `main`, or run **Deploy to GitHub Pages** manually from the **Actions** tab.

The workflow installs dependencies with Bun, builds the app, and deploys `dist/`. The deployment URL appears in the workflow's `github-pages` environment.

The workflow sets `BASE_PATH` from GitHub's Pages configuration, so both repository sites (`https://username.github.io/repository/`) and root sites work without hardcoding the repository name. For a custom domain, configure it in **Settings → Pages** before redeploying.

Local development still uses `/`. Notes saved on localhost do not transfer to the deployed site because browser storage is scoped to its origin.

## License

[MIT](LICENSE)
