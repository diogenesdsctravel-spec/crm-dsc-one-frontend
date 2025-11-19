Schema sketch – CRM DSC ONE

Tabela: users
- Chave primária (PK): id
- Colunas principais:
  - id
  - nome
  - email
  - ativo
  - criado_em
  - atualizado_em
- Chaves estrangeiras (FKs):
  - nenhuma
- Índices recomendados:
  - índice único em email
  - índice simples em ativo

Tabela: contacts
- Chave primária (PK): id
- Colunas principais:
  - id
  - nome
  - telefone
  - email (opcional)
  - tags (opcional)
  - criado_em
  - atualizado_em
- Chaves estrangeiras (FKs):
  - nenhuma
- Índices recomendados:
  - índice em telefone
  - índice em email
  - índice em tags (num futuro, por exemplo GIN, se virar jsonb)

Tabela: conversations
- Chave primária (PK): id
- Colunas principais:
  - id
  - contact_id
  - canal
  - status (aberto, fechado, arquivado)
  - last_message_preview
  - last_message_at
  - criado_em
  - atualizado_em
- Chaves estrangeiras (FKs):
  - contact_id → contacts.id
- Índices recomendados:
  - índice em contact_id
  - índice composto em (status, last_message_at)
  - índice em last_message_at para ordenação por data

Tabela: messages
- Chave primária (PK): id
- Colunas principais:
  - id
  - conversation_id
  - author_type (user, contact, sistema)
  - body
  - type (texto, audio, arquivo)
  - sent_at
- Chaves estrangeiras (FKs):
  - conversation_id → conversations.id
- Índices recomendados:
  - índice composto em (conversation_id, sent_at)
  - índice em sent_at (consultas por período, se necessário)

Tabela: leads
- Chave primária (PK): id
- Colunas principais:
  - id
  - contact_id
  - conversation_id (opcional)
  - status (aberto, ganho, perdido)
  - origem (ex: whatsapp)
  - valor (opcional)
  - criado_em
  - atualizado_em
- Chaves estrangeiras (FKs):
  - contact_id → contacts.id
  - conversation_id → conversations.id (opcional)
- Índices recomendados:
  - índice em contact_id
  - índice em status
  - índice em criado_em

Tabela: tasks
- Chave primária (PK): id
- Colunas principais:
  - id
  - conversation_id (ou lead_id, conforme decisão final)
  - lead_id (opcional, se quisermos ligar ao lead diretamente)
  - title
  - due_date
  - status (pendente, concluída)
  - created_by (user_id)
  - criado_em
- Chaves estrangeiras (FKs):
  - conversation_id → conversations.id (se usada)
  - lead_id → leads.id (se usada)
  - created_by → users.id
- Índices recomendados:
  - índice em conversation_id
  - índice em lead_id
  - índice em due_date
  - índice em status
  - índice em created_by

