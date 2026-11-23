import { lazy, Suspense, useState } from "react";
import { BackupSheet } from "./components/BackupSheet";
import { Icon, IconButton } from "./components/ui";
import { BudgetView } from "./features/budget/BudgetView";
import { FlatView } from "./features/plan/FlatView";
import { RoomView } from "./features/rooms/RoomView";
import { href, parseHash, useHash, type Route } from "./lib/router";
import { useLoaded, useLoadError, useSaveError } from "./lib/store";

// The map library is the heaviest dependency; the floor plan shouldn't wait for it.
const NeighbourhoodView = lazy(() => import("./features/neighbourhood/NeighbourhoodView"));

const TABS: { view: Route["view"]; label: string; icon: string; to: Route }[] = [
  { view: "around", label: "Neighbourhood", icon: "map", to: { view: "around" } },
  { view: "flat", label: "Flat", icon: "plan", to: { view: "flat" } },
  { view: "budget", label: "Budget", icon: "budget", to: { view: "budget" } },
];

export function App() {
  const route = parseHash(useHash());
  const loaded = useLoaded();
  const loadError = useLoadError();
  const saveError = useSaveError();
  const [backupOpen, setBackupOpen] = useState(false);
  const activeTab = route.view === "room" ? "flat" : route.view;

  if (loadError) {
    return (
      <div className="mx-auto max-w-md p-8">
        <h1 className="text-2xl font-semibold">Your saved data couldn't be opened</h1>
        <p className="mt-2 text-ink-2">
          The browser refused to read its storage ({loadError}). Nothing has been changed. Private browsing
          blocks storage on some browsers; open Home in a normal window and reload.
        </p>
      </div>
    );
  }
  if (!loaded) return null;

  return (
    <div className="flex h-full flex-col">
      <header className="pt-safe z-10 border-b border-line bg-paper">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-2 px-3 sm:px-5">
          <a href={href({ view: "around" })} className="flex items-center gap-2 font-semibold">
            <Icon name="home" />
            <span className="text-lg">Home</span>
          </a>
          <nav className="ml-6 hidden gap-1 sm:flex" aria-label="Sections">
            {TABS.map((t) => (
              <a
                key={t.view}
                href={href(t.to)}
                aria-current={activeTab === t.view ? "page" : undefined}
                className="rounded-full px-4 py-2 text-[15px] text-ink-2 hover:text-ink aria-[current=page]:bg-ink aria-[current=page]:text-paper"
              >
                {t.label}
              </a>
            ))}
          </nav>
          <IconButton label="Backup and restore" className="ml-auto" onClick={() => setBackupOpen(true)}>
            <Icon name="settings" />
          </IconButton>
        </div>
        {saveError && (
          <p role="alert" className="bg-danger px-4 py-2 text-sm text-paper">
            Your last change wasn't saved: {saveError}. Export a backup before closing this tab.
          </p>
        )}
      </header>

      <main className="relative min-h-0 flex-1 overflow-y-auto">
        {route.view === "around" && (
          <Suspense fallback={<p className="p-6 text-ink-2">Loading the map…</p>}>
            <NeighbourhoodView />
          </Suspense>
        )}
        {route.view === "flat" && <FlatView floorId={route.floorId} />}
        {route.view === "room" && <RoomView roomId={route.roomId} />}
        {route.view === "budget" && <BudgetView />}
      </main>

      <nav className="pb-safe border-t border-line bg-paper sm:hidden" aria-label="Sections">
        <div className="grid grid-cols-3">
          {TABS.map((t) => (
            <a
              key={t.view}
              href={href(t.to)}
              aria-current={activeTab === t.view ? "page" : undefined}
              className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-[12px] text-ink-2 aria-[current=page]:text-ink aria-[current=page]:font-semibold"
            >
              <Icon name={t.icon} size={22} />
              {t.label}
            </a>
          ))}
        </div>
      </nav>

      <BackupSheet open={backupOpen} onClose={() => setBackupOpen(false)} />
    </div>
  );
}
