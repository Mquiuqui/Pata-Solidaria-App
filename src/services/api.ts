import { API_BASE_URL } from '@/config/api.config';

const BASE_URL = API_BASE_URL;

// Log da URL base sendo usada (apenas em desenvolvimento)
if (__DEV__) {
  console.log(`[API] URL Base configurada: ${BASE_URL}`);
}

export interface UsuarioDto {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  isAnonimo: boolean;
  telefoneVerificado: boolean;
}

export interface ApiResponse {
  sucesso: boolean;
  mensagem: string;
  usuario?: UsuarioDto;
  token?: string;
}

export interface CadastroRequest {
  nome: string;
  email: string;
  telefone: string;
  senha: string;
  confirmarSenha: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface CadastroAnonimoRequest {
  telefone: string;
}

export interface ValidarCodigoAnonimoRequest {
  telefone: string;
  codigo: string;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    console.log(`[API] Fazendo requisição: ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(url, {
      ...options,
      headers: defaultHeaders,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`[API] Erro ${response.status}:`, data);
      throw new Error(data.mensagem || `Erro na requisição (${response.status})`);
    }

    console.log(`[API] Sucesso:`, data);
    return data;
  } catch (error: any) {
    console.error(`[API] Erro na requisição para ${url}:`, error);
    
    // Se for erro de rede (sem resposta do servidor)
    if (error.message === 'Network request failed' || error.message.includes('fetch')) {
      throw new Error('Não foi possível conectar ao servidor. Verifique se a API está rodando em http://localhost:5163');
    }
    
    throw error;
  }
}

export const api = {
  /**
   * Cadastra um novo usuário com conta completa
   */
  async cadastro(data: CadastroRequest): Promise<ApiResponse> {
    return fetchApi<ApiResponse>('/cadastro', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Realiza login de um usuário com conta
   */
  async login(data: LoginRequest): Promise<ApiResponse> {
    return fetchApi<ApiResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Inicia cadastro anônimo enviando código de verificação
   */
  async cadastroAnonimo(data: CadastroAnonimoRequest): Promise<ApiResponse> {
    return fetchApi<ApiResponse>('/cadastro-anonimo', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Valida código de verificação e completa login anônimo
   */
  async validarCodigoAnonimo(data: ValidarCodigoAnonimoRequest): Promise<ApiResponse> {
    return fetchApi<ApiResponse>('/validar-codigo-anonimo', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
