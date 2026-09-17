# Contributing

Keep Drafter simple:

- Prefer explicit names and straightforward code over clever abstractions.
- Avoid inline comments when possible. Let the code speak for itself.
- Add dependencies only when they solve a concrete need.
- Keep changes focused and preserve existing local-storage data.
- Use Bun and commit `bun.lock` when dependencies change.

Before submitting a change, run:

```sh
bun install --frozen-lockfile
bun run typecheck
bun run build
```

## Manual checks

Use a separate browser profile so tests do not overwrite your notes.

- Create, edit, duplicate, recolor, and delete cards.
- Connect two cards, toggle animation, reverse the arrow, and delete it.
- Confirm typing Backspace/Delete in an editor does not delete cards.
- Create and switch workspaces; confirm their cards remain separate.
- Rename a workspace, reload immediately, and confirm the name persists.
- Delete an inactive workspace, reload, and confirm it stays deleted.
- Delete the active workspace and confirm the remaining workspace opens.
- Confirm clicking outside the workspace, help, and color menus closes them.
- Reset the examples and confirm they persist after reload.

The repository does not currently include an automated test suite.
