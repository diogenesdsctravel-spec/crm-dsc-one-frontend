/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";

interface LeadCardProps {
    leads: any[];
    selectedLeadId: string | null;
    onSelectLead: (id: string) => void;
}

type FunilStatus =
    | "QUALIFICACAO"
    | "PROPOSTA_ENVIADA"
    | "EM_FECHAMENTO"
    | "GANHO"
    | "PERDA";

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

export default function LeadCard({
    leads,
    selectedLeadId,
    onSelectLead,
}: LeadCardProps) {
    const lead = useMemo(
        () => leads.find((l) => l.id === selectedLeadId) || leads[0],
        [leads, selectedLeadId]
    );

    const [status, setStatus] = useState<FunilStatus>("QUALIFICACAO");
    const [motivoPerda, setMotivoPerda] = useState<string>("");

    const initialChildren = lead?.criancas ?? 0;
    const [childrenCount, setChildrenCount] = useState<number>(initialChildren);
    const [childrenAges, setChildrenAges] = useState<number[]>(() =>
        Array.from({ length: initialChildren }, () => 0)
    );

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

    if (!lead) {
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

    const origem = lead.origem || "Cidade de origem";
    const destino = lead.destino || "Cidade de destino";
    const checkin = lead.checkin || "";
    const checkout = lead.checkout || "";
    const adultos = lead.adultos ?? 0;
    const criancas = lead.criancas ?? 0;
    const valorCentavos = lead.valorCentavos ?? 0;
    const valorBRL = (valorCentavos / 100).toFixed(2).replace(".", ",");

    return (
        <>
            <div className="panel-header">
                <div className="panel-title">
                    <span className="panel-title-main">Lead</span>
                    <span className="panel-title-sub">
                        {lead.titulo || "Sem título definido"}
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
                                "lead-tab" + (l.id === lead.id ? " lead-tab-active" : "")
                            }
                            onClick={() => onSelectLead(l.id)}
                        >
                            {l.titulo || l.nome || "Sem título"}
                        </button>
                    ))}

                    <button
                        type="button"
                        className="lead-tab lead-tab-add"
                        onClick={() => alert("Novo lead (mock)")}
                    >
                        + Nova cotação
                    </button>
                </div>

                <article className="lead-card">
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
                                <strong>{valorBRL === "0,00" ? "Sem valor" : valorBRL}</strong>
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
                                    <input defaultValue={origem} placeholder="Cidade de origem" />
                                </div>
                                <div className="field">
                                    <label>Destino</label>
                                    <input
                                        defaultValue={destino}
                                        placeholder="Cidade de destino"
                                    />
                                </div>
                                <div className="field">
                                    <label>Check-in</label>
                                    <input type="date" defaultValue={checkin} />
                                </div>
                                <div className="field">
                                    <label>Check-out</label>
                                    <input type="date" defaultValue={checkout} />
                                </div>
                            </div>
                        </section>

                        <section className="lead-section">
                            <h3>Pessoas</h3>

                            <div className="lead-grid">
                                <div className="field">
                                    <label>Adultos</label>
                                    <input type="number" min={0} defaultValue={adultos} />
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
                            <input
                                placeholder="Ex.: Aéreo, hotel, pacote…"
                                defaultValue={lead.produtos || ""}
                            />
                        </section>
                    </div>

                    <footer className="lead-footer">
                        <button
                            type="button"
                            className="ghost"
                            onClick={() => alert("Cancelar (mock)")}
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            className="primary"
                            onClick={() => alert("Salvar (mock)")}
                        >
                            Salvar
                        </button>
                    </footer>
                </article>
            </div>
        </>
    );
}
