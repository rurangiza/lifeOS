import { ReactNode } from "react";
import styles from "./Canvas.module.css";

interface CanvasProps {
  children: ReactNode;
  centered: boolean;
}

export default function Canvas({ children, centered = true }: CanvasProps) {
  return (
    <div className={styles.light}>
      <div className={`flex flex-col ${centered && "items-center"}`}>{children}</div>
    </div>
  );
}
