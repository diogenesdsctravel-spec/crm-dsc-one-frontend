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


mock_conversations: List[Dict] = [
    {
        "id": "conv_1",
        "contactId": "contact_1",
        "contactName": "João Silva",
        "lastMessagePreview": "Boa tarde, viu a cotação?",
        "lastMessageAt": "2025-11-19T14:35:00Z",
        "unreadCount": 2,
        "status": "open",
    },
    {
        "id": "conv_2",
        "contactId": "contact_2",
        "contactName": "Maria Souza",
        "lastMessagePreview": "Obrigada, vou ver com meu marido",
        "lastMessageAt": "2025-11-18T10:20:00Z",
        "unreadCount": 0,
        "status": "archived",
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
def list_tasks(conversationId: Optional[str] = None, status: Optional[str] = None):
    if conversationId is None:
        raise HTTPException(status_code=400, detail="conversationId is required")

    items = [t for t in mock_tasks if t["conversationId"] == conversationId]

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

    mock_tasks.append(task)
    return task

