// "use client"

// import { useEffect } from "react"

// //- La barra de filtros es fixed (llega hasta el borde de la pantalla). Cuando el footer entra en pantalla,
// //- este componente publica cuánto mide la parte visible (--footer-overlap) y la barra termina ahí.
// export function SidebarFooterGuard({ footerId }: { footerId: string }) {
//     useEffect(() => {
//         const footer = document.getElementById(footerId)
//         const scope = footer?.parentElement
//         if (!footer || !scope) return

//         let frame = 0

//         const update = () => {
//             frame = 0
//             const overlap = Math.max(0, window.innerHeight - footer.getBoundingClientRect().top)
//             scope.style.setProperty("--footer-overlap", `${Math.round(overlap)}px`)
//         }

//         //- Un cálculo por cuadro como máximo, aunque el scroll dispare muchos eventos
//         const schedule = () => {
//             if (!frame) frame = requestAnimationFrame(update)
//         }

//         update()
//         window.addEventListener("scroll", schedule, { passive: true })
//         window.addEventListener("resize", schedule)

//         //- Si cambia el alto del contenido (más resultados, filtros que se abren), la posición del footer cambia sin scroll
//         const observer = new ResizeObserver(schedule)
//         observer.observe(document.body)
//         observer.observe(footer)

//         return () => {
//             if (frame) cancelAnimationFrame(frame)
//             window.removeEventListener("scroll", schedule)
//             window.removeEventListener("resize", schedule)
//             observer.disconnect()
//             scope.style.removeProperty("--footer-overlap")
//         }
//     }, [footerId])

//     return null
// }