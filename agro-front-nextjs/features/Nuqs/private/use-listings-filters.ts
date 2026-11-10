'use client'

import type { TransitionStartFunction } from 'react'
import { useQueryStates } from 'nuqs'
import { privateListingsNuqs } from './private-listings-nuqs'

//- shallow:false => cada cambio vuelve a ejecutar la página del servidor
//- clearOnDefault => lo que está en su valor por defecto no aparece en la URL
//- startTransition (opcional) => permite mostrar un estado de carga mientras el servidor responde
export const useListingsFilters = (startTransition?: TransitionStartFunction) =>
    useQueryStates(privateListingsNuqs, {
        shallow: false,
        clearOnDefault: true,
        startTransition,
    })