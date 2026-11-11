'use client'

import dynamic from 'next/dynamic'
import { useSyncExternalStore } from 'react'

const Lightfall = dynamic(() => import('@/components/Lightfall'), { ssr: false })

const QUERY = '(min-width: 768px)'

function subscribe(callback: () => void) {
    const mq = window.matchMedia(QUERY)
    mq.addEventListener('change', callback)
    return () => mq.removeEventListener('change', callback)
}

const getSnapshot = () => window.matchMedia(QUERY).matches
const getServerSnapshot = () => false

//- Posiciones fijas (sin Math.random) para evitar errores de hidratación
const STREAKS = Array.from({ length: 16 }, (_, i) => ({
    left: `${(i * 37 + 8) % 100}%`,
    height: 90 + ((i * 53) % 140),
    duration: 3.2 + ((i * 29) % 30) / 10,
    delay: -((i * 41) % 50) / 10,
    opacity: 0.25 + ((i * 17) % 50) / 100,
}))

function MobileStreaks() {
    return (
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <style>{`
                @keyframes lightfall-drop {
                    from { transform: translate3d(0, -300px, 0); }
                    to   { transform: translate3d(0, 120vh, 0); }
                }
                @media (prefers-reduced-motion: reduce) {
                    .lightfall-streak { animation: none !important; }
                }
            `}</style>

            <div className="absolute inset-x-0 top-0 h-2/3 bg-[radial-gradient(ellipse_at_top,rgba(148,163,184,0.25),transparent_70%)]" />

            {STREAKS.map((s, i) => (
                <span
                    key={i}
                    className="lightfall-streak absolute top-0 w-0.5 rounded-full bg-linear-to-b from-transparent via-white/70 to-white will-change-transform"
                    style={{
                        left: s.left,
                        height: s.height,
                        opacity: s.opacity,
                        animation: `lightfall-drop ${s.duration}s linear ${s.delay}s infinite`,
                    }}
                />
            ))}
        </div>
    )
}

export const LightfallBackground = () => {
    const isDesktop = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

    if (!isDesktop) return <MobileStreaks />

    return (
        <Lightfall
            colors={['#ffffff']}
            backgroundColor="#94a3b8"
            speed={0.3}
            streakCount={2}
            streakWidth={0.8}
            streakLength={1}
            twinkle={0.3}
            backgroundGlow={0.1}
            headGlow={0.6}
            bloom={0.35}
            density={0.6}
            glow={1}
            depth={0.5}
            zoom={3}
            mouseInteraction
            holdToWarp
            lens={0.5}
            mouseStrength={0.4}
            mouseRadius={0.45}
            intro
            fade={0}
            lightMode={false}
        />
    )
}