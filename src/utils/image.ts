export function getBase64ImageUri(imagemBase64: string | null | undefined): string | null {
    if (!imagemBase64 || typeof imagemBase64 !== "string" || !imagemBase64.trim()) {
        return null
    }
    const trimmed = imagemBase64.trim()
    if (trimmed.startsWith("data:")) {
        return trimmed
    }
    return `data:image/jpeg;base64,${trimmed}`
}
