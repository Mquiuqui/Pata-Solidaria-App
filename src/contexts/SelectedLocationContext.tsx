import React, { createContext, useCallback, useContext, useState } from "react"

type SelectedLocation = {
    latitude: number
    longitude: number
} | null

export type RelatarAnimalDraft = {
    titulo: string
    tipo: string
    descricao: string
    localizacao: string
    dataHora: string
    imageBase64: string | null
    compartilharContato: boolean
}

type ContextValue = {
    selectedLocation: SelectedLocation
    setSelectedLocation: (latitude: number, longitude: number) => void
    clearSelectedLocation: () => void
    formDraft: RelatarAnimalDraft | null
    setFormDraft: (draft: RelatarAnimalDraft) => void
    clearFormDraft: () => void
}

const SelectedLocationContext = createContext<ContextValue | null>(null)

export function SelectedLocationProvider({ children }: { children: React.ReactNode }) {
    const [selectedLocation, setState] = useState<SelectedLocation>(null)
    const [formDraft, setFormDraftState] = useState<RelatarAnimalDraft | null>(null)

    const setSelectedLocation = useCallback((latitude: number, longitude: number) => {
        setState({ latitude, longitude })
    }, [])

    const clearSelectedLocation = useCallback(() => {
        setState(null)
    }, [])

    const setFormDraft = useCallback((draft: RelatarAnimalDraft) => {
        setFormDraftState(draft)
    }, [])

    const clearFormDraft = useCallback(() => {
        setFormDraftState(null)
    }, [])

    return (
        <SelectedLocationContext.Provider
            value={{
                selectedLocation,
                setSelectedLocation,
                clearSelectedLocation,
                formDraft,
                setFormDraft,
                clearFormDraft,
            }}
        >
            {children}
        </SelectedLocationContext.Provider>
    )
}

export function useSelectedLocation() {
    const ctx = useContext(SelectedLocationContext)
    if (!ctx) throw new Error("useSelectedLocation must be used within SelectedLocationProvider")
    return ctx
}
