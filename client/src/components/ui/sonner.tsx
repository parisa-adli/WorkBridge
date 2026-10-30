import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useDarkMode } from "@/context/DarkModeContext"
import { useLanguage } from "@/context/LanguageContext"
import { Toaster as Sonner, type ToasterProps } from "sonner"

// Theme from the app's DarkModeContext (no next-themes); RTL: dir follows the language.
const Toaster = ({ ...props }: ToasterProps) => {
  const { isDarkMode } = useDarkMode()
  const { language } = useLanguage()

  return (
    <Sonner
      theme={isDarkMode ? "dark" : "light"}
      dir={language === "fa" ? "rtl" : "ltr"}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
