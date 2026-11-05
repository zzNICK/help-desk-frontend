import React, { useState } from "react";
import {
  AlertTriangle, ArrowLeft, CheckCircle2, ChevronRight, Eye, EyeOff,
  KeyRound, LifeBuoy, LockKeyhole, Mail, ShieldCheck, Zap
} from "lucide-react";
import { request } from "./api.js";

function Brand({ compact = false }) {
  return (
    <div className={`brand ${compact ? "compact" : ""}`}>
      <div className="brandmark"><LifeBuoy size={22} /></div>
      {!compact && <div><strong>NORD</strong><span>HELP DESK</span></div>}
    </div>
  );
}

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      if (mode === "login") {
        const data = await request("/api/v1/help-desk/auth/login", {
          method: "POST",
          body: JSON.stringify({ nmLogin: email, nmSenha: password })
        });
        localStorage.setItem("helpdesk_token", data.token);
        localStorage.setItem("helpdesk_role", data.nmRole || "");
        onLogin();
      } else if (mode === "forgot") {
        const data = await request("/api/v1/help-desk/acesso/recuperar-senha/solicitar", {
          method: "POST",
          body: JSON.stringify({ nmEmail: email })
        });
        setMessage(data?.txMensagem || "Código solicitado.");
        setMode("reset");
      } else {
        await request("/api/v1/help-desk/acesso/recuperar-senha/redefinir", {
          method: "POST",
          body: JSON.stringify({ nmEmail: email, cdVerificacao: code, nmNovaSenha: newPassword })
        });
        setMessage("Senha redefinida. Entre com sua nova senha.");
        setMode("login");
      }
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return (
    <main className="login-page">
      <section className="login-art">
        <div className="orb orb-a" /><div className="orb orb-b" />
        <Brand />
        <div className="hero-copy">
          <div className="eyebrow"><Zap size={14} /> suporte sem ruído</div>
          <h1>Problemas chegam.<br /><span>Respostas também.</span></h1>
          <p>Centralize chamados, acompanhe SLAs e mantenha o time focado no que precisa ser resolvido agora.</p>
          <div className="mini-stats">
            <div><strong>98,4%</strong><span>SLA cumprido</span></div>
            <div><strong>8 min</strong><span>1ª resposta</span></div>
            <div><strong>24/7</strong><span>Visibilidade</span></div>
          </div>
        </div>
        <div className="art-footer">Painel operacional • v1.0</div>
      </section>

      <section className="login-form-wrap">
        <div className="login-card">
          <div className="mobile-brand"><Brand /></div>
          {mode !== "login" && <button className="back" onClick={() => { setMode("login"); setError(""); }}><ArrowLeft size={17} /> Voltar</button>}
          <div className="form-head">
            <span className="form-icon">{mode === "login" ? <LockKeyhole /> : <KeyRound />}</span>
            <h2>{mode === "login" ? "Bem-vindo de volta" : mode === "forgot" ? "Recuperar acesso" : "Criar nova senha"}</h2>
            <p>{mode === "login" ? "Entre com suas credenciais para acessar o painel." : mode === "forgot" ? "Informe seu e-mail para solicitar o código de recuperação." : "Digite o código recebido e escolha uma senha com no mínimo 8 caracteres."}</p>
          </div>

          <form onSubmit={submit}>
            <label>E-mail ou usuário</label>
            <div className="input"><Mail size={18} /><input type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@empresa.com.br ou nome de usuário" required /></div>
            {mode === "login" && <>
              <div className="label-row"><label>Senha</label><button type="button" onClick={() => setMode("forgot")}>Esqueci minha senha</button></div>
              <div className="input"><LockKeyhole size={18} /><input type={show ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Sua senha" minLength={8} required /><button type="button" onClick={() => setShow(!show)}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
            </>}
            {mode === "reset" && <>
              <label>Código de 6 caracteres</label>
              <div className="input"><ShieldCheck size={18} /><input value={code} onChange={e => setCode(e.target.value)} maxLength={6} placeholder="000000" required /></div>
              <label>Nova senha</label>
              <div className="input"><LockKeyhole size={18} /><input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength={8} placeholder="Mínimo de 8 caracteres" required /></div>
            </>}
            {error && <div className="notice error"><AlertTriangle size={16} />{error}</div>}
            {message && <div className="notice success"><CheckCircle2 size={16} />{message}</div>}
            <button className="primary" disabled={busy}>{busy ? "Aguarde..." : mode === "login" ? "Entrar no painel" : mode === "forgot" ? "Solicitar código" : "Redefinir senha"}<ChevronRight size={18} /></button>
          </form>
          <p className="security-note"><ShieldCheck size={15} /> Sessão protegida por autenticação JWT</p>
        </div>
      </section>
    </main>
  );
}