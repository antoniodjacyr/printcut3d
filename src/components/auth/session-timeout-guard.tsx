"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/client";

const PREF_KEY = "printcut3d.idleWarnMinutes";
const LAST_ACTIVITY_KEY = "printcut3d.lastActivityAt";
const MAX_IDLE_MS = 12 * 60 * 60 * 1000;
const WARNING_COUNTDOWN_MS = 60 * 1000;
const WARNING_OPTIONS = [5, 10, 20, 30, 60] as const;

function now() {
  return Date.now();
}

function readWarnMinutes() {
  const raw = localStorage.getItem(PREF_KEY);
  const value = Number(raw);
  if (Number.isFinite(value) && WARNING_OPTIONS.includes(value as (typeof WARNING_OPTIONS)[number])) {
    return value;
  }
  return 20;
}

export function SessionTimeoutGuard() {
  const [enabled, setEnabled] = useState(false);
  const [warnMinutes, setWarnMinutes] = useState(20);
  const [showPrompt, setShowPrompt] = useState(false);
  const [remainingMs, setRemainingMs] = useState(WARNING_COUNTDOWN_MS);
  const warningStartedAtRef = useRef<number | null>(null);
  const lastSavedRef = useRef<number>(0);

  const warnMs = useMemo(() => warnMinutes * 60 * 1000, [warnMinutes]);

  const recordActivity = () => {
    const ts = now();
    if (ts - lastSavedRef.current < 15_000) return;
    lastSavedRef.current = ts;
    localStorage.setItem(LAST_ACTIVITY_KEY, String(ts));
    if (showPrompt) {
      setShowPrompt(false);
      warningStartedAtRef.current = null;
      setRemainingMs(WARNING_COUNTDOWN_MS);
    }
  };

  const forceLogout = async () => {
    const supabase = getBrowserSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    window.location.href = "/login";
  };

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;

    const bootstrap = async () => {
      const { data } = await supabase.auth.getUser();
      const isLogged = Boolean(data.user);
      setEnabled(isLogged);
      if (!isLogged) return;
      setWarnMinutes(readWarnMinutes());
      if (!localStorage.getItem(LAST_ACTIVITY_KEY)) {
        localStorage.setItem(LAST_ACTIVITY_KEY, String(now()));
      }
    };
    void bootstrap();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const isLogged = Boolean(session?.user);
      setEnabled(isLogged);
      if (isLogged && !localStorage.getItem(LAST_ACTIVITY_KEY)) {
        localStorage.setItem(LAST_ACTIVITY_KEY, String(now()));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"] as const;
    events.forEach((eventName) => window.addEventListener(eventName, recordActivity, { passive: true }));
    return () => {
      events.forEach((eventName) => window.removeEventListener(eventName, recordActivity));
    };
  }, [enabled, showPrompt]);

  useEffect(() => {
    if (!enabled) return;
    const timer = window.setInterval(() => {
      const last = Number(localStorage.getItem(LAST_ACTIVITY_KEY) || 0);
      if (!last) {
        localStorage.setItem(LAST_ACTIVITY_KEY, String(now()));
        return;
      }

      const idle = now() - last;
      if (idle >= MAX_IDLE_MS) {
        void forceLogout();
        return;
      }

      if (!showPrompt && idle >= warnMs) {
        setShowPrompt(true);
        warningStartedAtRef.current = now();
        setRemainingMs(WARNING_COUNTDOWN_MS);
        return;
      }

      if (showPrompt) {
        const started = warningStartedAtRef.current ?? now();
        const left = Math.max(0, WARNING_COUNTDOWN_MS - (now() - started));
        setRemainingMs(left);
        if (left === 0) {
          void forceLogout();
        }
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [enabled, showPrompt, warnMs]);

  const continueSession = () => {
    localStorage.setItem(LAST_ACTIVITY_KEY, String(now()));
    lastSavedRef.current = now();
    warningStartedAtRef.current = null;
    setShowPrompt(false);
    setRemainingMs(WARNING_COUNTDOWN_MS);
  };

  const onWarnChange = (minutes: number) => {
    setWarnMinutes(minutes);
    localStorage.setItem(PREF_KEY, String(minutes));
    localStorage.setItem(LAST_ACTIVITY_KEY, String(now()));
    setShowPrompt(false);
    warningStartedAtRef.current = null;
    setRemainingMs(WARNING_COUNTDOWN_MS);
  };

  if (!enabled || !showPrompt) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4">
      <div className="tech-card w-full max-w-lg rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white">Sessão inativa</h2>
        <p className="mt-2 text-sm text-zinc-300">
          Sem interação por alguns minutos. Quer continuar logado?
        </p>
        <p className="mt-2 text-sm text-amber-300">
          Saída automática em {Math.ceil(remainingMs / 1000)}s se não confirmar.
        </p>

        <label className="mt-4 block text-sm text-zinc-300">
          Mostrar aviso após
          <select
            value={warnMinutes}
            onChange={(e) => onWarnChange(Number(e.target.value))}
            className="ml-2 rounded-md border border-white/15 bg-black/30 px-2 py-1 text-zinc-100"
          >
            {WARNING_OPTIONS.map((minutes) => (
              <option key={minutes} value={minutes}>
                {minutes} minutos
              </option>
            ))}
          </select>
          <span className="ml-2 text-xs text-zinc-500">(preferência deste navegador)</span>
        </label>

        <p className="mt-3 text-xs text-zinc-500">
          Regra fixa de segurança: após 12 horas sem interação, o sistema encerra a sessão automaticamente.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={continueSession}
            className="rounded-lg bg-neon px-4 py-2 text-sm font-semibold text-black"
          >
            Continuar logado
          </button>
          <button
            type="button"
            onClick={() => void forceLogout()}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-zinc-200 hover:border-red-400 hover:text-red-300"
          >
            Sair agora
          </button>
        </div>
      </div>
    </div>
  );
}
