import { Platform } from "react-native"

const API_PORT = "5163"

export function getApiBaseUrl(): string {
    if (Platform.OS === "android") {
        return `http://10.0.2.2:${API_PORT}/api/usuario`
    }
    return `http://localhost:${API_PORT}/api/usuario`
}

export const API_BASE_URL = getApiBaseUrl()
