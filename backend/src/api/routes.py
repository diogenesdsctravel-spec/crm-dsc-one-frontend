from datetime import datetime
from typing import Optional, List, Dict

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from uuid import uuid4

router = APIRouter(prefix="/api", tags=["api"])


class TaskCreate(BaseModel):
    conversationId: str
    title: str
    dueDate: datetime
    time: Optional[str] = None  # ← ADICIONADO


class TaskUpdate(BaseModel):
    status: Optional[str] = None
    title: Optional[str] = None
    dueDate: Optional[datetime] = None
    time: Optional[str] = None  # ← ADICIONADO


mock_conversations: List[Dict] = [
    {
        "id": "conv_1",
        "contactId": "contact_1",
        "contactName": "João Silva",
        "lastMessagePreview": "Boa tarde, viu a cotação?",
        "lastMessageAt": "2025-11-19T14:35:00Z",
        "unreadCount": 2,
        "status": "open",
        "workspace": "inbox",
    },
    {
        "id": "conv_2",
        "contactId": "contact_2",
        "contactName": "Maria Souza",
        "lastMessagePreview": "Obrigada, vou ver com meu marido",
        "lastMessageAt": "2025-11-18T10:20:00Z",
        "unreadCount": 0,
        "status": "archived",
        "workspace": "fantasma",
    },
]

mock_messages: Dict[str, List[Dict]] = {
    "conv_1": [
        {
            "id": "msg_1",
            "authorType": "contact",
            "body": "Oi, tudo bem?",
            "type": "text",
            "sentAt": "2025-11-19T14:00:00Z",
        },
        {
            "id": "msg_2",
            "authorType": "user",
            "body": "Tudo ótimo! Me fala as datas da viagem 🙂",
            "type": "text",
            "sentAt": "2025-11-19T14:01:00Z",
        },
    ],
    "conv_2": [
        {
            "id": "msg_3",
            "authorType": "contact",
            "body": "Recebi a cotação, obrigada!",
            "type": "text",
            "sentAt": "2025-11-18T10:15:00Z",
        }
    ],
}

mock_contacts: Dict[str, Dict] = {
    "contact_1": {
        "id": "contact_1",
        "name": "João Silva",
        "phone": "+55 71 99999-0000",
        "email": "joao@email.com",
        "tags": ["whatsapp", "brasil"],
        "createdAt": "2025-11-01T10:00:00Z",
        "updatedAt": "2025-11-10T09:30:00Z",
    },
    "contact_2": {
        "id": "contact_2",
        "name": "Maria Souza",
        "phone": "+55 11 98888-0000",
        "email": "maria@email.com",
        "tags": ["instagram"],
        "createdAt": "2025-11-05T11:00:00Z",
        "updatedAt": "2025-11-12T15:20:00Z",
    },
}

mock_tasks: List[Dict] = [
    {
        "id": "task_1",
        "conversationId": "conv_1",
        "title": "Cobrar resposta da cotação Buenos Aires",
        "dueDate": "2025-11-20T15:00:00Z",
        "time": "15:00",  # ← ADICIONADO (exemplo)
        "status": "pending",
        "createdBy": "user_1",
        "createdAt": "2025-11-19T14:10:00Z",
    }
]


@router.get("/conversations")
def list_conversations(
    status: Optional[str] = Query(default=None),
    page: int = 1,
    pageSize: int = 20,
):
    items = mock_conversations

    if status is not None:
        items = [c for c in items if c["status"] == status]

    total = len(items)
    start = (page - 1) * pageSize
    end = start + pageSize
    page_items = items[start:end]

    return {
        "items": page_items,
        "page": page,
        "pageSize": pageSize,
        "total": total,
    }


@router.get("/conversations/{conversation_id}/messages")
def list_messages(conversation_id: str, limit: int = 50):
    if conversation_id not in mock_messages:
        raise HTTPException(status_code=404, detail="Conversation not found")

    items = mock_messages[conversation_id][:limit]
    return {
        "conversationId": conversation_id,
        "items": items,
    }


@router.get("/contacts/{contact_id}")
def get_contact(contact_id: str):
    contact = mock_contacts.get(contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact


@router.get("/tasks")
def list_tasks(
    conversationId: Optional[str] = None,
    status: Optional[str] = None
):
    items = mock_tasks

    # Filtro por conversationId (agora opcional)
    if conversationId is not None:
        items = [t for t in items if t["conversationId"] == conversationId]

    # Filtro por status
    if status is not None:
        items = [t for t in items if t["status"] == status]

    return {"items": items}


@router.post("/tasks", status_code=201)
def create_task(payload: TaskCreate):
    task_id = f"task_{uuid4().hex[:8]}"

    task = {
        "id": task_id,
        "conversationId": payload.conversationId,
        "title": payload.title,
        "dueDate": payload.dueDate.isoformat(),
        "status": "pending",
        "createdBy": "user_1",
        "createdAt": datetime.utcnow().isoformat() + "Z",
    }

    # ← ADICIONADO: salvar time se fornecido
    if payload.time:
        task["time"] = payload.time

    mock_tasks.append(task)
    return task


@router.patch("/tasks/{task_id}")
def update_task(task_id: str, payload: TaskUpdate):
    # Encontra a task pelo ID
    task = None
    for t in mock_tasks:
        if t["id"] == task_id:
            task = t
            break

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Atualiza apenas os campos enviados
    if payload.status is not None:
        task["status"] = payload.status

    if payload.title is not None:
        task["title"] = payload.title

    if payload.dueDate is not None:
        task["dueDate"] = payload.dueDate.isoformat()

    # ← ADICIONADO: atualizar time se fornecido
    if payload.time is not None:
        task["time"] = payload.time

    task["updatedAt"] = datetime.utcnow().isoformat() + "Z"

    return task


@router.delete("/tasks/{task_id}", status_code=204)
def delete_task(task_id: str):
    # Encontra o índice da task
    task_index = None
    for i, t in enumerate(mock_tasks):
        if t["id"] == task_id:
            task_index = i
            break

    if task_index is None:
        raise HTTPException(status_code=404, detail="Task not found")

    # Remove a task
    mock_tasks.pop(task_index)

    return None