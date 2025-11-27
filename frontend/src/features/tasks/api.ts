// src/features/tasks/api.ts

import { apiUrl } from "../../services/config";

export type Task = {
    id: string;
    conversationId: string;
    title: string;
    dueDate: string;
    status: string;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
};

// Busca tasks de uma conversa específica
export async function fetchTasks(conversationId: string): Promise<Task[]> {
    if (!conversationId) return [];

    const url = apiUrl(
        `/api/tasks?conversationId=${encodeURIComponent(conversationId)}`
    );

    const res = await fetch(url);

    if (!res.ok) {
        console.error("Erro ao buscar tarefas", res.status);
        return [];
    }

    const data = await res.json();
    return data.items ?? [];
}

// Busca TODAS as tasks (sem filtro de conversa)
export async function fetchAllTasks(status?: string): Promise<Task[]> {
    let url = apiUrl("/api/tasks");

    if (status) {
        url += `?status=${encodeURIComponent(status)}`;
    }

    const res = await fetch(url);

    if (!res.ok) {
        console.error("Erro ao buscar todas as tarefas", res.status);
        return [];
    }

    const data = await res.json();
    return data.items ?? [];
}

// Cria uma nova task
export async function createTask(input: {
    conversationId: string;
    title: string;
    dueDate: string;
}): Promise<Task> {
    const url = apiUrl("/api/tasks");

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
    });

    if (!res.ok) {
        throw new Error(`Erro ao criar tarefa: ${res.status}`);
    }

    const data = await res.json();
    return data;
}

// Atualiza uma task (status, title, dueDate)
export async function updateTask(
    taskId: string,
    updates: {
        status?: string;
        title?: string;
        dueDate?: string;
    }
): Promise<Task> {
    const url = apiUrl(`/api/tasks/${encodeURIComponent(taskId)}`);

    const res = await fetch(url, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
    });

    if (!res.ok) {
        throw new Error(`Erro ao atualizar tarefa: ${res.status}`);
    }

    const data = await res.json();
    return data;
}

// Exclui uma task
export async function deleteTask(taskId: string): Promise<void> {
    const url = apiUrl(`/api/tasks/${encodeURIComponent(taskId)}`);

    const res = await fetch(url, {
        method: "DELETE",
    });

    if (!res.ok) {
        throw new Error(`Erro ao excluir tarefa: ${res.status}`);
    }
}