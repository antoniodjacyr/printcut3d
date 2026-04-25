"use client";

import { useEffect, useMemo, useState } from "react";

type UserRow = {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  country: string;
  city: string;
  state: string;
  zip: string;
  role: "admin" | "customer";
  emailConfirmed: boolean;
  blocked: boolean;
  createdAt: string;
  lastSignInAt: string;
};

type EditableUser = UserRow & { saving?: boolean };
type AuditLog = {
  id: string;
  createdAt: string;
  actorEmail: string;
  targetEmail: string;
  action: string;
  details: Record<string, unknown>;
};

export function UsersAdminPanel() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [items, setItems] = useState<EditableUser[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [recoveryLink, setRecoveryLink] = useState<string | null>(null);

  const totalAdmins = useMemo(() => items.filter((item) => item.role === "admin").length, [items]);

  const load = async (q = "") => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/dashboard/users?q=${encodeURIComponent(q)}`, { cache: "no-store" });
      const data = (await response.json()) as { error?: string; users?: UserRow[]; logs?: AuditLog[] };
      if (!response.ok) throw new Error(data.error || "Falha ao carregar usuários.");
      setItems((data.users || []).map((user) => ({ ...user, saving: false })));
      setLogs(data.logs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const updateItem = (id: string, patch: Partial<EditableUser>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const save = async (item: EditableUser) => {
    updateItem(item.id, { saving: true });
    setError(null);
    setSuccess(null);
    setRecoveryLink(null);
    try {
      const response = await fetch("/api/dashboard/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: item.id,
          fullName: item.fullName,
          phone: item.phone,
          country: item.country,
          city: item.city,
          state: item.state,
          zip: item.zip,
          role: item.role,
          emailConfirmed: item.emailConfirmed,
          blocked: item.blocked
        })
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Falha ao salvar usuário.");
      setSuccess(`Usuário atualizado: ${item.email}`);
      await load(query);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar usuário.");
    } finally {
      updateItem(item.id, { saving: false });
    }
  };

  const runAction = async (item: EditableUser, action: "reset_password" | "delete_user") => {
    setError(null);
    setSuccess(null);
    setRecoveryLink(null);
    if (action === "delete_user") {
      const ok = window.confirm(`Excluir o usuário ${item.email}? Esta ação não pode ser desfeita.`);
      if (!ok) return;
    }
    try {
      const response = await fetch("/api/dashboard/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: item.id, action })
      });
      const data = (await response.json()) as { error?: string; recoveryLink?: string };
      if (!response.ok) throw new Error(data.error || "Falha ao executar ação.");
      if (action === "reset_password") {
        setSuccess(`Link de recuperação gerado para ${item.email}.`);
        if (data.recoveryLink) setRecoveryLink(data.recoveryLink);
      } else {
        setSuccess(`Usuário excluído: ${item.email}`);
      }
      await load(query);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao executar ação.");
    }
  };

  return (
    <section className="space-y-4">
      <div className="tech-card rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white">Gestão de usuários no site</h3>
        <p className="mt-1 text-sm text-zinc-400">
          Edite perfil, telefone/endereço, confirmação de e-mail, bloqueio e nível de acesso.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por e-mail, nome ou telefone"
            className="w-full max-w-md rounded-md border border-white/15 bg-black/30 p-2 text-sm text-zinc-100"
          />
          <button
            type="button"
            onClick={() => void load(query)}
            className="rounded-md border border-neon/40 px-3 py-2 text-sm text-neon hover:bg-neon/10"
          >
            Buscar
          </button>
          <p className="text-xs text-zinc-500">Admins: {totalAdmins}</p>
        </div>
      </div>

      {loading && <p className="text-sm text-zinc-400">Carregando usuários...</p>}
      {error && <p className="text-sm text-red-300">{error}</p>}
      {success && <p className="text-sm text-emerald-300">{success}</p>}
      {recoveryLink && (
        <p className="rounded-md border border-emerald-400/30 bg-emerald-400/10 p-2 text-xs text-emerald-200 break-all">
          Link de recuperação: {recoveryLink}
        </p>
      )}

      {!loading &&
        items.map((item) => (
          <article key={item.id} className="tech-card space-y-3 rounded-2xl p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-zinc-100">{item.email}</p>
                <p className="text-xs text-zinc-500">ID: {item.id}</p>
              </div>
              <div className="text-right text-xs text-zinc-500">
                <p>Criado: {item.createdAt ? new Date(item.createdAt).toLocaleString("pt-BR") : "-"}</p>
                <p>Último login: {item.lastSignInAt ? new Date(item.lastSignInAt).toLocaleString("pt-BR") : "-"}</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <input
                value={item.fullName}
                onChange={(e) => updateItem(item.id, { fullName: e.target.value })}
                placeholder="Nome completo"
                className="rounded-md border border-white/15 bg-black/30 p-2 text-sm"
              />
              <input
                value={item.phone}
                onChange={(e) => updateItem(item.id, { phone: e.target.value })}
                placeholder="Telefone"
                className="rounded-md border border-white/15 bg-black/30 p-2 text-sm"
              />
              <input
                value={item.country}
                onChange={(e) => updateItem(item.id, { country: e.target.value })}
                placeholder="País"
                className="rounded-md border border-white/15 bg-black/30 p-2 text-sm"
              />
              <input
                value={item.city}
                onChange={(e) => updateItem(item.id, { city: e.target.value })}
                placeholder="Cidade"
                className="rounded-md border border-white/15 bg-black/30 p-2 text-sm"
              />
              <input
                value={item.state}
                onChange={(e) => updateItem(item.id, { state: e.target.value })}
                placeholder="Estado"
                className="rounded-md border border-white/15 bg-black/30 p-2 text-sm"
              />
              <input
                value={item.zip}
                onChange={(e) => updateItem(item.id, { zip: e.target.value })}
                placeholder="ZIP"
                className="rounded-md border border-white/15 bg-black/30 p-2 text-sm"
              />
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              <label className="flex items-center gap-2 rounded-md border border-white/15 bg-black/30 p-2 text-sm">
                <span className="text-zinc-300">Perfil</span>
                <select
                  value={item.role}
                  onChange={(e) => updateItem(item.id, { role: e.target.value as "admin" | "customer" })}
                  className="ml-auto rounded bg-black/40 p-1 text-zinc-200"
                >
                  <option value="customer">Cliente</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              <label className="flex items-center gap-2 rounded-md border border-white/15 bg-black/30 p-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={item.emailConfirmed}
                  onChange={(e) => updateItem(item.id, { emailConfirmed: e.target.checked })}
                />
                E-mail confirmado
              </label>
              <label className="flex items-center gap-2 rounded-md border border-white/15 bg-black/30 p-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={item.blocked}
                  onChange={(e) => updateItem(item.id, { blocked: e.target.checked })}
                />
                Usuário bloqueado
              </label>
              <button
                type="button"
                disabled={item.saving}
                onClick={() => void save(item)}
                className="rounded-md bg-neon px-3 py-2 text-sm font-semibold text-black disabled:opacity-60"
              >
                {item.saving ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void runAction(item, "reset_password")}
                className="rounded-md border border-white/20 px-3 py-1.5 text-xs text-zinc-200 hover:border-neon/40"
              >
                Gerar link de reset de senha
              </button>
              <button
                type="button"
                onClick={() => void runAction(item, "delete_user")}
                className="rounded-md border border-red-400/40 px-3 py-1.5 text-xs text-red-200 hover:bg-red-500/10"
              >
                Excluir usuário
              </button>
            </div>
          </article>
        ))}

      {!loading && (
        <section className="tech-card rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white">Log de auditoria administrativa</h3>
          <p className="mt-1 text-xs text-zinc-500">Últimas ações feitas pelos administradores.</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="text-xs uppercase text-zinc-500">
                <tr>
                  <th className="pb-2 pr-3">Quando</th>
                  <th className="pb-2 pr-3">Admin</th>
                  <th className="pb-2 pr-3">Ação</th>
                  <th className="pb-2">Usuário</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-t border-white/10">
                    <td className="py-2 pr-3">{new Date(log.createdAt).toLocaleString("pt-BR")}</td>
                    <td className="py-2 pr-3">{log.actorEmail}</td>
                    <td className="py-2 pr-3">{log.action}</td>
                    <td className="py-2">{log.targetEmail}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td className="py-2 text-zinc-500" colSpan={4}>
                      Sem registros ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </section>
  );
}
