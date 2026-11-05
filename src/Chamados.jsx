import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, LogOut, Plus, RefreshCw, TicketCheck } from "lucide-react";
import { request } from "./api.js";

const STATUS_LIST = ["ABERTO", "EM_ANALISE", "ENCERRADO"];

const STATUS_LABEL = { ABERTO: "Aberto", EM_ANALISE: "Em análise", ENCERRADO: "Encerrado" };

function statusLabel(status) {
  return STATUS_LABEL[status] || status || "—";
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleString("pt-BR");
}

export default function Chamados({ onLogout }) {
  const [tab, setTab] = useState("abrir");
  const isAdmin = localStorage.getItem("helpdesk_role") === "ADMIN";

  const [descricao, setDescricao] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [chamados, setChamados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [statusBusy, setStatusBusy] = useState(false);

  async function carregarChamados() {
    setLoading(true);
    setListError("");
    try {
      const data = await request("/api/v1/chamados");
      const result = data?.body ?? data;
      setChamados(Array.isArray(result) ? result : []);
    } catch (err) {
      setListError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (tab === "chamados") {
      carregarChamados();
    }
  }, [tab]);

  async function abrirChamado(e) {
    e.preventDefault();
    setBusy(true); setSuccess(""); setError("");
    try {
      await request("/api/v1/chamados", {
        method: "POST",
        body: JSON.stringify({ dsDescricao: descricao })
      });
      setDescricao("");
      setSuccess("Chamado aberto com sucesso.");
      setTab("chamados");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function alterarStatus(chamado, novoStatus) {
    if (!novoStatus || novoStatus === chamado.nmStatus) return;
    setStatusBusy(true); setListError("");
    try {
      await request(`/api/v1/chamados/${chamado.id}/status`, {
        method: "PUT",
        body: JSON.stringify({ nmStatus: novoStatus })
      });
      await carregarChamados();
    } catch (err) {
      setListError(err.message);
    } finally {
      setStatusBusy(false);
    }
  }

  const chamadosFiltrados = useMemo(() => {
    if (statusFilter === "TODOS") return chamados;
    return chamados.filter(c => c.nmStatus === statusFilter);
  }, [chamados, statusFilter]);

  return (
    <div className="app simple-app">
      <main className="content">
        <header>
          <div className="header-title"><span>Help Desk</span><strong>Central de suporte</strong></div>
          <div className="header-actions">
            <button className="icon-btn" onClick={onLogout} title="Sair"><LogOut size={19} /></button>
          </div>
        </header>

        <section className="page">
          <div className="tabs">
            <button className={tab === "abrir" ? "active" : ""} onClick={() => setTab("abrir")}><Plus size={16} /> Abrir chamado</button>
            <button className={tab === "chamados" ? "active" : ""} onClick={() => setTab("chamados")}><TicketCheck size={16} /> Chamados</button>
          </div>

          {tab === "abrir" && (
            <div className="panel form-panel">
              <div className="panel-head"><div><h2>Abrir chamado</h2><p>Descreva o problema para a equipe de suporte.</p></div></div>
              <form className="form-body" onSubmit={abrirChamado}>
                <label htmlFor="dsDescricao">Descrição do problema</label>
                <textarea id="dsDescricao" className="input-area" value={descricao}
                  onChange={e => setDescricao(e.target.value)} maxLength={500} rows={6}
                  placeholder="Descreva o problema encontrado..." required />
                <small className="counter">{descricao.length}/500</small>
                {error && <div className="notice error"><AlertTriangle size={16} />{error}</div>}
                {success && <div className="notice success"><CheckCircle2 size={16} />{success}</div>}
                <button className="primary" disabled={busy || !descricao.trim()}>{busy ? "Abrindo..." : "Abrir chamado"}</button>
              </form>
            </div>
          )}

          {tab === "chamados" && (
            <div className="panel list-panel">
              <div className="panel-head">
                <div><h2>Chamados</h2><p>ADMIN acompanha todos; usuário vê os próprios.</p></div>
                <div className="filter-row">
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="TODOS">Todos os status</option>
                    {STATUS_LIST.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
                  </select>
                  <button className="icon-btn" onClick={carregarChamados} title="Atualizar"><RefreshCw size={18} /></button>
                </div>
              </div>

              {listError && <div className="notice error list-notice"><AlertTriangle size={16} />{listError}</div>}

              {loading
                ? <p className="empty">Carregando chamados...</p>
                : chamadosFiltrados.length === 0
                  ? <p className="empty">Nenhum chamado encontrado.</p>
                  : (
                    <div className={`table ${isAdmin ? "cols-6" : "cols-5"}`}>
                      <div className="tr th"><span>ID</span><span>Solicitante</span><span>Descrição</span><span>Status</span><span>Data</span>{isAdmin && <span>Ação</span>}</div>
                      {chamadosFiltrados.map(c => (
                        <div className="tr" key={c.id}>
                          <span className="ticket-title"><b>#{c.id}</b></span>
                          <span className="requester"><b>{c.nmUser || "—"}</b></span>
                          <span className="desc">{c.dsDescricao}</span>
                          <span><span className={`badge ${(c.nmStatus || "").toLowerCase()}`}><i />{statusLabel(c.nmStatus)}</span></span>
                          <span className="age">{formatDate(c.dtInclusao)}</span>
                          {isAdmin && (
                            <span>
                              <select className="status-select" value={c.nmStatus || "ABERTO"}
                                onChange={e => alterarStatus(c, e.target.value)} disabled={statusBusy}>
                                {STATUS_LIST.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
                              </select>
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}