import { useEffect, useMemo, useState } from "react";
import { fetchMessages } from "../features/messages/api";
import { fetchConversations } from "../features/conversations/api";

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

export type Conversation = {
    id: string;
    nome: string;
    workspace: "inbox" | "fantasma";
    unreadCount?: number;
    titulo?: string;
    origem?: string;
    destino?: string;
    checkin?: string;
    checkout?: string;
    adultos?: number;
    criancas?: number;
    produtos?: string;
    valorCentavos?: number;
    avatarUrl?: string;
    phone?: string;
    channelLabel?: string;
    quotes: Quote[];
};

export type Message = {
    id: string;
    convId: string;
    from: "cliente" | "agencia";
    body: string;
    time?: string;
};

const INITIAL_CONVERSATIONS: Conversation[] = [
    {
        id: "conv_1",
        nome: "João Silva",
        workspace: "inbox",
        titulo: "Orlando 2025",
        origem: "Salvador, Brasil",
        destino: "Orlando, EUA",
        checkin: "2025-07-10",
        checkout: "2025-07-20",
        adultos: 2,
        criancas: 1,
        produtos: "Pacote completo",
        valorCentavos: 128900,
        avatarUrl: "https://i.pravatar.cc/150?img=1",
        phone: "+55 11 99999-0000",
        channelLabel: "via WhatsApp",
        quotes: [
            {
                id: "q1-1",
                titulo: "Orlando 2025",
                origem: "Salvador, Brasil",
                destino: "Orlando, EUA",
                checkin: "2025-07-10",
                checkout: "2025-07-20",
                adultos: 2,
                criancas: 1,
                produtos: "Pacote completo",
                valorCentavos: 128900,
            },
            {
                id: "q1-2",
                titulo: "Nova York 2026",
                origem: "Salvador, Brasil",
                destino: "Nova York, EUA",
                produtos: "Aéreo + hotel",
                valorCentavos: 159900,
            },
        ],
    },
    {
        id: "conv_2",
        nome: "Maria Souza",
        workspace: "inbox",
        titulo: "Viagem a Buenos Aires",
        origem: "Salvador, Brasil",
        destino: "Buenos Aires, Argentina",
        produtos: "Aéreo + hotel",
        valorCentavos: 78900,
        avatarUrl: "https://i.pravatar.cc/150?img=2",
        phone: "+55 71 98888-0001",
        channelLabel: "via WhatsApp",
        quotes: [
            {
                id: "q2-1",
                titulo: "Buenos Aires 2025",
                origem: "Salvador, Brasil",
                destino: "Buenos Aires, Argentina",
                produtos: "Aéreo + hotel",
                valorCentavos: 78900,
            },
        ],
    },
    {
        id: "3",
        nome: "Gileade",
        workspace: "inbox",
        titulo: "Férias em Gramado",
        origem: "Salvador, Brasil",
        destino: "Gramado, Brasil",
        produtos: "Pacote terrestre",
        valorCentavos: 45900,
        avatarUrl: "https://i.pravatar.cc/150?img=3",
        phone: "+55 21 97777-0002",
        channelLabel: "via WhatsApp",
        quotes: [
            {
                id: "q3-1",
                titulo: "Gramado 2025",
                origem: "Salvador, Brasil",
                destino: "Gramado, Brasil",
                produtos: "Pacote terrestre",
                valorCentavos: 45900,
            },
        ],
    },
    {
        id: "4",
        nome: "Cliente 4",
        workspace: "fantasma",
        avatarUrl: "https://i.pravatar.cc/150?img=4",
        quotes: [],
    },
    {
        id: "5",
        nome: "Cliente 5",
        workspace: "fantasma",
        avatarUrl: "https://i.pravatar.cc/150?img=5",
        quotes: [],
    },
    {
        id: "6",
        nome: "Cliente 6",
        workspace: "fantasma",
        avatarUrl: "https://i.pravatar.cc/150?img=6",
        quotes: [],
    },
    {
        id: "7",
        nome: "Cliente 7",
        workspace: "fantasma",
        avatarUrl: "https://i.pravatar.cc/150?img=7",
        quotes: [],
    },
    {
        id: "8",
        nome: "Cliente 8",
        workspace: "fantasma",
        avatarUrl: "https://i.pravatar.cc/150?img=8",
        quotes: [],
    },
    {
        id: "9",
        nome: "Cliente 9",
        workspace: "fantasma",
        avatarUrl: "https://i.pravatar.cc/150?img=9",
        quotes: [],
    },
    {
        id: "10",
        nome: "Cliente 10",
        workspace: "fantasma",
        avatarUrl: "https://i.pravatar.cc/150?img=10",
        quotes: [],
    },
];

export function useCRMData() {
    const [conversations, setConversations] =
        useState<Conversation[]>(INITIAL_CONVERSATIONS);

    useEffect(() => {
        let cancelled = false;

        async function loadConversationsFromApi() {
            try {
                const data = await fetchConversations("open");
                if (cancelled) return;

                console.log("[useCRMData] conversas da API:", data.items);

                const mockById = new Map(
                    INITIAL_CONVERSATIONS.map((c) => [c.id, c] as const)
                );

                const merged: Conversation[] = data.items.map((item) => {
                    const base = mockById.get(item.id);

                    return {
                        id: item.id,
                        nome: item.contactName,
                        workspace: (item as any).workspace ?? base?.workspace ?? "inbox",
                        unreadCount:
                            (item as any).unreadCount ?? base?.unreadCount ?? 0,
                        avatarUrl: base?.avatarUrl,
                        phone: base?.phone,
                        channelLabel: base?.channelLabel ?? "via WhatsApp",
                        titulo: base?.titulo,
                        origem: base?.origem,
                        destino: base?.destino,
                        checkin: base?.checkin,
                        checkout: base?.checkout,
                        adultos: base?.adultos,
                        criancas: base?.criancas,
                        produtos: base?.produtos,
                        valorCentavos: base?.valorCentavos,
                        quotes: base?.quotes ?? [],
                    };
                });

                setConversations(merged);
            } catch (err) {
                if (cancelled) return;
                console.error(
                    "[useCRMData] erro ao buscar conversas da API",
                    err
                );
            }
        }

        loadConversationsFromApi();

        return () => {
            cancelled = true;
        };
    }, []);

    const [selectedConversationId, setSelectedConversationId] =
        useState("conv_1");

    const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(() => {
        const firstConv = conversations[0];
        const firstQuote = firstConv && firstConv.quotes && firstConv.quotes[0];
        return firstQuote ? firstQuote.id : null;
    });

    const selectedConversation = useMemo(
        () =>
            conversations.find((c) => c.id === selectedConversationId) ||
            conversations[0],
        [conversations, selectedConversationId]
    );

    const currentQuotes = useMemo(
        () => (selectedConversation && selectedConversation.quotes) || [],
        [selectedConversation]
    );

    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        if (!selectedConversationId) {
            setMessages([]);
            return;
        }

        let cancelled = false;

        async function loadMessages() {
            try {
                const apiMessages = await fetchMessages(selectedConversationId);
                if (cancelled) return;

                const mapped: Message[] = apiMessages.map((m) => ({
                    id: m.id,
                    convId: selectedConversationId,
                    from: m.from === "client" ? "cliente" : "agencia",
                    body: m.body,
                    time: m.time,
                }));

                setMessages(mapped);
            } catch (err) {
                if (cancelled) return;
                console.error("Erro ao buscar mensagens", err);
                setMessages([]);
            }
        }

        loadMessages();

        return () => {
            cancelled = true;
        };
    }, [selectedConversationId]);

    const [composer, setComposer] = useState("");

    function selectConversation(id: string) {
        setSelectedConversationId(id);
        const conv = conversations.find((c) => c.id === id);
        const firstQuote =
            conv && conv.quotes && conv.quotes.length > 0 ? conv.quotes[0] : null;
        setSelectedQuoteId(firstQuote ? firstQuote.id : null);
    }

    function sendMessage(body: string) {
        const text = body.trim();
        if (!text) return;

        const now = new Date();
        const time = now.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
        });

        setMessages((prev) => [
            ...prev,
            {
                id: String(Date.now()),
                convId: selectedConversationId,
                from: "agencia",
                body: text,
                time,
            },
        ]);
    }

    return {
        conversations,
        selectedConversationId,
        selectConversation,
        selectedConversation,
        messages,
        composer,
        setComposer,
        sendMessage,
        currentQuotes,
        selectedQuoteId,
        setSelectedQuoteId,
    };
}
