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

/** Formato de erro da API (ex.: login anônimo) */
export interface ApiErrorItem {
  code?: string;
  message: string;
  field?: string | null;
  type?: string;
}

export interface ApiErrorResponse {
  errors?: ApiErrorItem[];
  mensagem?: string;
}

/** Resposta de sucesso do validar-codigo (login anônimo) */
export interface ValidarCodigoAnonimoResponse {
  sucesso: boolean;
  mensagem: string | null;
  token: string;
  usuario: UsuarioDto;
  isAnonimo: boolean;
}

function getErrorMessage(data: ApiErrorResponse | null, status: number): string {
  if (!data) return `Erro na requisição (${status})`;
  if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors[0].message;
  }
  return data.mensagem || `Erro na requisição (${status})`;
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

    // 204 No Content: corpo vazio, não fazer parse
    if (response.status === 204) {
      console.log(`[API] Sucesso: 204 No Content`);
      return {} as T;
    }

    const text = await response.text();
    const data = text ? (JSON.parse(text) as ApiErrorResponse | T) : null;

    if (!response.ok) {
      const errData = data as ApiErrorResponse | null;
      console.error(`[API] Erro ${response.status}:`, errData);
      throw new Error(getErrorMessage(errData, response.status));
    }

    console.log(`[API] Sucesso:`, data);
    return data as T;
  } catch (error: any) {
    console.error(`[API] Erro na requisição para ${url}:`, error);

    if (error.message === 'Network request failed' || error.message.includes('fetch')) {
      throw new Error('Não foi possível conectar ao servidor. Verifique se a API está rodando.');
    }
    if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
      throw new Error('Resposta inválida do servidor.');
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
   * Login anônimo – solicita código por SMS (retorna 204 No Content)
   */
  async solicitarCodigoAnonimo(data: CadastroAnonimoRequest): Promise<void> {
    await fetchApi<Record<string, never>>('/login-anonimo/solicitar-codigo', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Login anônimo – valida código e retorna token + usuário
   */
  async validarCodigoAnonimo(data: ValidarCodigoAnonimoRequest): Promise<ValidarCodigoAnonimoResponse> {
    return fetchApi<ValidarCodigoAnonimoResponse>('/login-anonimo/validar-codigo', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
