# home

A phone-first web app for settling into a new flat. It has three parts.

- **Neighbourhood.** Search your address and the map shows the nearest gym, groceries, park and music academy, with walking times. You can switch on bakeries, pharmacies and transit stops, or add any OpenStreetMap tag yourself (`amenity=library`). Mark a place as yours ("My gym") and it leads its row.
- **Flat.** Add each floor, upload a photo of its plan, set the scale by measuring one wall you know, then tap the corners of each room to trace it. Rooms are stored in centimetres, so areas and wall lengths are real. Without a plan you draw on a grid.
- **Rooms and budget.** Each room gets a wall colour (shown on the plan), a list of renovation, furniture and lighting plans with a status and a price, and a board of inspiration photos. The budget tab totals everything.

## Running it

```sh
pnpm install
pnpm turbo run dev --filter=home
```

`lint`, `typecheck`, `test` and `build` are the usual scripts. Tests cover the logic in `src/lib` (geometry, distances, the Overpass query, budget totals, state changes, backups); the UI was checked by hand in a browser.

## Where the data comes from

| What | Service | Notes |
| --- | --- | --- |
| Map tiles | [OpenFreeMap](https://openfreemap.org) | OpenStreetMap vector tiles, no key, no usage limit |
| Places | [Overpass API](https://overpass-api.de) | One query per visit, cached until the address, radius or categories change |
| Address search | [Photon](https://photon.komoot.io) | Allows search-as-you-type, biased towards Brussels |

None of them need an account. Walking times are straight-line distance times 1.3, at 80 m a minute, so treat them as estimates. Parks are measured to their nearest edge, not their centre.

## Storage

Everything lives in the browser's IndexedDB: one record for the app state and one blob per picture. Photos are shrunk to 1800 px on their long side before saving, and floor plans to 3200 px.

That has two consequences worth knowing:

- Data does not sync between devices. Use the gear icon to export a backup file and restore it elsewhere.
- Safari deletes storage of sites you haven't opened for seven days, unless the site is added to the Home Screen. The app has a manifest and icons for that.

If the browser refuses to read saved data at startup, the app stops with a message instead of starting empty, so a passing storage error can't overwrite what is saved.

## Layout

```
src/lib/            state, storage and pure logic, with tests
src/features/       one folder per screen: neighbourhood, plan, rooms, budget
src/components/     buttons, sheets, icons, the blob URL hook
```

State changes are pure functions in `src/lib/ops.ts`. Components call them through `update()` in `src/lib/store.ts`, which saves 250 ms after the last change.

## Not done yet

- Sync between phone and laptop. A small backend (or Supabase) holding the same JSON and blobs would do it.
- A 3D view. Rooms already have real dimensions in centimetres, so extruding walls with three.js is the next step; ceiling heights and the attic slope would need adding to `Floor`.
- PDF floor plans. Upload a screenshot or photo of the PDF for now.
