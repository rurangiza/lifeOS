import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "quiet" | "outline" | "danger";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-ink text-paper hover:opacity-90",
  quiet: "text-ink hover:bg-paper-2",
  outline: "border border-line text-ink hover:bg-paper-2",
  danger: "text-danger hover:bg-paper-2",
};

export function Button({
  variant = "outline",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-[15px] font-medium transition-[background-color,opacity] disabled:opacity-40 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}

export function IconButton({
  label,
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex size-11 shrink-0 items-center justify-center rounded-full text-ink hover:bg-paper-2 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/** A modal that slides up from the bottom on phones and sits centred on wider screens. */
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-0 mt-auto w-full max-w-none rounded-t-3xl bg-card p-0 text-ink sm:m-auto sm:max-w-lg sm:rounded-3xl"
    >
      <div className="pb-safe max-h-[85dvh] overflow-y-auto px-5 pt-4 pb-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">{title}</h2>
          <IconButton label="Close" onClick={onClose}>
            <Icon name="close" />
          </IconButton>
        </div>
        {open && children}
      </div>
    </dialog>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-ink-2">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[13px] text-ink-2">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "w-full min-h-11 rounded-xl border border-line bg-paper px-3 py-2 text-ink placeholder:text-ink-2/70 focus:border-cobalt focus:outline-none";

const PATHS: Record<string, string> = {
  map: "M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Zm0 0v14m6-12v14",
  plan: "M4 4h16v16H4zM4 12h7m0-8v12m5-4h4",
  budget: "M4 7h16v12H4zM4 7l2-3h12l2 3M14 13h3",
  close: "M6 6l12 12M18 6 6 18",
  plus: "M12 5v14M5 12h14",
  back: "M15 5 8 12l7 7",
  star: "m12 4 2.4 5 5.4.6-4 3.7 1.1 5.3L12 16l-4.9 2.6 1.1-5.3-4-3.7 5.4-.6Z",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm5-2 4 4",
  pen: "m4 20 4-1 11-11-3-3L5 16l-1 4Z",
  ruler: "m3 17 14-14 4 4L7 21Zm4-4 2 2m1-5 2 2m1-5 2 2",
  image: "M4 5h16v14H4zM4 16l5-5 4 4 2-2 5 5M15 9.5a1 1 0 1 0 0-.01",
  trash: "M5 7h14M10 7V5h4v2m-7 0 1 12h8l1-12",
  undo: "M9 5 4 10l5 5M4 10h10a5 5 0 0 1 0 10h-4",
  check: "m5 12 5 5 9-10",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7-3 2-1-2-4-2 1-2-1V5h-4v2l-2 1-2-1-2 4 2 1v2l-2 1 2 4 2-1 2 1v2h4v-2l2-1 2 1 2-4-2-1Z",
  refresh: "M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6",
  home: "M4 11 12 4l8 7v9H4Zm6 9v-5h4v5",
  link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
  shape: "M5 5h9l5 5v9H5Z",
};

export function Icon({ name, size = 22, className = "" }: { name: keyof typeof PATHS | string; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="mx-auto max-w-sm px-6 py-12 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-ink-2">{body}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
