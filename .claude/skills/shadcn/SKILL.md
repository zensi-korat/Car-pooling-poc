---
name: shadcn
description: 'shadcn/ui implementation guardrail for ANY UI task in this Vite + React project. Use when building/creating/designing/implementing/reviewing/fixing/improving/refactoring pages, dashboards, admin pages, forms, cards, tables, sidebars, dialogs, inputs, selects, dropdowns, badges or buttons. Enforces shadcn-first composition, semantic color tokens (theme lives in src/index.css), size-* over w-* h-*, gap-* over space-*, and accessibility rules.'
user-invocable: false
allowed-tools: Bash(npx shadcn@latest *)
---

# shadcn/ui

Adapted from bear-portal-new's `shadcn` skill for this Vite + React Router project.
Components are added as source code via the CLI into `src/components/ui/`.

Use this skill for every visual task unless the request is explicitly non-UI.

Priority order when rules overlap:

1. Accessibility and semantic correctness
2. shadcn composition and token rules
3. UI/UX style recommendations (the `ui-ux-pro-max` skill)

## Current Project Context

```json
!`npx shadcn@latest info --json`
```

The JSON above contains the project config and installed components. Use `npx shadcn@latest docs <component>` for documentation and examples.

## Principles

1. **Use existing components first.** Check `src/components/ui/` and `npx shadcn@latest search` before writing custom UI.
2. **Compose, don't reinvent.** Settings page = Tabs + Card + form controls. Dashboard = Sidebar + Card + Table.
3. **Use built-in variants before custom styles.** `variant="outline"`, `size="sm"`, etc.
4. **Use semantic colors.** `bg-primary`, `text-muted-foreground`. Raw palette colors (`bg-green-100`) belong only inside a component's variant map, never scattered through pages.
5. **Theme tokens live in `src/index.css`.** New CSS variables go in `:root` and `.dark`, mapped in `@theme inline`. No one-off component CSS there.
6. **Use shadcn primitives instead of raw HTML** when one exists: `Sidebar*` for navigation, `Table*` for tables, `Dialog`/`Sheet` for overlays, `Separator` instead of `<hr>`, `Skeleton` for loading, `Badge` for status labels, `Avatar` for user images.

## Styling Rules

- **`className` for layout, not for overriding component colors or typography.**
- **No `space-x-*` / `space-y-*`.** Use `flex` + `gap-*`; vertical stacks are `flex flex-col gap-*`.
- **Equal width and height use `size-*`.** Icons, avatars, status dots: `size-4`, not `w-4 h-4`.
- **Use `truncate`**, not `overflow-hidden text-ellipsis whitespace-nowrap`.
- **No manual `dark:` color overrides in pages.** Semantic tokens already switch in dark mode.
- **Use `cn()` from `@/lib/utils` for conditional classes.**
- **No manual `z-index` on overlays.** Dialog, Sheet, Popover handle stacking.
- **No inline `style={{}}` for theme colors, gradients or shadows.**

## React + Project Structure

- Pages live in `src/pages/` and stay thin: they fetch via hooks and compose feature components.
- Feature UI lives in `src/features/<feature>/components/`; shared page pieces in `src/components/page.tsx`.
- Group small related components in one file rather than many tiny files.
- Keep static config (column lists, tone maps) outside component bodies.
- Use `Readonly<Props>`, stable keys, semantic HTML and accessible labels.
- No static mock data in finished UI; data comes from the API hooks.

## Component Structure

- Items always inside their group: `SelectItem` → `SelectGroup`, `DropdownMenuItem` → `DropdownMenuGroup`.
- Custom triggers use `asChild` (this project uses the Radix base).
- `Dialog`, `Sheet` and `Drawer` always need a title (`className="sr-only"` if hidden).
- Use full Card composition: `CardHeader` / `CardTitle` / `CardDescription` / `CardContent` / `CardFooter`.
- Button has no `isLoading` prop: compose a spinner icon + `disabled`.
- `TabsTrigger` must be inside `TabsList`.
- `Avatar` always has an `AvatarFallback`.

## Icons

- Icons come from `lucide-react`, passed as components (`Icon={UserRound}`), not string keys.
- Icons inside `Button` use `data-icon="inline-start"` / `"inline-end"` and no size classes.

## Component Selection

| Need                       | Use                                                               |
| -------------------------- | ----------------------------------------------------------------- |
| Button/action              | `Button` with a variant                                           |
| Form inputs                | `Input`, `Select`, `Switch`, `Checkbox`, `RadioGroup`, `Textarea` |
| Toggle between 2–5 options | `ToggleGroup` + `ToggleGroupItem`                                 |
| Data display               | `Table`, `Card`, `Badge`, `Avatar`                                |
| Navigation                 | `Sidebar`, `Breadcrumb`, `Tabs`, `Pagination`                     |
| Overlays                   | `Dialog`, `Sheet`, `AlertDialog` (confirmations)                  |
| Feedback                   | `sonner` (toast), `Alert`, `Skeleton`, `Progress`                 |
| Empty states               | `Empty`                                                           |
| Menus                      | `DropdownMenu`                                                    |
