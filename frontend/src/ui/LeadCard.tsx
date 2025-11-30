// src/ui/LeadCard.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useRef, useState } from "react";

export type FunilStatus =
    | "QUALIFICACAO"
    | "PROPOSTA_ENVIADA"
    | "EM_FECHAMENTO"
    | "GANHO"
    | "PERDA";

interface LeadCardProps {
    leads: any[];
    selectedLeadId: string | null;
    onSelectLead: (id: string) => void;

    // novo: contexto de uso do LeadCard
    // inbox => sempre começa em "Nova cotação" limpa
    // fantasma => começa mostrando a última cotação (histórico)
    mode?: "inbox" | "fantasma";

    // novo: chamado quando o vendedor finaliza (GANHO / PERDA)
    onFinalizeLead?: (status: FunilStatus) => void;

    // já existia no App, deixamos opcional para compatibilidade
    clientName?: string;
}

const statusLabel: Record<FunilStatus, string> = {
    QUALIFICACAO: "Qualificação",
    PROPOSTA_ENVIADA: "Proposta enviada",
    EM_FECHAMENTO: "Em fechamento",
    GANHO: "Ganho",
    PERDA: "Perda",
};

const statusGradient: Record<FunilStatus, string> = {
    QUALIFICACAO:
        "linear-gradient(90deg, rgba(37,99,235,0.15), rgba(37,99,235,0.7))",
    PROPOSTA_ENVIADA:
        "linear-gradient(90deg, rgba(245,158,11,0.15), rgba(245,158,11,0.7))",
    EM_FECHAMENTO:
        "linear-gradient(90deg, rgba(124,58,237,0.15), rgba(124,58,237,0.7))",
    GANHO:
        "linear-gradient(90deg, rgba(16,185,129,0.15), rgba(16,185,129,0.7))",
    PERDA:
        "linear-gradient(90deg, rgba(239,68,68,0.15), rgba(239,68,68,0.7))",
};

const perdaMotivos = [
    { value: "sem_perfil", label: "Sem perfil" },
    { value: "falta_retorno_agencia", label: "Falta de retorno da agência" },
    { value: "sem_resposta", label: "Sem resposta do cliente" },
    { value: "concorrencia", label: "Concorrência" },
];

const PRODUTOS_OPCOES = [
    "Aéreo",
    "Hotel",
    "Resort",
    "Transfer",
    "Seguro Viagem",
    "Aluguel de Veículo",
    "Passeios",
    "Ingressos em Orlando",
    "Passagem Rodoviária",
];

const RESORTS_OPCOES = [
    "Canabrava Resorts",
    "Transamérica Ilha de Comandatuba",
    "Coroa Vermelha",
    "Náutico Mar",
    "Resort Jardim Atlântico",
    "Tororomba Resort",
    "Iberostar Waves Bahia",
    "Iberostar Selection",
    "Sauípe",
    "Grand Palladium",
    "La Torre",
    "Arraial Eco Resort",
];

function normalizarTexto(valor: string): string {
    return valor.trim();
}

function parseLista(valor: string): string[] {
    if (!valor) return [];
    return valor
        .split(/[;,]/)
        .map((p) => normalizarTexto(p))
        .filter(Boolean);
}

function extrairTermoBusca(valor: string): string {
    const partes = valor.split(/[;,]/);
    const ultimo = partes[partes.length - 1] || "";
    return ultimo.trim();
}

export default function LeadCard({
    leads,
    selectedLeadId,
    onSelectLead,
    mode = "inbox",
    onFinalizeLead,
}: LeadCardProps) {
    const [lastViewedLeadId, setLastViewedLeadId] = useState<string | null>(null);
    const effectiveSelectedId = selectedLeadId ?? lastViewedLeadId;

    const lead = useMemo(
        () =>
            leads.find((l) => l.id === effectiveSelectedId) ||
            leads[leads.length - 1] ||
            leads[0],
        [leads, effectiveSelectedId]
    );

    const [status, setStatus] = useState<FunilStatus>("QUALIFICACAO");
    const [motivoPerda, setMotivoPerda] = useState<string>("");

    const initialChildren = lead?.criancas ?? 0;
    const [childrenCount, setChildrenCount] = useState<number>(initialChildren);
    const [childrenAges, setChildrenAges] = useState<number[]>(() =>
        Array.from({ length: initialChildren }, () => 0)
    );

    const [produtoInputValue, setProdutoInputValue] = useState<string>("");
    const [produtoFocused, setProdutoFocused] = useState(false);
    const produtoInputRef = useRef<HTMLInputElement | null>(null);

    const [resortInputValue, setResortInputValue] = useState<string>("");
    const [resortFocused, setResortFocused] = useState(false);
    const resortInputRef = useRef<HTMLInputElement | null>(null);

    // novo: controla se estamos na aba "+ Nova cotação"
    const [isNovaCotacao, setIsNovaCotacao] = useState(mode === "inbox");

    useEffect(() => {
        if (selectedLeadId) {
            setLastViewedLeadId(selectedLeadId);
        }
    }, [selectedLeadId]);

    // quando muda o lead ou o modo (inbox/fantasma), resetamos campos básicos
    useEffect(() => {
        setIsNovaCotacao(mode === "inbox");
        setProdutoInputValue("");
        setResortInputValue("");
        setStatus("QUALIFICACAO");
        setMotivoPerda("");
        const criancasBase = lead?.criancas ?? 0;
        setChildrenCount(criancasBase);
        setChildrenAges(Array.from({ length: criancasBase }, () => 0));
    }, [lead, mode]);

    const produtosSelecionados = useMemo(
        () => parseLista(produtoInputValue),
        [produtoInputValue]
    );

    const hasResort = produtosSelecionados.some(
        (p) => p.toLowerCase() === "resort"
    );

    const termoBuscaProdutos = extrairTermoBusca(produtoInputValue).toLowerCase();

    const produtosSugeridos = useMemo(() => {
        if (!produtoFocused || !termoBuscaProdutos) return [];
        return PRODUTOS_OPCOES.filter((opcao) => {
            const jaSelecionado = produtosSelecionados.some(
                (p) => p.toLowerCase() === opcao.toLowerCase()
            );
            return (
                !jaSelecionado &&
                opcao.toLowerCase().includes(termoBuscaProdutos)
            );
        });
    }, [produtoFocused, termoBuscaProdutos, produtosSelecionados]);

    const termoBuscaResort = resortInputValue.trim().toLowerCase();

    const resortsSugeridos = useMemo(() => {
        if (!hasResort || !resortFocused || !termoBuscaResort) return [];
        return RESORTS_OPCOES.filter((opcao) =>
            opcao.toLowerCase().includes(termoBuscaResort)
        );
    }, [hasResort, resortFocused, termoBuscaResort]);

    const handleChildrenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const next = Math.max(0, Number(e.target.value) || 0);

        setChildrenCount(next);
        setChildrenAges((prev) => {
            const current = [...prev];

            if (next > current.length) {
                return [...current, ...Array(next - current.length).fill(0)];
            }

            return current.slice(0, next);
        });
    };

    const handleChildAgeChange = (index: number, value: number) => {
        setChildrenAges((prev) => {
            const copy = [...prev];
            copy[index] = value;
            return copy;
        });
    };

    const handleSelecionarProduto = (opcao: string) => {
        setProdutoInputValue((prev) => {
            const tokens = parseLista(prev);
            const busca = extrairTermoBusca(prev).toLowerCase();

            const tokensSemDraft = tokens.filter(
                (t) => t.toLowerCase() !== busca
            );

            const lowerOpcao = opcao.toLowerCase();
            const semDuplicata = tokensSemDraft.filter(
                (t) => t.toLowerCase() !== lowerOpcao
            );

            const novaLista = [...semDuplicata, opcao];

            let texto = novaLista.join(", ");

            if (!texto.endsWith(", ")) {
                texto = texto + ", ";
            }

            return texto;
        });

        if (produtoInputRef.current) {
            produtoInputRef.current.focus();
        }
    };

    const handleBlurProdutos = () => {
        setTimeout(() => {
            setProdutoFocused(false);
            setProdutoInputValue((prev) => parseLista(prev).join(", "));
        }, 100);
    };

    const handleSelecionarResort = (opcao: string) => {
        setResortInputValue(opcao);
        if (resortInputRef.current) {
            resortInputRef.current.focus();
        }
    };

    const handleBlurResort = () => {
        setTimeout(() => {
            setResortFocused(false);
            setResortInputValue((prev) => prev.trim());
        }, 100);
    };

    if (!lead && !isNovaCotacao) {
        return (
            <>
                <div className="panel-header">
                    <div className="panel-title">
                        <span className="panel-title-main">Lead</span>
                    </div>
                </div>
                <div className="lead-empty">Nenhum lead carregado</div>
            </>
        );
    }

    const origem = isNovaCotacao ? "" : (lead?.origem || "Cidade de origem");
    const destino = isNovaCotacao ? "" : (lead?.destino || "Cidade de destino");
    const checkin = isNovaCotacao ? "" : (lead?.checkin || "");
    const checkout = isNovaCotacao ? "" : (lead?.checkout || "");
    const adultos = isNovaCotacao ? 0 : (lead?.adultos ?? 0);
    const criancas = isNovaCotacao ? 0 : (lead?.criancas ?? 0);
    const valorCentavos = isNovaCotacao ? 0 : (lead?.valorCentavos ?? 0);
    const valorBRL = (valorCentavos / 100).toFixed(2).replace(".", ",");

    return (
        <>
            <div className="panel-header">
                <div className="panel-title">
                    <span className="panel-title-main">Lead</span>
                    <span className="panel-title-sub">
                        {isNovaCotacao
                            ? "Nova cotação"
                            : lead?.titulo || "Sem título definido"}
                    </span>
                </div>
            </div>

            <div className="lead-wrapper">
                <div className="lead-tabs">
                    {leads.map((l: any) => (
                        <button
                            key={l.id}
                            type="button"
                            className={
                                "lead-tab" +
                                (l.id === lead?.id && !isNovaCotacao
                                    ? " lead-tab-active"
                                    : "")
                            }
                            onClick={() => {
                                setIsNovaCotacao(false);
                                onSelectLead(l.id);
                            }}
                        >
                            {l.titulo || l.nome || "Sem título"}
                        </button>
                    ))}

                    <button
                        type="button"
                        className={
                            "lead-tab lead-tab-add" +
                            (isNovaCotacao ? " lead-tab-active" : "")
                        }
                        onClick={() => {
                            setIsNovaCotacao(true);
                            setStatus("QUALIFICACAO");
                            setMotivoPerda("");
                            setChildrenCount(0);
                            setChildrenAges([]);
                            setProdutoInputValue("");
                            setResortInputValue("");
                        }}
                    >
                        + Nova cotação
                    </button>
                </div>

                <article
                    key={isNovaCotacao ? "nova" : lead?.id}
                    className="lead-card"
                >
                    <header className="lead-header">
                        <div className="lead-header-top">
                            <div className="lead-funnel-row">
                                <select
                                    className="lead-funnel-select"
                                    value={status}
                                    onChange={(e) => {
                                        const next = e.target.value as FunilStatus;
                                        setStatus(next);
                                        if (next !== "PERDA") {
                                            setMotivoPerda("");
                                        }
                                        // Regra suprema agora é automática:
                                        // se o vendedor marcar GANHO ou PERDA,
                                        // já disparamos onFinalizeLead sem precisar clicar em "Salvar".
                                        if (next === "GANHO" || next === "PERDA") {
                                            onFinalizeLead && onFinalizeLead(next);
                                        }
                                    }}
                                >
                                    <option value="QUALIFICACAO">
                                        {statusLabel.QUALIFICACAO}
                                    </option>
                                    <option value="PROPOSTA_ENVIADA">
                                        {statusLabel.PROPOSTA_ENVIADA}
                                    </option>
                                    <option value="EM_FECHAMENTO">
                                        {statusLabel.EM_FECHAMENTO}
                                    </option>
                                    <option value="GANHO">{statusLabel.GANHO}</option>
                                    <option value="PERDA">{statusLabel.PERDA}</option>
                                </select>
                            </div>

                            <div className="lead-amount">
                                <span>R$</span>
                                <strong>
                                    {valorBRL === "0,00" ? "Sem valor" : valorBRL}
                                </strong>
                            </div>
                        </div>

                        {status === "PERDA" && (
                            <div className="lead-perda-row">
                                <label>
                                    Motivo da perda
                                    <select
                                        value={motivoPerda}
                                        onChange={(e) => setMotivoPerda(e.target.value)}
                                    >
                                        <option value="">Selecione…</option>
                                        {perdaMotivos.map((m) => (
                                            <option key={m.value} value={m.value}>
                                                {m.label}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                        )}

                        <div className="lead-progress-bar">
                            <div
                                className="lead-progress-fill"
                                style={{ backgroundImage: statusGradient[status] }}
                            />
                        </div>
                    </header>

                    <div className="lead-body">
                        <section className="lead-section">
                            <h3>Viagem</h3>
                            <div className="lead-grid">
                                <div className="field">
                                    <label>Origem</label>
                                    <input
                                        defaultValue={isNovaCotacao ? "" : origem}
                                        placeholder="Cidade de origem"
                                    />
                                </div>
                                <div className="field">
                                    <label>Destino</label>
                                    <input
                                        defaultValue={isNovaCotacao ? "" : destino}
                                        placeholder="Cidade de destino"
                                    />
                                </div>
                                <div className="field">
                                    <label>Check-in</label>
                                    <input
                                        type="date"
                                        defaultValue={isNovaCotacao ? "" : checkin}
                                    />
                                </div>
                                <div className="field">
                                    <label>Check-out</label>
                                    <input
                                        type="date"
                                        defaultValue={isNovaCotacao ? "" : checkout}
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="lead-section">
                            <h3>Pessoas</h3>

                            <div className="lead-grid">
                                <div className="field">
                                    <label>Adultos</label>
                                    <input
                                        type="number"
                                        min={0}
                                        defaultValue={isNovaCotacao ? "" : adultos}
                                    />
                                </div>

                                <div className="field">
                                    <label>Crianças</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={childrenCount}
                                        onChange={handleChildrenChange}
                                    />
                                </div>
                            </div>

                            {childrenCount > 0 && (
                                <div className="lead-grid" style={{ marginTop: 12 }}>
                                    {Array.from({ length: childrenCount }).map((_, index) => (
                                        <div className="field" key={index}>
                                            <label>Idade do menor {index + 1}</label>
                                            <select
                                                value={childrenAges[index] ?? ""}
                                                onChange={(e) =>
                                                    handleChildAgeChange(
                                                        index,
                                                        Number(e.target.value) || 0
                                                    )
                                                }
                                            >
                                                <option value="">Idade</option>
                                                {Array.from({ length: 18 }).map((__, age) => (
                                                    <option key={age} value={age}>
                                                        {age} {age === 1 ? "ano" : "anos"}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className="lead-section">
                            <h3>Produtos</h3>

                            <div className="field field-autocomplete">
                                <label>Produtos</label>

                                <input
                                    ref={produtoInputRef}
                                    placeholder="Ex.: Aéreo, hotel, pacote…"
                                    value={produtoInputValue}
                                    onChange={(e) => setProdutoInputValue(e.target.value)}
                                    onFocus={() => setProdutoFocused(true)}
                                    onBlur={handleBlurProdutos}
                                />

                                {produtosSugeridos.length > 0 && (
                                    <div className="lead-suggestions">
                                        {produtosSugeridos.map((opcao) => (
                                            <div
                                                key={opcao}
                                                className="lead-suggestion-item"
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    handleSelecionarProduto(opcao);
                                                }}
                                            >
                                                {opcao}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {hasResort && (
                                <div
                                    className="field field-autocomplete"
                                    style={{ marginTop: 16 }}
                                >
                                    <label>Resort</label>
                                    <input
                                        ref={resortInputRef}
                                        placeholder="Digite ou selecione o resort"
                                        value={resortInputValue}
                                        onChange={(e) => setResortInputValue(e.target.value)}
                                        onFocus={() => setResortFocused(true)}
                                        onBlur={handleBlurResort}
                                    />

                                    {resortsSugeridos.length > 0 && (
                                        <div className="lead-suggestions">
                                            {resortsSugeridos.map((opcao) => (
                                                <div
                                                    key={opcao}
                                                    className="lead-suggestion-item"
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        handleSelecionarResort(opcao);
                                                    }}
                                                >
                                                    {opcao}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Rodapé removido – não existem mais botões Cancelar / Salvar */}
                </article>
            </div>
        </>
    );
}
