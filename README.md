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

Workspaces are saved in your browser's local storage. There is no account or server synchronization, so clearing browser data removes your notes. The deployed site and localhost each keep their own separate data.

Fonts are loaded from Google Fonts. These are the only external requests.

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

## License

[MIT](LICENSE)
