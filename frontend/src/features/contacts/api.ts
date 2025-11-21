// src/features/contacts/api.ts

import { apiUrl } from "../../services/config";

export type Contact = {
    id: string;
    name: string;
    phone?: string;
    avatarUrl?: string;
    channelLabel?: string;
};

type BackendContact = {
    id?: string;
    nome?: string;
    name?: string;
    telefone?: string;
    phone?: string;
    avatarUrl?: string;
    avatar_url?: string;
    channelLabel?: string;
    channel_label?: string;
};

export async function fetchContact(id: string): Promise<Contact | null> {
    const url = apiUrl(`/api/contacts/${encodeURIComponent(id)}`);

    try {
        const res = await fetch(url);

        if (!res.ok) {
            console.warn(`fetchContact: status ${res.status} em ${url}`);
            return null;
        }

        const data = (await res.json()) as BackendContact;

        return {
            id: data.id ?? id,
            name: data.name ?? data.nome ?? "Contato",
            phone: data.phone ?? data.telefone,
            avatarUrl: data.avatarUrl ?? data.avatar_url,
            channelLabel: data.channelLabel ?? data.channel_label,
        };
    } catch (err) {
        console.error("fetchContact: erro ao buscar contato", err);
        return null;
    }
}
