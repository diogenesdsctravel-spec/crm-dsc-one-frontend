// src/types/index.ts
export type Conversation = {
    id: string;
    nome: string;
    avatarUrl?: string;
    phone?: string;
    channelLabel?: string;
    ultimaMensagem?: string;
};

export type Message = {
    id: string;
    convId: string;
    from: "cliente" | "agencia";
    body: string;
    time?: string;
};

export type Quote = {
    id: string;
    titulo: string;
    origem?: string;
    destino?: string;
    checkin?: string;
    checkout?: string;
    adultos?: number;
    criancas?: number;
    produtos?: string;
    valorCentavos?: number;
};
