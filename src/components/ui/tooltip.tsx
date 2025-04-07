
import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md glass border border-white/30 px-3 py-1.5 text-sm text-white shadow-xl backdrop-blur-sm",
      "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
      "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

// Enhanced tooltip with title and details - similar to Power BI tooltips
const EnhancedTooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
    title?: string;
    metrics?: Array<{label: string; value: string | number; color?: string}>;
    footer?: string;
  }
>(({ className, sideOffset = 4, title, metrics, footer, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md glass border border-white/30 shadow-xl backdrop-blur-sm",
      "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
      "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      "min-w-[200px] max-w-[280px] p-0",
      className
    )}
    {...props}
  >
    {title && (
      <div className="border-b border-white/10 bg-white/5 p-2">
        <h4 className="font-medium text-white">{title}</h4>
      </div>
    )}
    <div className="p-2">
      {metrics && metrics.length > 0 && (
        <div className="space-y-1.5">
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-1.5">
                {metric.color && (
                  <div 
                    className="h-2.5 w-2.5 rounded-sm" 
                    style={{ backgroundColor: metric.color }}
                  />
                )}
                <span className="text-xs text-white/80">{metric.label}:</span>
              </div>
              <span className="text-xs font-medium text-white">{metric.value}</span>
            </div>
          ))}
        </div>
      )}
      {props.children}
    </div>
    {footer && (
      <div className="border-t border-white/10 bg-white/5 px-2 py-1">
        <p className="text-xs text-white/60">{footer}</p>
      </div>
    )}
  </TooltipPrimitive.Content>
))
EnhancedTooltipContent.displayName = "EnhancedTooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, EnhancedTooltipContent }
