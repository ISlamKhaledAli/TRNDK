import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 [html[dir=rtl]_&]:translate-x-[17rem] sm:[html[dir=rtl]_&]:translate-x-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        // Mobile-first fixed positioning and sizing
        // Logical Centering: start-50% puts it at 50% from Left (LTR) or Right (RTL)
        "fixed top-[50%] start-[50%] [html[dir=rtl]_&]:start-[0%] sm:[html[dir=rtl]_&]:start-[50%] z-50 grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg duration-200",
        
        // Structure overrides
        "flex flex-col",
        "w-[140vw] max-h-[90vh]", // Dimensions (90vw mobile)
        "gap-0 p-0", 
        "overflow-hidden",
        "sm:rounded-lg",

        // Transforms with Attribute Selectors (Robust)
        "translate-y-[-50%]", // Always center Y
        
        // LTR Center (Default or explicit)
        "translate-x-[-50%]", 
        
        // RTL Center Override (Move Right)
        // Using multiple selectors to catch standard dir usage
        "[dir=rtl]_&]:translate-x-[50%] [.rtl_&]:translate-x-[50%] [html[dir=rtl]_&]:translate-x-[50%]",

        // Animations
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]",
        
        // Directional Slide Animations to match transforms
        "data-[state=closed]:slide-out-to-left-1/2 [html[dir=rtl]_&]:data-[state=closed]:slide-out-to-right-1/2",
        "data-[state=open]:slide-in-from-left-1/2 [html[dir=rtl]_&]:data-[state=open]:slide-in-from-right-1/2",
        
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-50">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

// Header: Sticky, Padding
const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      "p-6 border-b shrink-0 bg-background", // Sticky-like behavior via flex
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

// Body: Scrollable, Flex-1
const DialogBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex-1 overflow-y-auto p-6 min-h-0", // Scrollable
      className
    )}
    {...props}
  />
);
DialogBody.displayName = "DialogBody";

// Footer: Fixed at bottom, Padding
const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      "p-6 pt-4 border-t shrink-0 bg-background",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
