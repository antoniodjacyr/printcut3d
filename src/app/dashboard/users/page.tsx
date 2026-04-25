import Link from "next/link";
import { sanitizeSupabaseUrl } from "@/lib/supabase/env-sanitize";

export const runtime = "edge";

function getProjectRefFromUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(".supabase.co", "");
  } catch {
    return "";
  }
}

export default function DashboardUsersPage() {
  const supabaseUrl = sanitizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const projectRef = getProjectRefFromUrl(supabaseUrl);
  const usersUrl = projectRef
    ? `https://supabase.com/dashboard/project/${projectRef}/auth/users`
    : "https://supabase.com/dashboard";
  const emailTemplateUrl = projectRef
    ? `https://supabase.com/dashboard/project/${projectRef}/auth/templates`
    : "https://supabase.com/dashboard";
  const smtpUrl = projectRef
    ? `https://supabase.com/dashboard/project/${projectRef}/auth/providers`
    : "https://supabase.com/dashboard";

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold text-white">Usuários e e-mails de cadastro</h2>
        <p className="mt-1 text-sm text-zinc-400">
          A gestão de usuários do Auth e o remetente do e-mail ficam no painel do Supabase do seu projeto.
        </p>
      </header>

      <section className="tech-card space-y-4 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white">Acessos rápidos</h3>
        <div className="flex flex-wrap gap-3">
          <Link
            href={usersUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-neon/40 px-4 py-2 text-sm text-neon hover:bg-neon/10"
          >
            Abrir usuários (Supabase Auth)
          </Link>
          <Link
            href={emailTemplateUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-zinc-200 hover:border-neon/30"
          >
            Abrir templates de e-mail
          </Link>
          <Link
            href={smtpUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-zinc-200 hover:border-neon/30"
          >
            Configurar SMTP/remetente
          </Link>
        </div>
      </section>

      <section className="tech-card rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white">Como trocar remetente para Print &amp; Cut 3D</h3>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-zinc-300">
          <li>No Supabase, abra Auth → Providers → Email.</li>
          <li>Ative SMTP customizado (Resend, SendGrid, Mailgun, SES etc.).</li>
          <li>Defina o sender name como "Print &amp; Cut 3D" e um e-mail do seu domínio.</li>
          <li>Em Auth → Templates, ajuste assunto e conteúdo dos e-mails.</li>
          <li>Salve e teste um novo cadastro para validar.</li>
        </ol>
      </section>
    </div>
  );
}
