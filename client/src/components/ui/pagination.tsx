import * as React from "react"
import { cn } from "@/lib/utils"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react"
import { useTranslation } from "react-i18next"

import { buttonVariants, type Button } from "@/components/ui/button"

// i18n: translated label.
function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  const { t } = useTranslation()
  return (
    <nav
      role="navigation"
      aria-label={t("pagination.label")}
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"button">

// a11y: a <button>, not an <a> without href: pages change through a handler and the ends can be disabled.
function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <button
      type="button"
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        className
      )}
      {...props}
    />
  )
}

// i18n: translated labels; RTL: ps/pe and the chevron mirrored in LTR (it points right in fa).
function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  const { t } = useTranslation()
  return (
    <PaginationLink
      aria-label={t("pagination.previous")}
      size="default"
      className={cn("gap-1 px-2.5 sm:ps-2.5", className)}
      {...props}
    >
      <ChevronRightIcon className="ltr:-scale-x-100" />
      <span className="hidden sm:block">{t("pagination.previous")}</span>
    </PaginationLink>
  )
}

// i18n and RTL: as PaginationPrevious.
function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  const { t } = useTranslation()
  return (
    <PaginationLink
      aria-label={t("pagination.next")}
      size="default"
      className={cn("gap-1 px-2.5 sm:pe-2.5", className)}
      {...props}
    >
      <span className="hidden sm:block">{t("pagination.next")}</span>
      <ChevronLeftIcon className="ltr:-scale-x-100" />
    </PaginationLink>
  )
}

// i18n: translated sr-only text.
function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  const { t } = useTranslation()
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">{t("pagination.more")}</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
