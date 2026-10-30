import type { ReactNode } from "react";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

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
    <Empty>
      <EmptyHeader>
        {icon && <EmptyMedia>{icon}</EmptyMedia>}
        {/* a11y: EmptyTitle is a div; the heading inside keeps the page outline */}
        <EmptyTitle>
          <Title className={Title === "h1" ? "text-2xl" : undefined}>{title}</Title>
        </EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      {children && <EmptyContent className="flex-row flex-wrap justify-center">{children}</EmptyContent>}
    </Empty>
  );
}
export default EmptyState;
