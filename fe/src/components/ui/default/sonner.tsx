"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "0.75rem",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "cn-toast group !rounded-xl !p-4 !shadow-xl !border !font-semibold !text-sm transition-all",
          success:
            "!bg-emerald-50 !border-emerald-300 !text-emerald-900 dark:!bg-emerald-950/90 dark:!border-emerald-700 dark:!text-emerald-100 !shadow-emerald-500/10",
          error:
            "!bg-rose-50 !border-rose-300 !text-rose-900 dark:!bg-rose-950/90 dark:!border-rose-700 dark:!text-rose-100 !shadow-rose-500/10",
          warning:
            "!bg-amber-50 !border-amber-300 !text-amber-900 dark:!bg-amber-950/90 dark:!border-amber-700 dark:!text-amber-100 !shadow-amber-500/10",
          info:
            "!bg-blue-50 !border-blue-300 !text-blue-900 dark:!bg-blue-950/90 dark:!border-blue-700 dark:!text-blue-100 !shadow-blue-500/10",
          description: "!text-xs !opacity-90 !mt-1 !font-normal",
          actionButton:
            "!bg-primary !text-primary-foreground !rounded-lg !px-3 !py-1.5 !text-xs !font-semibold",
          cancelButton:
            "!bg-muted !text-muted-foreground !rounded-lg !px-3 !py-1.5 !text-xs !font-semibold",
          closeButton:
            "!bg-surface !border-outline-variant !text-on-surface hover:!bg-surface-container-highest !rounded-full !size-6 !transition-colors",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
