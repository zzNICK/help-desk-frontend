const API = import.meta.env.VITE_API_URL || "http://localhost:8081";

export async function request(path, options = {}) {
  const token = localStorage.getItem("helpdesk_token");
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  let data = null;
  try { data = await response.json(); } catch {}
  if (!response.ok) {
    throw new Error(data?.mensagem || data?.message || data?.txMensagem || "Não foi possível concluir a solicitação.");
  }
  return data;
}