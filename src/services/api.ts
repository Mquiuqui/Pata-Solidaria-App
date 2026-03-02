import { API_BASE_URL } from "@/config/api.config"

const BASE_URL = API_BASE_URL
const ANIMAIS_PERDIDOS_BASE = API_BASE_URL.replace(/\/api\/usuario\/?$/, "") + "/api/animais-perdidos"
const PUBLICACAO_BASE = API_BASE_URL.replace(/\/api\/usuario\/?$/, "") + "/api/Publicacao"

export interface UsuarioDto {
  id: number
  nome: string
  email: string
  telefone: string
  isAnonimo: boolean
  telefoneVerificado: boolean
  fotoPerfil?: string | null
  sobreMim?: string | null
}

export interface AtualizarPerfilRequest {
  nome: string
  email: string
  fotoPerfil?: string | null
  sobreMim?: string | null
}

export interface ApiResponse {
  sucesso: boolean
  mensagem: string
  usuario?: UsuarioDto
  token?: string
}

export interface CadastroRequest {
  nome: string
  email: string
  telefone: string
  senha: string
  confirmarSenha: string
}

export interface LoginRequest {
  email: string
  senha: string
}

export interface CadastroAnonimoRequest {
  telefone: string
}

export interface ValidarCodigoAnonimoRequest {
  telefone: string
  codigo: string
}

export interface ApiErrorItem {
  code?: string
  message: string
  field?: string | null
  type?: string
}

export interface ApiErrorResponse {
  errors?: ApiErrorItem[]
  mensagem?: string
}

export interface AnimalPerdido {
  id: number
  titulo: string
  tipo: string
  endereco: string
  latitude: number
  longitude: number
  descricao?: string | null
  imageBase64?: string | null
  dataCriacao: string
  telefone?: string | null
}

export interface Publicacao {
  id: number
  ongId: number
  titulo: string
  conteudo: string
  imagemBase64?: string | null
  dataInicio: string
  dataFim?: string | null
  dataCriacao: string
  dataAtualizacao?: string | null
  ativo: boolean
  ong?: { id: number; nome?: string; [key: string]: unknown } | null
}

export interface CadastroAnimalPerdidoRequest {
  titulo: string
  tipo: string
  endereco: string
  latitude: number
  longitude: number
  descricao?: string | null
  imageBase64?: string | null
  telefone?: string | null
}

export interface ValidarCodigoAnonimoResponse {
  sucesso: boolean
  mensagem: string | null
  token: string
  usuario: UsuarioDto
  isAnonimo: boolean
}

function getErrorMessage(data: ApiErrorResponse | null, status: number): string {
  if (!data) return `Erro na requisição (${status})`
  if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors[0].message
  }
  return data.mensagem || `Erro na requisição (${status})`
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`
  const defaultHeaders = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: defaultHeaders,
    })

    if (response.status === 204) {
      return {} as T
    }

    const text = await response.text()
    const data = text ? (JSON.parse(text) as ApiErrorResponse | T) : null

    if (!response.ok) {
      const errData = data as ApiErrorResponse | null
      throw new Error(getErrorMessage(errData, response.status))
    }

    return data as T
  } catch (error: unknown) {
    const err = error as Error
    if (err.message === "Network request failed" || err.message.includes("fetch")) {
      throw new Error("Não foi possível conectar ao servidor. Verifique se a API está rodando.")
    }
    if (err.name === "SyntaxError" && err.message.includes("JSON")) {
      throw new Error("Resposta inválida do servidor.")
    }
    throw error
  }
}

export const api = {
  async cadastro(data: CadastroRequest): Promise<ApiResponse> {
    return fetchApi<ApiResponse>("/cadastro", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  async login(data: LoginRequest): Promise<ApiResponse> {
    return fetchApi<ApiResponse>("/login", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  async solicitarCodigoAnonimo(data: CadastroAnonimoRequest): Promise<void> {
    await fetchApi<Record<string, never>>("/login-anonimo/solicitar-codigo", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  async validarCodigoAnonimo(data: ValidarCodigoAnonimoRequest): Promise<ValidarCodigoAnonimoResponse> {
    return fetchApi<ValidarCodigoAnonimoResponse>("/login-anonimo/validar-codigo", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  async obterPerfil(token: string): Promise<UsuarioDto> {
    const url = `${BASE_URL}/perfil`
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      const text = await response.text()
      const data = text ? (JSON.parse(text) as ApiErrorResponse) : null
      throw new Error(getErrorMessage(data, response.status))
    }
    return response.json() as Promise<UsuarioDto>
  },

  async atualizarPerfil(token: string, data: AtualizarPerfilRequest): Promise<void> {
    const url = `${BASE_URL}/perfil`
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const text = await response.text()
      const dataErr = text ? (JSON.parse(text) as ApiErrorResponse) : null
      throw new Error(getErrorMessage(dataErr, response.status))
    }
  },

  async listarAnimaisPerdidos(): Promise<AnimalPerdido[]> {
    const url = ANIMAIS_PERDIDOS_BASE
    const defaultHeaders = { "Content-Type": "application/json" }
    const response = await fetch(url, { method: "GET", headers: defaultHeaders })
    if (!response.ok) {
      const text = await response.text()
      const data = text ? JSON.parse(text) as ApiErrorResponse : null
      const msg = data?.errors?.[0]?.message ?? data?.mensagem ?? `Erro ${response.status}`
      throw new Error(msg)
    }
    const data = await response.json()
    return Array.isArray(data) ? data : []
  },

  async buscarAnimalPerdidoPorId(id: number): Promise<AnimalPerdido> {
    const url = `${ANIMAIS_PERDIDOS_BASE}/Busca?id=${id}`
    const defaultHeaders = { "Content-Type": "application/json" }
    const response = await fetch(url, { method: "GET", headers: defaultHeaders })
    if (!response.ok) {
      const text = await response.text()
      const data = text ? JSON.parse(text) as ApiErrorResponse : null
      const msg = data?.errors?.[0]?.message ?? data?.mensagem ?? `Erro ${response.status}`
      throw new Error(msg)
    }
    return response.json()
  },

  async cadastrarAnimalPerdido(data: CadastroAnimalPerdidoRequest): Promise<AnimalPerdido> {
    const url = ANIMAIS_PERDIDOS_BASE
    const defaultHeaders = { "Content-Type": "application/json" }
    const response = await fetch(url, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const text = await response.text()
      const dataErr = text ? JSON.parse(text) as ApiErrorResponse : null
      const msg = dataErr?.errors?.[0]?.message ?? dataErr?.mensagem ?? `Erro ${response.status}`
      throw new Error(msg)
    }
    return response.json()
  },

  async listarPublicacoesPorUf(uf: string): Promise<Publicacao[]> {
    const url = `${PUBLICACAO_BASE}/GetAllPublicacoesByUf?uf=${encodeURIComponent(uf)}`
    const defaultHeaders = { "Content-Type": "application/json" }
    const response = await fetch(url, { method: "GET", headers: defaultHeaders })
    if (!response.ok) {
      const text = await response.text()
      const data = text ? JSON.parse(text) as ApiErrorResponse : null
      const msg = data?.errors?.[0]?.message ?? data?.mensagem ?? `Erro ${response.status}`
      throw new Error(msg)
    }
    const data = await response.json()
    return Array.isArray(data) ? data : []
  },

  async buscarPublicacaoPorId(id: number): Promise<Publicacao> {
    const url = `${PUBLICACAO_BASE}/GetByIdPublicacao?id=${id}`
    const defaultHeaders = { "Content-Type": "application/json" }
    const response = await fetch(url, { method: "GET", headers: defaultHeaders })
    if (!response.ok) {
      const text = await response.text()
      const data = text ? JSON.parse(text) as ApiErrorResponse : null
      const msg = data?.errors?.[0]?.message ?? data?.mensagem ?? `Erro ${response.status}`
      throw new Error(msg)
    }
    return response.json()
  },
}
