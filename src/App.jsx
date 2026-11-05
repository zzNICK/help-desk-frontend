import React, { useState } from "react";
import Login from "./Login.jsx";
import Chamados from "./Chamados.jsx";

export default function App() {
  const [logged, setLogged] = useState(Boolean(localStorage.getItem("helpdesk_token")));

  function handleLogout() {
    localStorage.removeItem("helpdesk_token");
    localStorage.removeItem("helpdesk_role");
    setLogged(false);
  }

  return logged ? <Chamados onLogout={handleLogout} /> : <Login onLogin={() => setLogged(true)} />;
}