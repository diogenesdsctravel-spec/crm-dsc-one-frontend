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

const WORKSPACE_STORAGE_KEY = "dsc_one_workspace_overrides";

type WorkspaceOverrideMap = Record<string, Conversation["workspace"]>;

function loadWorkspaceOverrides(): WorkspaceOverrideMap {
    if (typeof window === "undefined") {
        return {} as WorkspaceOverrideMap;
    }

    try {
        const raw = window.localStorage.getItem(WORKSPACE_STORAGE_KEY);
        if (!raw) return {} as WorkspaceOverrideMap;

        const parsed = JSON.parse(raw) as WorkspaceOverrideMap;
        return parsed || ({} as WorkspaceOverrideMap);
    } catch (error) {
        console.warn("[WorkspacePersist] erro ao carregar overrides", error);
        return {} as WorkspaceOverrideMap;
    }
}

function saveWorkspaceOverrides(overrides: WorkspaceOverrideMap) {
    if (typeof window === "undefined") return;

    try {
        window.localStorage.setItem(
            WORKSPACE_STORAGE_KEY,
            JSON.stringify(overrides)
        );
        console.log("[WorkspacePersist] overrides salvos", overrides);
    } catch (error) {
        console.warn("[WorkspacePersist] erro ao salvar overrides", error);
    }
}

export function useCRMData() {
    const [conversations, setConversations] =
        useState<Conversation[]>(INITIAL_CONVERSATIONS);

    useEffect(() => {
        let cancelled = false;

        async function loadConversationsFromApi() {
            try {
                const data = await fetchConversations();
                if (cancelled) return;

                console.log("[useCRMData] conversas da API:", data.items);

                const overrides = loadWorkspaceOverrides();

                const mockById = new Map(
                    INITIAL_CONVERSATIONS.map((c) => [c.id, c] as const)
                );

                const merged: Conversation[] = data.items.map((item: any) => {
                    const base = mockById.get(item.id);
                    const overrideWorkspace = overrides[item.id];

                    return {
                        id: item.id,
                        nome: item.contactName || base?.nome || "Sem nome",
                        workspace:
                            overrideWorkspace ??
                            (item.workspace as Conversation["workspace"]) ??
                            base?.workspace ??
                            "inbox",
                        unreadCount:
                            item.unreadCount ?? base?.unreadCount ?? 0,
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
                console.error("[useCRMData] erro ao buscar conversas da API", err);
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
        const firstQuote =
            firstConv && firstConv.quotes && firstConv.quotes[0];
        return firstQuote ? firstQuote.id : null;
    });

    const selectedConversation = useMemo(
        () =>
            conversations.find((c) => c.id === selectedConversationId) ||
            conversations[0],
        [conversations, selectedConversationId]
    );

    const currentQuotes = useMemo(
        () => (selectedConversation?.quotes ?? []),
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
                const apiMessages = await fetchMessages(
                    selectedConversationId
                );
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
            conv && conv.quotes && conv.quotes.length > 0
                ? conv.quotes[0]
                : null;
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

    function moveConversationWorkspace(
        conversationId: string,
        targetWorkspace: "inbox" | "fantasma"
    ) {
        console.log("[WorkspacePersist] moveConversationWorkspace", {
            conversationId,
            targetWorkspace,
        });

        setConversations((prev) => {
            const updated = prev.map((c) =>
                c.id === conversationId
                    ? {
                        ...c,
                        workspace: targetWorkspace,
                    }
                    : c
            );

            const overrides = loadWorkspaceOverrides();
            saveWorkspaceOverrides({
                ...overrides,
                [conversationId]: targetWorkspace,
            });

            return updated;
        });
    }

    // ============================================================
    //   NOVAS FUNÇÕES BIG TECH — AUTOSAVE + HISTÓRICO + REVIVER
    // ============================================================

    function updateCurrentQuote(field: keyof Quote, value: any) {
        setConversations((prev) =>
            prev.map((c) => {
                if (c.id !== selectedConversationId) return c;

                const updatedQuotes = c.quotes.map((q) =>
                    q.id === selectedQuoteId ? { ...q, [field]: value } : q
                );

                return { ...c, quotes: updatedQuotes };
            })
        );
    }

    function createNewQuote() {
        const newQuote: Quote = {
            id: "q-" + Date.now(),
            titulo: "Nova cotação",
            origem: "",
            destino: "",
            produtos: "",
            valorCentavos: 0,
            adultos: 0,
            criancas: 0,
        };

        setConversations((prev) =>
            prev.map((c) =>
                c.id === selectedConversationId
                    ? { ...c, quotes: [...c.quotes, newQuote] }
                    : c
            )
        );

        setSelectedQuoteId(newQuote.id);
    }

    function finalizeCurrentQuote(status: "GANHO" | "PERDA") {
        // Regra suprema: sempre fantasma
        moveConversationWorkspace(selectedConversationId, "fantasma");

        // Apenas registra o ganho/perda dentro da quote
        if (selectedQuoteId) {
            updateCurrentQuote("titulo", status === "GANHO" ? "Ganho" : "Perda");
        }
    }

    function reviveConversation(conversationId: string) {
        moveConversationWorkspace(conversationId, "inbox");

        // cria cotação nova ao reviver
        if (conversationId === selectedConversationId) {
            createNewQuote();
        }
    }

    // ==========================
    // RETORNO DO HOOK
    // ==========================

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

        moveConversationWorkspace,

        updateCurrentQuote,
        createNewQuote,
        finalizeCurrentQuote,
        reviveConversation,
    };
}
