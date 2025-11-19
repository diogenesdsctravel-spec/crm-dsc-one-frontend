Domain – CRM DSC ONE

# 1. Entidades principais (resumo)
User – vendedor que usa o sistema para atender clientes e gerenciar conversas.
Contact – pessoa cliente final, com dados pessoais básicos (nome, telefone, e-mail opcional).
Conversation – canal de conversa entre um Contact e a empresa (ex: chat de WhatsApp).
Message – cada mensagem enviada ou recebida dentro de uma Conversation.
Lead – oportunidade comercial ligada a um Contact (e opcionalmente a uma Conversation).
Task – compromisso/ação ligada a uma Conversation ou Lead (ex: cobrar cliente amanhã).

# 2. Campos principais por entidade

## User
id
nome
email
ativo
criadoEm
atualizadoEm

## Contact
id
nome
telefone
email (opcional)
tags (opcional)
criadoEm
atualizadoEm

## Conversation
id
contactId
canal (ex: whatsapp)
status (aberto, fechado, arquivado)
lastMessagePreview
lastMessageAt
criadoEm
atualizadoEm

## Message
id
conversationId
authorType (user | contact | sistema)
body
type (texto | audio | arquivo)
sentAt

## Lead
id
contactId
conversationId (opcional)
status (aberto | ganho | perdido)
origem
valor (opcional)
criadoEm
atualizadoEm

## Task
id
conversationId (ou leadId — decisão futura)
title
dueDate
status (pendente | concluída)
createdBy (userId)
criadoEm

# 3. Relacionamentos

Contact 1:N Conversation
Uma pessoa (Contact) pode gerar várias conversas ao longo do tempo — por exemplo, uma conversa em janeiro e outra em maio. Cada conversa sempre pertence a um único Contact.

Conversation 1:N Message
Cada conversa contém várias mensagens enviadas e recebidas. Uma mensagem sempre pertence a uma única Conversation.

Contact 1:N Lead
Um contato pode gerar várias oportunidades comerciais (Leads). Por exemplo: cotação de Orlando e, meses depois, cotação de Santiago.

Conversation 1:N Task
Uma conversa pode ter várias tarefas associadas (ex: “cobrar cliente amanhã”). A tarefa pertence sempre à conversa que a originou, mesmo que depois exista um Lead.

User 1:N Task
Um usuário (vendedor) pode criar várias tarefas. Cada tarefa é sempre atribuída a um único User.

# 4. Fluxo natural do domínio (descrição em 3–5 linhas)

Um Contact pode abrir várias Conversations ao longo do tempo. Cada Conversation é composta por várias Messages enviadas por cliente, vendedor ou sistema. O Contact também pode ter Leads vinculados, representando oportunidades comerciais. Tasks ficam ligadas à Conversation e são criadas por um User para lembrar ações futuras, como cobrar uma resposta ou enviar um orçamento. Esse fluxo garante que tudo nasce da conversa e permanece organizado ao redor dela.
