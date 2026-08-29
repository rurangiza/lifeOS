interface BoardProps {
  children: string;
}

export default function Board({ children }: BoardProps) {
  return (
    <div
      className="border-zinc-200 dark:border-zinc-700 rounded-lg h-50 w-full border "
    >
      {children}
    </div>
  );
}
