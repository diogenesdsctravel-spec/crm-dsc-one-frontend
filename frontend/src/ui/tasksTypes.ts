export type TasksViewMode = "day" | "week" | "month" | "year";

export type Task = {
    id: string;
    date: string;
    text: string;
    conversationId?: string;
    time?: string;
};

export type Conversation = {
    id: string;
    nome: string;
    ultimaMensagem?: string;
    avatarUrl?: string;
    unreadCount?: number;
    workspace?: string;
};
