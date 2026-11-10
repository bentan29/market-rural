import { FieldGroup } from "@/components/ui/field"
import { ReactNode } from "react"

export const FormSection = ({ title, description, children,}: {
    title: string
    description?: string
    children: ReactNode
}) => {
    return (
        <section className="space-y-5 rounded-sm border bg-white p-5">
            <div className="space-y-1">
                <h2 className="text-base font-semibold text-teal-950">{title}</h2>
                {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                )}
            </div>
            <FieldGroup>{children}</FieldGroup>
        </section>
    )
}