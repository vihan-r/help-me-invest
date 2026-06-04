import type { ElementType, ReactNode } from "react";

type ContainerWidth = "shell" | "display" | "body" | "reading";

const WIDTH_CLASS: Record<ContainerWidth, string> = {
  shell: "max-w-shell", // 1200px — outer page shell
  display: "max-w-display", // 1000px — display headlines
  body: "max-w-body", // 720px — general body column
  reading: "max-w-reading", // 680px — long-form reading
};

export interface ContainerProps {
  /** Max content width from the column scale. Default "shell". */
  width?: ContainerWidth;
  /** Element to render. Default "div". */
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

/**
 * Centred content column with the brand's 32px gutters. Width is restraint,
 * not opportunity — pick the column that fits the content, not the viewport.
 */
export function Container({
  width = "shell",
  as: Tag = "div",
  className,
  children,
}: ContainerProps) {
  return (
    <Tag
      className={["mx-auto w-full px-8", WIDTH_CLASS[width], className].filter(Boolean).join(" ")}
    >
      {children}
    </Tag>
  );
}
