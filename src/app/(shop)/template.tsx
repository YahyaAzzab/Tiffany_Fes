import { ViewTransition, type ReactNode } from "react";

const motion = {
  "nav-forward": "nav-forward",
  "nav-back": "nav-back",
  default: "fade",
} as const;

export default function Template({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter={motion} exit={motion} default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
