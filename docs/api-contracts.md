# Contratos de API – CRM DSC ONE

Base da API: `/api`

A API é usada pelo frontend para alimentar:
- Inbox (lista de conversas)
- Chat (mensagens)
- Painel do cliente (dados do contato)
- Tarefas ligadas à conversa/lead

---

## 1. GET /api/conversations

Lista de conversas para a Inbox.

### Query params

- `status` (opcional): `open` | `archived`
- `page` (opcional): número da página, padrão 1
- `pageSize` (opcional): itens por página, padrão 20

### Exemplo de resposta (200)

```json
{
  "items": [
    {
      "id": "conv_123",
      "contactId": "contact_1",
      "contactName": "João Silva",
      "lastMessagePreview": "Boa tarde, viu a cotação?",
      "lastMessageAt": "2025-11-19T14:35:00Z",
      "unreadCount": 2,
      "status": "open"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 1
}

