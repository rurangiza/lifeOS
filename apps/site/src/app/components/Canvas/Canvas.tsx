import { ReactNode } from "react";
import styles from "./Canvas.module.css";

interface CanvasProps {
  children: ReactNode;
  centered: boolean;
  title: string | undefined;
}

export default function Canvas({ children, centered = true, title }: CanvasProps) {
  return (
    <>
      {title && (
        <div className="bg-gray-300 h-8 px-4 py-1 rounded-t-md border-[0.2px] border-gray-400">
        <p>{title}</p>
      </div>
      )}
      <div className={styles.light}>
        <div className={`flex flex-col ${centered && "items-center"}`}>{children}</div>
      </div>
    </>
  );
}
