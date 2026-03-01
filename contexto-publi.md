# API – Publicações

Documentação dos endpoints de **publicações** das ONGs: listagem por UF, listagem por ONG, busca por id, criar, editar e ativar/desativar.

**Base URL (exemplo):** `https://sua-api.com/api/Publicacao`

---

## Resumo dos endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/Publicacao/GetAllPublicacoesByUf` | Lista publicações por UF |
| GET | `/api/Publicacao/GetAllPublicacoesByIdOng` | Lista publicações de uma ONG |
| GET | `/api/Publicacao/GetByIdPublicacao` | Busca uma publicação por id |
| POST | `/api/Publicacao/CriarPublicacao` | Cria uma nova publicação |
| PUT | `/api/Publicacao/EditarPublicacao` | Edita uma publicação |
| PATCH | `/api/Publicacao/AtivarOuDesativarPublicacao` | Ativa ou desativa uma publicação |

---

## Formato de erro (todos os endpoints)

Em caso de falha, a API retorna um objeto com a lista de erros:

```json
{
  "errors": [
    {
      "code": "VALIDATION_ERROR",
      "message": "O título é obrigatório",
      "field": null,
      "type": "Validation"
    }
  ]
}
```

**Status HTTP comuns:** `400` (validação), `404` (não encontrado), `500` (erro interno).

---

## 1. Listar publicações por UF

Retorna todas as publicações das ONGs de um estado (UF).

### Request

**`GET /api/Publicacao/GetAllPublicacoesByUf?uf={uf}`**

| Query | Tipo   | Obrigatório | Descrição        |
|-------|--------|-------------|------------------|
| `uf`  | string | Sim         | Sigla da UF (ex.: SP, MG) |

**Exemplo:** `GET /api/Publicacao/GetAllPublicacoesByUf?uf=SP`

### Response – sucesso

**Status:** `200 OK`

**Body:** array de publicações (cada item pode incluir dados da ONG, conforme implementação):

```json
[
  {
    "id": 1,
    "ongId": 10,
    "titulo": "Campanha de adoção",
    "conteudo": "Venha conhecer nossos animais...",
    "imagemBase64": "data:image/jpeg;base64,/9j/4AAQ...",
    "dataInicio": "2025-02-01T00:00:00Z",
    "dataFim": "2025-02-28T23:59:59Z",
    "dataCriacao": "2025-02-01T10:00:00Z",
    "dataAtualizacao": null,
    "ativo": true,
    "ong": { ... }
  }
]
```

| Campo            | Tipo    | Descrição                          |
|------------------|---------|------------------------------------|
| `id`             | number  | Id da publicação                   |
| `ongId`          | number  | Id da ONG                          |
| `titulo`         | string  | Título                             |
| `conteudo`       | string  | Conteúdo/texto                     |
| `imagemBase64`   | string \| null | Imagem em base64 (opcional) |
| `dataInicio`     | string  | Data/hora início (ISO 8601)        |
| `dataFim`        | string \| null | Data/hora fim (opcional)      |
| `dataCriacao`    | string  | Data/hora de criação               |
| `dataAtualizacao`| string \| null | Última atualização             |
| `ativo`          | boolean | Se a publicação está ativa        |
| `ong`            | object  | Dados da ONG (quando incluído)     |

---

## 2. Listar publicações por ONG

Retorna todas as publicações de uma ONG específica.

### Request

**`GET /api/Publicacao/GetAllPublicacoesByIdOng?ongId={ongId}`**

| Query   | Tipo   | Obrigatório | Descrição   |
|---------|--------|-------------|-------------|
| `ongId` | number | Sim         | Id da ONG   |

**Exemplo:** `GET /api/Publicacao/GetAllPublicacoesByIdOng?ongId=10`

### Response – sucesso

**Status:** `200 OK`

**Body:** mesmo formato do endpoint **Listar por UF** (array de publicações). Se a ONG não existir ou não tiver publicações, retorna array vazio `[]` ou erro conforme implementação.

---

## 3. Buscar publicação por id

Retorna uma única publicação pelo id.

### Request

**`GET /api/Publicacao/GetByIdPublicacao?id={id}`**

| Query | Tipo   | Obrigatório | Descrição          |
|-------|--------|-------------|--------------------|
| `id`  | number | Sim         | Id da publicação  |

**Exemplo:** `GET /api/Publicacao/GetByIdPublicacao?id=1`

### Response – sucesso

**Status:** `200 OK`

**Body:**

```json
{
  "id": 1,
  "ongId": 10,
  "titulo": "Campanha de adoção",
  "conteudo": "Venha conhecer nossos animais...",
  "imagemBase64": "data:image/jpeg;base64,/9j/4AAQ...",
  "dataInicio": "2025-02-01T00:00:00Z",
  "dataFim": "2025-02-28T23:59:59Z",
  "dataCriacao": "2025-02-01T10:00:00Z",
  "dataAtualizacao": null,
  "ativo": true,
  "ong": { ... }
}
```

### Response – erro

**Status:** `404 Not Found` quando o id não existe (ou resposta de erro padrão com `errors`).

---

## 4. Criar publicação

Cria uma nova publicação para uma ONG.

### Request

**`POST /api/Publicacao/CriarPublicacao`**

**Headers:** `Content-Type: application/json`

**Body:**

```json
{
  "ongId": 10,
  "titulo": "Campanha de adoção - Fevereiro",
  "conteudo": "Venha conhecer nossos animais disponíveis para adoção.",
  "imagemBase64": "data:image/jpeg;base64,/9j/4AAQ...",
  "dataInicio": "2025-02-01T00:00:00",
  "dataFim": "2025-02-28T23:59:59"
}
```

| Campo          | Tipo   | Obrigatório | Descrição                                      |
|----------------|--------|-------------|------------------------------------------------|
| `ongId`        | number | Sim         | Id da ONG dona da publicação                   |
| `titulo`       | string | Sim         | Título (mín. 5 caracteres)                    |
| `conteudo`     | string | Sim         | Conteúdo (mín. 5 caracteres)                   |
| `imagemBase64` | string \| null | Não   | Imagem em base64 (opcional)                   |
| `dataInicio`   | string | Sim         | Data/hora de início (ISO 8601)                 |
| `dataFim`      | string \| null | Não   | Data/hora de fim (opcional)                   |

### Response – sucesso

**Status:** `204 No Content`

**Body:** vazio.

### Response – erro

**Status:** `400 Bad Request` – validação.

Mensagens possíveis:

- `"Id da ONG invalido - {ongId}"` – ongId ≤ 0
- `"O título é obrigatório"`
- `"O conteudo é obrigatório"`
- `"Título deve ter no mínimo 5 caracteres"`
- `"Conteúdo deve ter no mínimo 5 caracteres"`

**Status:** `500` – erro ao salvar no banco.

---

## 5. Editar publicação

Atualiza uma publicação existente. A publicação deve pertencer à ONG informada.

### Request

**`PUT /api/Publicacao/EditarPublicacao`**

**Headers:** `Content-Type: application/json`

**Body:**

```json
{
  "id": 1,
  "ongId": 10,
  "titulo": "Campanha de adoção - Atualizada",
  "conteudo": "Novo texto da campanha.",
  "imagemBase64": null,
  "dataInicio": "2025-02-01T00:00:00",
  "dataFim": "2025-02-28T23:59:59"
}
```

| Campo          | Tipo   | Obrigatório | Descrição                          |
|----------------|--------|-------------|------------------------------------|
| `id`           | number | Sim         | Id da publicação a editar          |
| `ongId`        | number | Sim         | Id da ONG (deve ser a dona da publicação) |
| `titulo`       | string | Sim         | Título (mín. 5 caracteres)          |
| `conteudo`     | string | Sim         | Conteúdo (mín. 5 caracteres)      |
| `imagemBase64` | string \| null | Não   | Imagem; null mantém ou remove      |
| `dataInicio`   | string | Sim         | Data/hora de início                |
| `dataFim`      | string \| null | Não   | Data/hora de fim                   |

### Response – sucesso

**Status:** `204 No Content`

**Body:** vazio.

### Response – erro

**Status:** `404 Not Found` – publicação não encontrada ou ongId não confere com a publicação.

**Status:** `400` – erros de validação (mesmos do criar).

**Status:** `500` – erro ao salvar.

---

## 6. Ativar ou desativar publicação

Ativa ou desativa uma publicação (sem excluir). A publicação deve pertencer à ONG informada.

### Request

**`PATCH /api/Publicacao/AtivarOuDesativarPublicacao`**

**Headers:** `Content-Type: application/json`

**Body:**

```json
{
  "publicacaoId": 1,
  "ongId": 10,
  "ativo": false
}
```

| Campo          | Tipo    | Obrigatório | Descrição                                    |
|----------------|---------|-------------|----------------------------------------------|
| `publicacaoId` | number  | Sim         | Id da publicação                             |
| `ongId`        | number  | Sim         | Id da ONG (deve ser a dona da publicação)   |
| `ativo`        | boolean | Sim         | `true` = ativar, `false` = desativar         |

### Response – sucesso

**Status:** `204 No Content`

**Body:** vazio.

O cliente pode exibir: *"A Publicação foi ativada"* ou *"A Publicação foi desativada"* conforme o valor de `ativo` enviado.

### Response – erro

**Status:** `404 Not Found` – publicação não encontrada ou ongId não confere.

**Body:** `{ "errors": [ ... ] }`

---

## Observações

- **Datas:** `dataInicio` e `dataFim` devem ser enviadas em formato ISO 8601 (ex.: `2025-02-01T00:00:00` ou com timezone). No criar, `dataFim` é opcional; no editar, pode ser `null`.
- **Validação:** título e conteúdo obrigatórios e com no mínimo 5 caracteres; `ongId` deve ser maior que zero.
- **Imagem:** `imagemBase64` aceita data URL (`data:image/jpeg;base64,...`) ou apenas o conteúdo em base64. Opcional na criação e na edição.
- **Ativo:** publicações desativadas podem continuar no banco e ser reativadas; a listagem pode filtrar apenas as ativas conforme regra de negócio.
