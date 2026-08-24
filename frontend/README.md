# Financy — Front-end

Aplicação React que consome a API GraphQL do Financy, seguindo o layout do Figma.

## Stack

| Camada       | Tecnologia                          |
| ------------ | ----------------------------------- |
| Linguagem    | TypeScript                          |
| Bundler      | Vite (sem framework)                |
| UI           | React 19 + React Router 7           |
| GraphQL      | Apollo Client 4                     |
| Estilo       | TailwindCSS 4                       |
| Formulários  | React Hook Form + Zod               |
| Acessibilidade | Radix UI (Dialog e Select)        |
| Ícones       | Lucide                              |

## Como rodar

Suba a API primeiro (veja `../backend/README.md`), depois:

```bash
cd frontend
npm install
cp .env.example .env      # no Windows: copy .env.example .env
npm run dev
```

A aplicação abre em **http://localhost:5173**.

Se você rodou o seed da API, entre com **conta@teste.com** / **financy123**.

### Scripts

| Script              | O que faz                                  |
| ------------------- | ------------------------------------------ |
| `npm run dev`       | Servidor de desenvolvimento                |
| `npm run build`     | Typecheck + build de produção em `dist/`   |
| `npm run preview`   | Serve o build de produção                  |
| `npm run typecheck` | Só a checagem de tipos                     |

## Variáveis de ambiente

| Variável            | Obrigatória | Descrição                                                   |
| ------------------- | ----------- | ----------------------------------------------------------- |
| `VITE_BACKEND_URL`  | ✅          | Endpoint GraphQL da API, ex: `http://localhost:4000/graphql` |

## Páginas

| Rota           | Tela                                                          |
| -------------- | ------------------------------------------------------------- |
| `/`            | **Login** quando deslogado, **Dashboard** quando logado        |
| `/cadastro`    | Criar conta                                                    |
| `/transacoes`  | Lista de transações com filtros e paginação                    |
| `/categorias`  | Grade de categorias                                            |
| `/conta`       | Perfil do usuário e logout                                     |

Mais os dois modais: **Nova transação** e **Nova categoria** (os mesmos servem para edição).

A regra da raiz vem do enunciado: `/` decide entre login e dashboard conforme a sessão.
As demais rotas privadas redirecionam para `/` quando não há sessão — a lógica está
em `src/App.tsx`.

## Design system

Os tokens saíram da aba **Style Guide** do Figma e vivem em `src/styles/globals.css`,
declarados no `@theme` do Tailwind 4:

- **Brand**: `#124B2B` (dark) e `#1F6F43` (base)
- **Grayscale**: `#111827` → `#F8F9FA` (substitui a escala padrão do Tailwind de propósito)
- **Feedback**: danger `#EF4444`, success `#19AD70`
- **Categorias**: 7 matizes × 3 tons (dark / base / light)
- **Tipografia**: Inter

A paleta das categorias fica em `src/lib/categoryTheme.ts`. O banco guarda só o tom `base`;
`paletteFor()` resolve os tons `light` (fundo da tag) e `dark` (texto da tag) na hora de
renderizar — assim as tags ficam legíveis sem precisar salvar três cores por categoria.

Componentes em `src/components/ui/` (Button, Input, Select, Dialog, Tag, Pagination…) são
próprios, montados a partir do style guide. Radix entra só onde acessibilidade dá trabalho
de reproduzir: foco preso no Dialog e navegação por teclado no Select.

> **Sobre o logo**: o símbolo das moedas foi redesenhado em SVG e o wordmark usa
> **Chakra Petch**, a fonte do Google Fonts mais próxima das letras quadradas do Figma
> (o style guide só documenta a Inter). Se você exportar o vetor do frame **Vetores**
> como SVG, dá para trocar e ficar idêntico.

## Autenticação

O token JWT fica no `localStorage` e é injetado em toda requisição pelo `SetContextLink`
do Apollo (`src/lib/apollo.ts`). Um `ErrorLink` observa respostas `UNAUTHENTICATED`: se o
token expirar, a sessão é limpa e o usuário volta para o login.

O `AuthProvider` (`src/hooks/useAuth.tsx`) revalida a sessão guardada com a query `me` e
semeia o cache do Apollo com o usuário devolvido pelo login — evitando um request extra.

## Dados

Todas as queries e mutations ficam em `src/graphql/operations.ts`, com fragments
reaproveitados e os tipos TypeScript ao lado.

Depois de qualquer mutation, as queries `Dashboard`, `Categories` e `Transactions` são
refetchadas (`REFETCHABLE_QUERIES`). É mais simples e menos frágil do que atualizar o
cache na mão em cada operação, e mantém saldo, contadores e totais sempre coerentes.
