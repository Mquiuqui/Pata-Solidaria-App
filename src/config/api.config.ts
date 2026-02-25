/**
 * Configuração da API
 * 
 * IMPORTANTE: Se você estiver testando em um dispositivo físico,
 * você precisa usar o IP da sua máquina na rede local ao invés de localhost.
 * 
 * Como descobrir seu IP:
 * - Windows: ipconfig (procure por "IPv4 Address")
 * - Mac/Linux: ifconfig ou ip addr
 * 
 * Exemplo: Se seu IP for 192.168.1.100, use:
 * export const API_BASE_URL = 'http://192.168.1.100:5163/api/usuario';
 */

import { Platform } from 'react-native';

const API_PORT = '5163';

/**
 * Configuração automática por plataforma:
 * - Android Emulator: 10.0.2.2 (alias para localhost)
 * - iOS Simulator: localhost
 * - Web: localhost
 */
export function getApiBaseUrl(): string {
  if (Platform.OS === 'android') {
    // Para emulador Android
    return `http://10.0.2.2:${API_PORT}/api/usuario`;
    
    // ⚠️ DESCOMENTE E CONFIGURE SE ESTIVER USANDO DISPOSITIVO FÍSICO:
    // return `http://SEU_IP_AQUI:${API_PORT}/api/usuario`;
    // Exemplo: return `http://192.168.1.100:${API_PORT}/api/usuario`;
  }
  
  // iOS Simulator e Web
  return `http://localhost:${API_PORT}/api/usuario`;
}

/**
 * Para forçar um IP específico (útil para dispositivos físicos)
 * Descomente e configure:
 */
// export const FORCE_IP = '192.168.1.100'; // Substitua pelo seu IP

export const API_BASE_URL = getApiBaseUrl();
