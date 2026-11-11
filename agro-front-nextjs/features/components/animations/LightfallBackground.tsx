'use client'

import { useSyncExternalStore } from 'react'
import Lightfall from '@/components/Lightfall'

const QUERY = '(max-width: 767px)'

function subscribe(callback: () => void) {
    const mq = window.matchMedia(QUERY)
    mq.addEventListener('change', callback)
    return () => mq.removeEventListener('change', callback)
}

const getSnapshot = () => window.matchMedia(QUERY).matches
const getServerSnapshot = () => false

export const LightfallBackground = () => {
    const isMobile = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

    return (
        <Lightfall
            colors={['#ffffff']}
            backgroundColor="#94a3b8"
            speed={isMobile ? 0.25 : 0.3}
            streakCount={isMobile ? 1 : 2}
            streakWidth={isMobile ? 1.4 : 0.8}
            streakLength={1}
            twinkle={0.3}
            backgroundGlow={0.1}
            headGlow={0.6}
            bloom={isMobile ? 0.2 : 0.35}
            density={isMobile ? 0.45 : 0.6}
            glow={1}
            depth={0.5}
            zoom={isMobile ? 7 : 3}
            dpr={isMobile ? 1.5 : undefined}
            mouseInteraction={!isMobile}
            holdToWarp={!isMobile}
            lens={0.5}
            mouseStrength={0.4}
            mouseRadius={0.45}
            intro
            fade={0}
            lightMode={false}
        />
    )
}