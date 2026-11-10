'use client'

import { apiFetch, fetchMe } from "@/lib/api";
import { SessionUser } from "@/lib/types/auth.type";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type Status = 'loading' | 'authenticated' | 'anonymous'

type AuthContextValue = {
    user: SessionUser | null
    status: Status
    setUser: (user: SessionUser | null) => void
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

//? --------
export function AuthProvider({children}: {children: React.ReactNode}) {

    const [user, setUserState] = useState<SessionUser | null>(null)
    const [status, setStatus] = useState<Status>('loading')

    const setUser = useCallback((u: SessionUser | null) => {
        setUserState(u)
        setStatus(u ? 'authenticated' : 'anonymous')
    }, [])

    //- Al montar, preguntamos quién está logueado (refresca solo si el access venció)
    useEffect(() => {
        let cancelled = false

        const initializeAuth = async () => {
            try {
                const currentUser = await fetchMe()

                if (!cancelled) {
                    setUser(currentUser)
                }
            } catch (error) {
                console.error("Error al recuperar la sesión:", error)

                if (!cancelled) {
                    setUser(null)
                }
            }
        }

        void initializeAuth()

        return () => {
            cancelled = true
        }
    }, [setUser])



    const logout = useCallback(async () => {
        await apiFetch('/auth/logout', { method: 'POST' }).catch(() => null)
        setUser(null)
    }, [setUser])


    const value = useMemo(() => ({ user, status, setUser, logout }), [user, status, setUser, logout])

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}


//? --------
export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
    return ctx
}