# NORD Help Desk — Frontend

Frontend React + Vite criado para o backend Spring Boot enviado.

## Rodar

1. Garanta que o backend esteja em `http://localhost:8081`.
2. No diretório do frontend:
   `npm install`
3. Copie `.env.example` para `.env` se quiser alterar a URL da API.
4. Execute:
   `npm run dev`

## Integração já feita
- POST `/api/v1/help-desk/auth/login`
- POST `/api/v1/help-desk/acesso/recuperar-senha/solicitar`
- POST `/api/v1/help-desk/acesso/recuperar-senha/redefinir`
- JWT salvo no `localStorage` e enviado como `Authorization: Bearer ...`

## Observação importante do backend
No `SecurityConfig`, `/api/v1/help-desk/acesso/recuperar-senha/**` não está explicitamente em `permitAll()`, embora o controller diga que é público. Se a recuperação retornar 401/403, libere essa rota no Spring Security.

O dashboard está visualmente pronto, mas os dados de chamados/SLA são demonstrativos porque o ZIP atual não contém controllers do módulo de chamados.
