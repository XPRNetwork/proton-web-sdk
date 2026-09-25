# Proton Web SDK — `renderTarget` example (React)

A minimal React app that mounts the Proton Web SDK dialog inside a specific
DOM element via the new `renderTarget` option, instead of the default
`document.body`.

## Run

```bash
pnpm install
pnpm --filter example-react-render-target dev
```

## What it demonstrates

- `uiOptions.renderTarget` passed to `ProtonWebSDK()` — the login modal is
  appended inside the referenced element.
- `renderer.setRenderTarget(el)` called before `session.transact(...)` — the
  sign-request modal re-parents into the same container.

The target can be either an `HTMLElement` or a CSS selector string.
