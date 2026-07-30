# Supabase — schema e seed

Os arquivos aqui versionam toda a estrutura do banco do Açougue Ribeirão:

- `migrations/0001_schema.sql` — tabelas (categorias, produtos, clientes, ofertas, pedidos, resgates, app_state) com RLS permissivo para o MVP.
- `migrations/0002_seed.sql` — seed expandido: 12 categorias, ~50 produtos (açougue + hortifruti + laticínios + mercearia + bebidas + frios + petiscos), 24 clientes, ~80 pedidos distribuídos por frequência, 4 ofertas, 6 resgates.

## Como aplicar no projeto Supabase

### Opção A — via MCP (recomendado)

Quando o MCP `claude.ai Supabase` estiver disponível na sessão:

1. Confirmar o projeto ativo:
   ```
   mcp__claude_ai_Supabase__list_projects
   ```
2. Aplicar schema:
   ```
   mcp__claude_ai_Supabase__apply_migration
     name: "ribeirao_schema"
     query: <conteúdo de migrations/0001_schema.sql>
   ```
3. Aplicar seed:
   ```
   mcp__claude_ai_Supabase__apply_migration
     name: "ribeirao_seed"
     query: <conteúdo de migrations/0002_seed.sql>
   ```
4. (Opcional) Regenerar os tipos TS:
   ```
   mcp__claude_ai_Supabase__generate_typescript_types
   ```
   e colar o resultado em `src/lib/database.types.ts`.

### Opção B — pelo Dashboard SQL Editor

1. Acessar https://supabase.com/dashboard/project/louyuljshpjrmjhaivyl/sql/new
2. Colar o conteúdo de `0001_schema.sql` → Run.
3. Colar o conteúdo de `0002_seed.sql` → Run.

### Opção C — CLI do Supabase

```bash
supabase db push --db-url "$SUPABASE_DB_URL"
```

## Como resetar

Para voltar tudo ao estado inicial (equivalente ao botão "Reiniciar demonstração"):

- Via MCP: `mcp__claude_ai_Supabase__execute_sql { sql: "select reset_demo()" }`
- Via Dashboard: SQL Editor → `select reset_demo();`

## Variáveis de ambiente do app

Copie `.env.example` para `.env.local` e preencha com as credenciais do projeto:

```
NEXT_PUBLIC_SUPABASE_URL=https://louyuljshpjrmjhaivyl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<sua anon key>
```

No deploy da Vercel, configure as mesmas variáveis em **Project → Settings → Environment Variables**.
