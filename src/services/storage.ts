import * as SecureStore from "expo-secure-store"

const TOKEN_KEY = "pata_solidaria_token"
const USER_KEY = "pata_solidaria_user"

export const storage = {
    async saveToken(token: string): Promise<void> {
        await SecureStore.setItemAsync(TOKEN_KEY, token)
    },

    async getToken(): Promise<string | null> {
        return await SecureStore.getItemAsync(TOKEN_KEY)
    },

    async removeToken(): Promise<void> {
        await SecureStore.deleteItemAsync(TOKEN_KEY)
    },

    async saveUser(user: unknown): Promise<void> {
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user))
    },

    async getUser(): Promise<unknown | null> {
        const data = await SecureStore.getItemAsync(USER_KEY)
        return data ? JSON.parse(data) : null
    },

    async removeUser(): Promise<void> {
        await SecureStore.deleteItemAsync(USER_KEY)
    },

    async clear(): Promise<void> {
        await SecureStore.deleteItemAsync(TOKEN_KEY)
        await SecureStore.deleteItemAsync(USER_KEY)
    },
}
