// src/features/tasks/api.ts

export type Task = {
    id: string;
    conversationId: string;
    title: string;
    dueDate: string;
    status: string;
    createdBy?: string;
    createdAt?: string;
};

export async function fetchTasks(conversationId: string): Promise<Task[]> {
    if (!conversationId) return [];

    const res = await fetch(
        `/api/tasks?conversationId=${encodeURIComponent(conversationId)}`
    );

    if (!res.ok) {
        console.error("Erro ao buscar tarefas", res.status);
        return [];
    }

    const data = await res.json();
    return data.items ?? [];
}

export async function createTask(input: {
    conversationId: string;
    title: string;
    dueDate: string;
}): Promise<Task> {
    const res = await fetch("/api/tasks", {
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
