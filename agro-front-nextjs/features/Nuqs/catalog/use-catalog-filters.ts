"use client"

import type { TransitionStartFunction } from "react"
import { useQueryStates } from "nuqs"
import { catalogParsers } from "./catalog-search-params"

//- shallow:false => cada cambio vuelve a ejecutar la página del servidor
//- clearOnDefault => lo que está en su valor por defecto no aparece en la URL
export const useCatalogFilters = (startTransition?: TransitionStartFunction) =>
    useQueryStates(catalogParsers, {
        shallow: false,
        clearOnDefault: true,
        startTransition,
    })