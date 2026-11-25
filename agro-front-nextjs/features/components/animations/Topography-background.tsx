'use client'

import dynamic from 'next/dynamic'
import { useSyncExternalStore } from 'react'
import { cn } from '@/lib/utils'

//- Se carga solo en el navegador y no bloquea el primer render
const Topography = dynamic(() => import('@/components/Topography'), { ssr: false })

//- Un "store" por consulta, definido fuera del componente: las funciones mantienen su identidad entre renders
function mediaStore(query: string) {
    return {
        subscribe: (callback: () => void) => {
            const mq = window.matchMedia(query)
            mq.addEventListener('change', callback)
            return () => mq.removeEventListener('change', callback)
        },
        getSnapshot: () => window.matchMedia(query).matches,
    }
}

const desktopStore = mediaStore('(min-width: 768px)')
const reducedMotionStore = mediaStore('(prefers-reduced-motion: reduce)')

//- En el servidor se asume celular: no se carga el efecto pesado
const getServerSnapshot = () => false

//- Círculos, no elipses: una elipse se estira con la proporción de la pantalla y en un celular alto salía deformada.
//- Cada familia vive en su esquina, con una máscara que la desvanece: así nunca se cruzan (sin moiré) y el centro queda limpio.
const FAMILIES = [
    {
        image: 'repeating-radial-gradient(circle at 85% 10%, transparent 0 26px, rgba(163,230,53,0.22) 26px 27.5px)',
        mask: 'radial-gradient(circle at 85% 10%, black 0%, transparent 65%)',
    },
    {
        image: 'repeating-radial-gradient(circle at 8% 92%, transparent 0 34px, rgba(255,255,255,0.12) 34px 35.5px)',
        mask: 'radial-gradient(circle at 8% 92%, black 0%, transparent 55%)',
    },
] as const

//- Curvas de nivel en CSS puro. Solo se desplazan (lo hace la GPU, sin repintar) y no hacen zoom: el zoom engrosaba las líneas
export function ContourLayer({ className }: { className?: string }) {
    return (
        <div aria-hidden="true" className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
            <style>{`
                @keyframes contour-drift {
                    from { transform: translate3d(-1.5%, -1.5%, 0); }
                    to   { transform: translate3d(1.5%, 1.5%, 0); }
                }
                @media (prefers-reduced-motion: reduce) {
                    .contour-drift { animation: none !important; }
                }
            `}</style>

            {FAMILIES.map((family) => (
                <div
                    key={family.image}
                    className="contour-drift absolute -inset-[8%] will-change-transform"
                    style={{
                        backgroundImage: family.image,
                        maskImage: family.mask,
                        WebkitMaskImage: family.mask,
                        animation: 'contour-drift 30s ease-in-out infinite alternate',
                    }}
                />
            ))}
        </div>
    )
}

type Props = {
    /** false: en el celular no dibuja nada (el banner pone su propia capa encima de la foto) */
    showOnMobile?: boolean
}

export const TopographyBackground = ({ showOnMobile = true }: Props) => {
    const isDesktop = useSyncExternalStore(desktopStore.subscribe, desktopStore.getSnapshot, getServerSnapshot)
    const reducedMotion = useSyncExternalStore(
        reducedMotionStore.subscribe,
        reducedMotionStore.getSnapshot,
        getServerSnapshot,
    )

    if (!isDesktop) return showOnMobile ? <ContourLayer /> : null
    if (reducedMotion) return <ContourLayer />

    //- Pasale acá los valores del panel de la página (colores, velocidad, densidad...)
    return <Topography />
}