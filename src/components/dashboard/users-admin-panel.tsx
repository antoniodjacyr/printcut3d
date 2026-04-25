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
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditableUser | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

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

  const openEditor = (user: EditableUser) => {
    setSelectedUserId(user.id);
    setDraft({ ...user });
    setConfirmOpen(false);
  };

  const closeEditor = () => {
    setSelectedUserId(null);
    setDraft(null);
    setConfirmOpen(false);
  };

  const saveDraft = async () => {
    if (!draft) return;
    setSavingDraft(true);
    setError(null);
    setSuccess(null);
    setRecoveryLink(null);
    try {
      const response = await fetch("/api/dashboard/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: draft.id,
          fullName: draft.fullName,
          phone: draft.phone,
          country: draft.country,
          city: draft.city,
          state: draft.state,
          zip: draft.zip,
          role: draft.role,
          emailConfirmed: draft.emailConfirmed,
          blocked: draft.blocked
        })
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Falha ao salvar usuário.");
      setSuccess(`Usuário atualizado: ${draft.email}`);
      await load(query);
      closeEditor();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar usuário.");
    } finally {
      setSavingDraft(false);
      setConfirmOpen(false);
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

      {!loading && (
        <section className="tech-card rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white">Lista de usuários</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="text-xs uppercase text-zinc-500">
                <tr>
                  <th className="pb-2 pr-3">E-mail</th>
                  <th className="pb-2 pr-3">Nome</th>
                  <th className="pb-2 pr-3">Perfil</th>
                  <th className="pb-2 pr-3">Status</th>
                  <th className="pb-2 pr-3">Último login</th>
                  <th className="pb-2">Ação</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-white/10">
                    <td className="py-2 pr-3">{item.email}</td>
                    <td className="py-2 pr-3">{item.fullName || "-"}</td>
                    <td className="py-2 pr-3">{item.role === "admin" ? "Admin" : "Cliente"}</td>
                    <td className="py-2 pr-3">{item.blocked ? "Bloqueado" : "Ativo"}</td>
                    <td className="py-2 pr-3">
                      {item.lastSignInAt ? new Date(item.lastSignInAt).toLocaleString("pt-BR") : "-"}
                    </td>
                    <td className="py-2">
                      <button
                        type="button"
                        onClick={() => openEditor(item)}
                        className="rounded-md border border-neon/40 px-3 py-1 text-xs text-neon hover:bg-neon/10"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td className="py-2 text-zinc-500" colSpan={6}>
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

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

      {selectedUserId && draft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-white/15 bg-[#090d18] p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-white">Editar usuário</h3>
                <p className="text-sm text-zinc-400">{draft.email}</p>
                <p className="text-xs text-zinc-500">ID: {draft.id}</p>
              </div>
              <button
                type="button"
                onClick={closeEditor}
                className="rounded-md border border-white/20 px-3 py-1 text-xs text-zinc-200 hover:border-white/40"
              >
                Fechar
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <input
                value={draft.fullName}
                onChange={(e) => setDraft({ ...draft, fullName: e.target.value })}
                placeholder="Nome completo"
                className="rounded-md border border-white/15 bg-black/30 p-2 text-sm"
              />
              <input
                value={draft.phone}
                onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                placeholder="Telefone"
                className="rounded-md border border-white/15 bg-black/30 p-2 text-sm"
              />
              <input
                value={draft.country}
                onChange={(e) => setDraft({ ...draft, country: e.target.value })}
                placeholder="País"
                className="rounded-md border border-white/15 bg-black/30 p-2 text-sm"
              />
              <input
                value={draft.city}
                onChange={(e) => setDraft({ ...draft, city: e.target.value })}
                placeholder="Cidade"
                className="rounded-md border border-white/15 bg-black/30 p-2 text-sm"
              />
              <input
                value={draft.state}
                onChange={(e) => setDraft({ ...draft, state: e.target.value })}
                placeholder="Estado"
                className="rounded-md border border-white/15 bg-black/30 p-2 text-sm"
              />
              <input
                value={draft.zip}
                onChange={(e) => setDraft({ ...draft, zip: e.target.value })}
                placeholder="ZIP"
                className="rounded-md border border-white/15 bg-black/30 p-2 text-sm"
              />
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <label className="flex items-center gap-2 rounded-md border border-white/15 bg-black/30 p-2 text-sm">
                <span className="text-zinc-300">Perfil</span>
                <select
                  value={draft.role}
                  onChange={(e) => setDraft({ ...draft, role: e.target.value as "admin" | "customer" })}
                  className="ml-auto rounded bg-black/40 p-1 text-zinc-200"
                >
                  <option value="customer">Cliente</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              <label className="flex items-center gap-2 rounded-md border border-white/15 bg-black/30 p-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={draft.emailConfirmed}
                  onChange={(e) => setDraft({ ...draft, emailConfirmed: e.target.checked })}
                />
                E-mail confirmado
              </label>
              <label className="flex items-center gap-2 rounded-md border border-white/15 bg-black/30 p-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={draft.blocked}
                  onChange={(e) => setDraft({ ...draft, blocked: e.target.checked })}
                />
                Usuário bloqueado
              </label>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void runAction(draft, "reset_password")}
                className="rounded-md border border-white/20 px-3 py-1.5 text-xs text-zinc-200 hover:border-neon/40"
              >
                Gerar link de reset de senha
              </button>
              <button
                type="button"
                onClick={() => void runAction(draft, "delete_user")}
                className="rounded-md border border-red-400/40 px-3 py-1.5 text-xs text-red-200 hover:bg-red-500/10"
              >
                Excluir usuário
              </button>
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                disabled={savingDraft}
                className="ml-auto rounded-md bg-neon px-3 py-2 text-sm font-semibold text-black disabled:opacity-60"
              >
                {savingDraft ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmOpen && draft && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-md rounded-xl border border-white/15 bg-[#0a1020] p-5">
            <h4 className="text-base font-semibold text-white">Confirmar alteração</h4>
            <p className="mt-2 text-sm text-zinc-300">
              Confirmar atualização do usuário <span className="text-neon">{draft.email}</span>?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="rounded-md border border-white/20 px-3 py-1.5 text-sm text-zinc-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void saveDraft()}
                className="rounded-md bg-neon px-3 py-1.5 text-sm font-semibold text-black"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
