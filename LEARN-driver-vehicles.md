# Driver: My Vehicles (and your first look at RBAC)

## Step 1: role-based access control (RBAC)

**RBAC** means: *what you can do depends on your role*. Instead of giving permissions to each person,
we give them to a few **roles**, and give people roles.

In this app the roles come from the server, inside the user from `GET /api/auth/me`:

```json
{ "user": { "name": "Asha", "roles": ["DRIVER"], ... } }
```

`roles` is an **array**: one person can be a DRIVER and an ADMIN at the same time. That's why the code always
asks `user.roles.includes('DRIVER')` and never `user.role === 'DRIVER'`.

### The golden rule: the server is the real lock

The frontend can't protect anything. Anyone can open DevTools and change JavaScript. So:

| Layer | What it does | Why |
|-------|--------------|-----|
| **Server** | Refuses with `403` if your role is wrong | This is the *security* |
| **Route guard** (`RoleRoute`) | Shows "No access" instead of a broken page | This is *politeness* |
| **Sidebar** (`role: 'DRIVER'`) | Hides links you can't use | This is *tidiness* |

The frontend layers only make the app pleasant: a rider never sees a "My Vehicles" link that would fail anyway.

### Layer 1: the route guard (`src/routes/guards.tsx`)

```tsx
export function RoleRoute({ role }) {
  const user = useCurrentUser()
  if (!user.roles.includes(role)) return <NoAccess />
  return <Outlet />
}
```

`<Outlet />` means "draw the child route here". So a guard is a gate: right role → the page; wrong role →
the "No access" message.

In `AppRoutes.tsx` the gates are nested, and **each one only has to check one thing**:

```
ProtectedRoute          logged in? phone verified?
  DashboardLayout       draws the sidebar
    RoleRoute ADMIN     has ADMIN?   → /admin/*
    RoleRoute DRIVER    has DRIVER?  → /driver/*
```

By the time `RoleRoute` runs, `ProtectedRoute` already made sure there *is* a user. That's why it can use
`useCurrentUser()` (which assumes a logged-in user) without checking for "logged out".

In `AppRoutes.tsx` you can read the rule right where the routes are:

```tsx
<Route element={<RoleRoute role="DRIVER" />}>
  <Route path="/driver/vehicles" element={<DriverVehiclesPage />} />
</Route>
```

Rider pages later: the same thing with `role="RIDER"`. No new code.

### Layer 2: the sidebar (`src/layouts/DashboardLayout.tsx`)

Each item can name the role it belongs to:

```ts
{ to: '/driver/vehicles', label: 'My Vehicles', Icon: CarFront, role: 'DRIVER' },
{ to: '/admin/users',     label: 'Users',       Icon: Users,    role: 'ADMIN' },
{ to: '/profile',         label: 'My Profile',  Icon: UserRound },          // no role → everyone
```

and one line filters them:

```ts
NAV_ITEMS.filter((item) => !item.role || user.roles.includes(item.role))
```

Read it as: *keep the item if it has no role, or if the user has that role*.

Before, items had `adminOnly: true`. That only works for one role. `role: Role` works for all three, and
TypeScript only accepts `'ADMIN' | 'DRIVER' | 'RIDER'` (a typo like `'DRIVR'` is an error).

### Layer 3: folders (keeping the code separate too)

RBAC also shapes the folders: `features/admin/…`, `features/driver/…`. A role folder never imports from another
role's folder. The vehicle shape is needed by both admin (review queue) and driver (my vehicles), so it moved to
`features/shared/vehicles/api/vehicleSchema.ts`, and both import from there. The admin file keeps only what is
admin-only (`adminVehicleSchema` adds the owner and `reviewVersion`).

### Try it

1. Log in as a **driver**: "My Vehicles" shows in the sidebar; admin items don't.
2. Log in as a **rider**: no "My Vehicles". Type `/driver/vehicles` in the address bar → "No access".
3. Log in as an **admin** (without DRIVER): the same "No access" page on `/driver/vehicles`.

### The vehicle's life (what the next steps build)

```
register (POST)  →  PENDING  →  upload RC + LICENCE  →  admin reviews  →  APPROVED  (can post rides)
                                                                     ↘  REJECTED + note → edit → PENDING again
```

Editing make/model/plate/seats of an APPROVED vehicle, or uploading a new document, sends it back to PENDING.
Changing only the colour doesn't.

## Step 2: list my vehicles

**Files:** `features/driver/vehicles/api/vehiclesApi.ts` → `hooks/useMyVehicles.ts` → `components/MyVehiclesTable.tsx`
→ `pages/driver/DriverVehiclesPage.tsx`. Same chain as every admin list: API function → query hook → table → thin page.

**What's different from the admin lists:**

| Admin lists | My vehicles | Why |
|-------------|-------------|-----|
| `pageSchema(itemSchema)` | `z.array(vehicleSchema)` | `/api/vehicles/mine` returns a plain array, no pages |
| `['admin', 'vehicles', params]` | `['driver', 'vehicles']` | No params; role first, so `invalidateQueries({ queryKey: ['driver'] })` refreshes every driver list |
| `keepPreviousData` + pagination footer | neither | Nothing changes the params, so there's no "previous page" to keep showing |

**Badges live in one file.** Every status badge is in `src/components/badges.tsx`: the base `StatusBadge` with its
colours, then `RoleBadge`, `VerifiedBadge`, `VehicleStatusBadge`, `VehicleDocumentBadges`, `AuditActionBadge`.
Both vehicle tables use the same badges, so a status always has the same colour everywhere. A new status → add
it to that file. (The ride status badge moves in when the ride schema becomes shared for driver rides.)

## Step 3: add a vehicle (your first create)

**Files:** `api/vehiclesSchema.ts` (form rules) → `api/vehiclesApi.ts` (`createVehicle`) → `hooks/useCreateVehicle.ts`
→ `components/AddVehicleDialog.tsx` (button + dialog + form), placed in the page header.

**Reading data vs changing data:**

| | `useQuery` (list) | `useMutation` (add) |
|-|-------------------|---------------------|
| Runs | by itself, when the page shows | only when you call `mutate(body)` |
| Gives you | `data`, `isError`, `error` | `isPending`, `isError`, `error`, `reset()` |
| After | — | `onSettled` → `invalidateQueries(['driver', 'vehicles'])` → the list reloads itself |

That last row is why there's no "add the new row to the table" code: we tell TanStack Query the list is out of date,
and it fetches it again.

**The form, same as login:**
1. `values` holds what you typed; `submitted` turns on at the first Save.
2. `fieldErrors(vehicleFormSchema, values)` → one message per field (it moved to `@/lib/validation`, now that two
   features use it).
3. Valid → `mutate(...)` with the trimmed values and `Number(seatCapacity)` (a Select's value is always text).
4. The server answers 400 (bad plate) or 409 (plate already registered) → its message shows in the red `FormAlert`.
5. Success → the per-call `onSuccess` closes the dialog, which also clears the form.

The dialog keeps its own `open` state and includes its own trigger button, so the page only writes `<AddVehicleDialog />`.

## Step 4: edit a vehicle (one form for add and edit)

`AddVehicleDialog` became **`VehicleFormDialog`**. One prop decides the mode:

```tsx
<VehicleFormDialog />                    // Add:  "+ Add Vehicle" button, empty form, POST
<VehicleFormDialog vehicle={vehicle} />  // Edit: ✏️ pencil, filled form, PATCH only what changed
```

`vehicle?: Vehicle`: the `?` means "may be missing". Every `vehicle ? A : B` in the file reads as
"edit mode → A, add mode → B".

**What happens when you click the pencil:**

1. Each table row has its own `<VehicleFormDialog vehicle={vehicle} />`, so the pencil already knows its car.
2. Clicking it calls `changeOpen(true)` → `startValues(vehicle)` fills the form with that car's details.
3. You change the colour and press **Save changes** → `handleSubmit`:
   - checks the fields (same Zod rules as add),
   - `toBody(values)` → trimmed text + seats as a number,
   - `changedFields(vehicle, body)` → `{ colour: 'Red' }`, only what's different,
   - nothing changed → just close (no request; the server would refuse an empty body anyway),
   - otherwise `updateVehicle.mutate({ id, body: changes })` → `PATCH /api/vehicles/{id}`.
4. Success → the dialog closes; `onSettled` refreshes `['driver', 'vehicles']`, so the table shows the new colour.

**Why send only the changed fields?** The server rule: on an APPROVED car, changing make, model, plate or seats sends
it back to PENDING (an admin must review again). Sending every field "just in case" could trigger that for nothing.

**Why fill the form on open, not when the dialog is created?** After a save the list reloads with the new data. If
the form were only filled once, the next edit would start from the old values. Filling on every open always uses
the latest vehicle.

**Two hooks, one `save`.** `useCreateVehicle` and `useUpdateVehicle` are both called (React hooks must run on every
render, never inside an `if`). `const save = vehicle ? updateVehicle : createVehicle` then picks which one's
`isPending` / `error` the form shows.

## Step 5: upload documents (sending a file)

JSON can only carry text, so a file goes as **`multipart/form-data`**. In the browser you build it with `FormData`:

```ts
const form = new FormData()
form.append('type', 'RC')   // a normal text field
form.append('file', file)   // the File the user picked
api(`/api/vehicles/${id}/documents`, { method: 'POST', body: form, schema: vehicleSchema })
```

axios sees a `FormData` body and sets the `multipart/form-data` header (with its boundary) by itself, so `api()`
needed no change.

**Where the `File` comes from:** `<Input type="file">` → `onChange` → `event.target.files?.[0]` (the first picked file,
or `undefined` if the picker was cancelled). Picking a file uploads it straight away; there's no extra button.
`event.target.value = ''` empties the picker, so choosing the same file again still fires `onChange`.

**Why the dialog updates by itself:** it reads `vehicle.documents` from its prop. After an upload, `onSettled`
refreshes `['driver', 'vehicles']` → the table re-renders → the dialog gets the new vehicle → "Uploaded 6 Nov 2026".
Nothing is copied into state, so there's nothing to keep in sync.

**One row = one small component.** `DocumentRow` has its own `useUploadDocument()`, so `upload.isPending` and
`upload.error` belong to that row only (spinner and red box show on the right document).

**A button instead of "Choose File".** The real `<Input type="file">` is hidden (`className="hidden"`). The
Upload / Replace button does `fileInput.current?.click()`: `useRef` points at the hidden input (like `emailRef` in
LoginForm), and `.click()` opens the picker as if you'd clicked it.

**"Replace", not "Remove".** The server has no delete-document endpoint. Uploading again replaces the old file,
so the button says Replace once a file is there.

**The "uploaded" notification** is a toast from `sonner` (same as bear-portal-new): `<Toaster />` sits once in
`App.tsx`, and the per-call `onSuccess` runs `toast.success('RC (registration certificate) uploaded')`.


## Step 6: download a document (a signed link)

The files are private, so a download is a two-step trip:

```
1. GET /api/vehicles/{id}/documents/RC  →  { url: 'https://storage…?signature=…', expiresInSeconds: 60 }
2. window.location.assign(url)          →  the browser downloads the file
```

**Signed link** = a URL with a secret signature in it that only works for 60 seconds. If someone finds it later
(browser history, a shared screenshot), it's already dead. That's why we ask for a fresh link on every click and
never store it.

**Why the page doesn't change:** the server marks the link as a download (`Content-Disposition: attachment`), so
"going to" that URL only saves the file; you stay on My Vehicles.

**Why a mutation for a GET?** `useQuery` is for data you *show* and keep fresh. This runs once, on a click, and
its result is used immediately, which is exactly what `useMutation` is for (`isPending` for the spinner, `error`
for the red box).
