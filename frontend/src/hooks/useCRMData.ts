import { useMemo, useState } from "react";

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

export function useCRMData() {
    const [conversations] = useState<Conversation[]>([
        {
            id: "1",
            nome: "Muilo",
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
            id: "2",
            nome: "Carla Francielle",
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
            avatarUrl: "https://i.pravatar.cc/150?img=4",
            quotes: [],
        },
        {
            id: "5",
            nome: "Cliente 5",
            avatarUrl: "https://i.pravatar.cc/150?img=5",
            quotes: [],
        },
        {
            id: "6",
            nome: "Cliente 6",
            avatarUrl: "https://i.pravatar.cc/150?img=6",
            quotes: [],
        },
        {
            id: "7",
            nome: "Cliente 7",
            avatarUrl: "https://i.pravatar.cc/150?img=7",
            quotes: [],
        },
        {
            id: "8",
            nome: "Cliente 8",
            avatarUrl: "https://i.pravatar.cc/150?img=8",
            quotes: [],
        },
        {
            id: "9",
            nome: "Cliente 9",
            avatarUrl: "https://i.pravatar.cc/150?img=9",
            quotes: [],
        },
        {
            id: "10",
            nome: "Cliente 10",
            avatarUrl: "https://i.pravatar.cc/150?img=10",
            quotes: [],
        },
    ]);

    const [selectedConversationId, setSelectedConversationId] = useState("1");

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

    const [allMessages, setAllMessages] = useState<Message[]>([
        {
            id: "m1",
            convId: "1",
            from: "cliente",
            body: "Oi, tudo bem? Queria ver Orlando 2025.",
            time: "09:12",
        },
        {
            id: "m2",
            convId: "1",
            from: "agencia",
            body: "Claro! Me fala as datas certinhas 🙌",
            time: "09:13",
        },
        {
            id: "m3",
            convId: "2",
            from: "cliente",
            body: "Carla aqui, quero ir pra Buenos Aires.",
            time: "10:01",
        },
    ]);

    const [composer, setComposer] = useState("");

    const messages = useMemo(
        () => allMessages.filter((m) => m.convId === selectedConversationId),
        [allMessages, selectedConversationId]
    );

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

        setAllMessages((prev) => [
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
