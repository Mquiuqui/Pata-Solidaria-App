import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@pata_solidaria:token';
const USER_KEY = '@pata_solidaria:user';

export const storage = {
  /**
   * Salva o token de autenticação
   */
  async saveToken(token: string): Promise<void> {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  },

  /**
   * Recupera o token de autenticação
   */
  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem(TOKEN_KEY);
  },

  /**
   * Remove o token de autenticação
   */
  async removeToken(): Promise<void> {
    await AsyncStorage.removeItem(TOKEN_KEY);
  },

  /**
   * Salva os dados do usuário
   */
  async saveUser(user: any): Promise<void> {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  /**
   * Recupera os dados do usuário
   */
  async getUser(): Promise<any | null> {
    const user = await AsyncStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  /**
   * Remove os dados do usuário
   */
  async removeUser(): Promise<void> {
    await AsyncStorage.removeItem(USER_KEY);
  },

  /**
   * Limpa todos os dados de autenticação
   */
  async clear(): Promise<void> {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  },
};
