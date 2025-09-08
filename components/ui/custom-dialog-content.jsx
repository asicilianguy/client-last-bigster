// components/ui/custom-dialog.tsx
"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"

// Importa i componenti necessari
import { DialogPortal, DialogOverlay } from "@/components/ui/dialog"

const DialogContentWithoutClose = React.forwardRef(
  (
    { className, children, ...props },
    ref
  ) => (
    <DialogPortal>
      <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      {/* Icona X rimossa */}
    </DialogPrimitive.Content>
  </DialogPortal>
))

DialogContentWithoutClose.displayName = "DialogContentWithoutClose"

export { DialogContentWithoutClose }