import * as SecureStore from "expo-secure-store"

const TOKEN_KEY = "pata_solidaria_token"
const USER_KEY = "pata_solidaria_user"

export const storage = {
    /**
     * Salva o token de autenticação
     */
    async saveToken(token: string): Promise<void> {
        await SecureStore.setItemAsync(TOKEN_KEY, token)
    },

    /**
     * Recupera o token de autenticação
     */
    async getToken(): Promise<string | null> {
        return await SecureStore.getItemAsync(TOKEN_KEY)
    },

    /**
     * Remove o token de autenticação
     */
    async removeToken(): Promise<void> {
        await SecureStore.deleteItemAsync(TOKEN_KEY)
    },

    /**
     * Salva os dados do usuário
     */
    async saveUser(user: unknown): Promise<void> {
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user))
    },

    /**
     * Recupera os dados do usuário
     */
    async getUser(): Promise<unknown | null> {
        const data = await SecureStore.getItemAsync(USER_KEY)
        return data ? JSON.parse(data) : null
    },

    /**
     * Remove os dados do usuário
     */
    async removeUser(): Promise<void> {
        await SecureStore.deleteItemAsync(USER_KEY)
    },

    /**
     * Limpa todos os dados de autenticação
     */
    async clear(): Promise<void> {
        await SecureStore.deleteItemAsync(TOKEN_KEY)
        await SecureStore.deleteItemAsync(USER_KEY)
    },
}
