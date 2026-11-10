
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import React from 'react'

type AppBreadcrumbProps = {
    labels?: Record<string, string>
}

export function AppBreadcrumb({ labels = {} }: AppBreadcrumbProps) {
    const pathname = usePathname()

    const segments = pathname.split('/').filter(Boolean)

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {segments.map((segment, index) => {
                    const href = `/${segments.slice(0, index + 1).join('/')}`
                    const isLast = index === segments.length - 1

                    const label =
                        labels[segment] ??
                        decodeURIComponent(segment)
                            .replace(/[-_]/g, ' ')
                            .replace(/\b\w/g, (char) => char.toUpperCase())

                    return (
                        <React.Fragment key={href}>
                            {index > 0 && <BreadcrumbSeparator />}

                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage>
                                        {label}
                                    </BreadcrumbPage>
                                ) : (
                                    <Link
                                        href={href}
                                        className="hover:text-foreground transition-colors"
                                    >
                                        {label}
                                    </Link>
                                )}
                            </BreadcrumbItem>
                        </React.Fragment>
                    )
                })}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
