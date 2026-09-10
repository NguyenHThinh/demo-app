"use client";

import type { ReactNode } from "react";
import { CircleHelp } from "lucide-react";

import { cn } from "@/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CalculatorInputLabelProps {
  label: ReactNode;
  tooltip?: string;
  htmlFor?: string;
  className?: string;
}

export function CalculatorInputLabel({
  label,
  tooltip,
  htmlFor,
  className,
}: CalculatorInputLabelProps) {
  return (
    <div className={cn("rov-input-label-row", className)}>
      <label htmlFor={htmlFor}>{label}</label>
      {tooltip ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="rov-input-label-tooltip-trigger"
                aria-label={`Help for ${typeof label === "string" ? label : "this input"}`}
              >
                <CircleHelp size={14} />
              </button>
            </TooltipTrigger>
            <TooltipContent className="rov-input-label-tooltip-content" side="top">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : null}
    </div>
  );
}
