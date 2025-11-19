Architecture – CRM DSC ONE

Visão geral da arquitetura

Frontend
– Aplicação web em React + Vite + TypeScript.
– Roda no navegador do usuário.
– Consome apenas uma API HTTP/HTTPS.

Backend
– API em Python usando FastAPI.
– Servidor de aplicação: Uvicorn (com Gunicorn em produção).
– Responsável por regras de negócio, autenticação e acesso ao banco.

Banco de dados
– PostgreSQL gerenciado pelo Supabase.
– O Supabase fornece:
  – instância Postgres gerenciada
  – painel para inspeção de dados
  – autenticação e storage opcionais (não usados no MVP por enquanto).

Diagrama textual simples

Navegador (CRM DSC ONE – React) 
  → faz chamadas HTTP/HTTPS para 
Backend API (FastAPI em Python)
  → que lê/escreve dados em 
Banco de dados (PostgreSQL no Supabase).

Fluxo de dados

1. O usuário acessa a SPA do CRM DSC ONE no navegador.
2. A SPA chama a API FastAPI para buscar conversas, mensagens, contatos, leads e tasks.
3. A API valida a requisição, aplica regras de negócio e consulta o PostgreSQL hospedado no Supabase.
4. O backend retorna respostas JSON para o frontend.
5. O frontend atualiza a interface (Inbox, Chat, Painéis, Dock) com base nesses dados.

Layout do repositório (decisão oficial)

crm-dsc-one/
  docs/        → documentação (vision, domain, schema, architecture etc.)
  frontend/    → código do cliente (React + Vite + TypeScript)
  backend/     → código da API (FastAPI + Python)
  infra/       → scripts e arquivos de infraestrutura e deploy (futuro)

Status

– Stack oficial de backend: Python + FastAPI.
– Banco oficial: PostgreSQL no Supabase.
– Toda nova funcionalidade deve respeitar esse fluxo: Frontend → API → Supabase Postgres.
