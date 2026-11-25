'use client'

import dynamic from 'next/dynamic'
import { useSyncExternalStore } from 'react'

//- Se carga solo en el navegador y no bloquea el primer render del hero
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

//- Curvas de nivel en CSS puro: dos juegos de anillos que se cruzan parecen un relieve. Sin WebGL ni JavaScript
function ContourFallback() {
    return (
        <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
                backgroundImage: [
                    'repeating-radial-gradient(ellipse at 25% 35%, transparent 0 24px, rgba(163,230,53,0.10) 24px 25px)',
                    'repeating-radial-gradient(ellipse at 78% 72%, transparent 0 30px, rgba(255,255,255,0.07) 30px 31px)',
                ].join(', '),
                maskImage: 'radial-gradient(ellipse at 40% 45%, black, transparent 85%)',
            }}
        />
    )
}

export const TopographyBackground = () => {
    const isDesktop = useSyncExternalStore(desktopStore.subscribe, desktopStore.getSnapshot, getServerSnapshot)
    const reducedMotion = useSyncExternalStore(
        reducedMotionStore.subscribe,
        reducedMotionStore.getSnapshot,
        getServerSnapshot,
    )

    if (!isDesktop || reducedMotion) return <ContourFallback />

    //- Pasale acá los valores del panel de la página (colores, velocidad, densidad...)
    return <Topography />
}