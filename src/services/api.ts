import { API_BASE_URL } from '@/config/api.config';

const BASE_URL = API_BASE_URL;

/** Base URL da API de animais perdidos (mesmo host, path /api/animais-perdidos) */
const ANIMAIS_PERDIDOS_BASE = API_BASE_URL.replace(/\/api\/usuario\/?$/, '') + '/api/animais-perdidos';

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

/** Animal perdido (listagem e busca) – ver contexto-animais.md */
export interface AnimalPerdido {
  id: number;
  titulo: string;
  tipo: string;
  endereco: string;
  latitude: number;
  longitude: number;
  descricao?: string | null;
  imageBase64?: string | null;
  dataCriacao: string;
  /** Preenchido quando o usuário optou por compartilhar contato no cadastro */
  telefone?: string | null;
}

/** Body do POST /api/animais-perdidos (cadastro) */
export interface CadastroAnimalPerdidoRequest {
  titulo: string;
  tipo: string;
  endereco: string;
  latitude: number;
  longitude: number;
  descricao?: string | null;
  imageBase64?: string | null;
  /** Enviado quando "Deseja compartilhar seu contato" está marcado */
  telefone?: string | null;
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

  /**
   * Lista todos os animais perdidos (para markers no mapa)
   * GET /api/animais-perdidos
   */
  async listarAnimaisPerdidos(): Promise<AnimalPerdido[]> {
    const url = ANIMAIS_PERDIDOS_BASE;
    const defaultHeaders = { 'Content-Type': 'application/json' };
    const response = await fetch(url, { method: 'GET', headers: defaultHeaders });
    if (!response.ok) {
      const text = await response.text();
      const data = text ? JSON.parse(text) as ApiErrorResponse : null;
      const msg = data?.errors?.[0]?.message ?? data?.mensagem ?? `Erro ${response.status}`;
      throw new Error(msg);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  },

  /**
   * Busca um animal perdido por id
   * GET /api/animais-perdidos/Busca?id={id}
   */
  async buscarAnimalPerdidoPorId(id: number): Promise<AnimalPerdido> {
    const url = `${ANIMAIS_PERDIDOS_BASE}/Busca?id=${id}`;
    const defaultHeaders = { 'Content-Type': 'application/json' };
    const response = await fetch(url, { method: 'GET', headers: defaultHeaders });
    if (!response.ok) {
      const text = await response.text();
      const data = text ? JSON.parse(text) as ApiErrorResponse : null;
      const msg = data?.errors?.[0]?.message ?? data?.mensagem ?? `Erro ${response.status}`;
      throw new Error(msg);
    }
    return response.json();
  },

  /**
   * Cadastra um animal perdido
   * POST /api/animais-perdidos
   */
  async cadastrarAnimalPerdido(data: CadastroAnimalPerdidoRequest): Promise<AnimalPerdido> {
    const url = ANIMAIS_PERDIDOS_BASE;
    const defaultHeaders = { 'Content-Type': 'application/json' };
    const response = await fetch(url, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const text = await response.text();
      const dataErr = text ? JSON.parse(text) as ApiErrorResponse : null;
      const msg = dataErr?.errors?.[0]?.message ?? dataErr?.mensagem ?? `Erro ${response.status}`;
      throw new Error(msg);
    }
    return response.json();
  },
};
