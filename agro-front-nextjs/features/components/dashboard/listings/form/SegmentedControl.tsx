"use client"

import { cn } from "@/lib/utils"

export type SegmentedOption<T extends string> = {
  value: T
  label: string
}

type SegmentedControlProps<T extends string> = {
    value: T | undefined
    onChange: (value: T) => void
    options: readonly SegmentedOption<T>[]
    ariaLabel: string
    invalid?: boolean
    className?: string
}

export function SegmentedControl<T extends string>({
    value,
    onChange,
    options,
    ariaLabel,
    invalid = false,
    className,
}: SegmentedControlProps<T>) {
    return (
        <div
            role="group"
            aria-label={ariaLabel}
            className={cn(
                "inline-flex w-full divide-x overflow-hidden rounded-sm border bg-white",
                invalid
                ? "divide-destructive/40 border-destructive"
                : "divide-teal-900/15 border-teal-900/30",
                className,
            )}
        >
            {options.map((option) => {
                const selected = option.value === value

                return (
                    <button
                        key={option.value}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => onChange(option.value)}
                        className={cn(
                        "flex-1 px-3 py-2 text-sm font-medium transition-colors",
                        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-teal-700",
                        selected
                            ? "bg-teal-900 text-white"
                            : "text-teal-900 hover:bg-teal-50",
                        )}
                    >
                        {option.label}
                    </button>
                )
            })}
        </div>
    )
}