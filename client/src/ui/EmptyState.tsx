import type { ReactNode } from "react";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  // A full page (404) passes "h1"; inside a page it is a section heading.
  titleAs?: "h1" | "h2" | "h3";
  // Actions, usually buttons.
  children?: ReactNode;
};

function EmptyState({ icon, title, description, titleAs: Title = "h2", children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
      {icon}
      <Title className={Title === "h1" ? "text-2xl font-bold text-text" : "text-lg font-bold text-text"}>{title}</Title>
      {description && <p className="max-w-md text-text-muted">{description}</p>}
      {children && <div className="mt-2 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  );
}
export default EmptyState;
