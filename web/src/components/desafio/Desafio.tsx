/**
 * "Desafianos": planilla para que otro equipo organice un amistoso con Nespresso FC.
 * El rival completa equipo, contacto, fecha/horario y cancha; al final elige mandarlo por
 * WhatsApp (mensaje precargado) o por Instagram (se copia el mensaje y se abre el chat).
 * Sin backend: todo pasa en el navegador.
 *
 * Se abre desde cualquier lado con `useDesafio().open()` (navbar, menú mobile, CTA).
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { track } from '@vercel/analytics';
import { CLUB } from '@/data/club';
import { EASE } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { useScrollApi } from '@/providers/SmoothScroll';
import {
  CANCHAS, DESAFIO_VACIO, FRANJAS, LINK_IG_DM, armarMensaje, hoyISO, linkWhatsApp, validar,
  type Desafio, type Errores, type Medio,
} from './mensaje';

/* ─── Contexto ─────────────────────────────────────────────── */
const Ctx = createContext<{ open: () => void } | null>(null);

export function useDesafio() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useDesafio debe usarse dentro de <DesafioProvider>');
  return ctx;
}

export function DesafioProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const api = useMemo(() => ({ open: () => setOpen(true) }), []);
  return (
    <Ctx.Provider value={api}>
      {children}
      <DesafioModal open={open} onClose={() => setOpen(false)} />
    </Ctx.Provider>
  );
}

/* ─── Utilidades ───────────────────────────────────────────── */
/**
 * Copia texto. Primero el método síncrono (tiene que correr dentro del click, antes de que se abra
 * la pestaña de Instagram); si el navegador no lo permite, prueba la API moderna del portapapeles.
 */
function copiar(texto: string): Promise<boolean> {
  try {
    const ta = document.createElement('textarea');
    ta.value = texto;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    if (ok) return Promise.resolve(true);
  } catch {
    /* sigue con la API moderna */
  }
  if (!navigator.clipboard) return Promise.resolve(false);
  return navigator.clipboard.writeText(texto).then(
    () => true,
    () => false,
  );
}

const INPUT =
  'w-full rounded-xl border border-white/15 bg-ink-950/70 px-4 py-3 text-base text-white placeholder:text-white/30 outline-none transition-colors focus:border-crema aria-[invalid=true]:border-sunchales/80';

function Campo({
  id, label, error, children, hint,
}: { id: string; label: string; error?: string; children: ReactNode; hint?: string }) {
  return (
    <div>
      <label htmlFor={id} className="kicker mb-2 block text-white/70">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-[#ff8a75]">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-white/40">{hint}</p>
      ) : null}
    </div>
  );
}

/** Grupo de opciones como tarjetas (radios nativos por debajo, accesibles con teclado). */
function Opciones<T extends string>({
  name, legend, value, onChange, opciones, error, cols = 'sm:grid-cols-4',
}: {
  name: string; legend: string; value: T | null; onChange: (v: T) => void;
  opciones: { id: T; label: string; detalle: string }[]; error?: string; cols?: string;
}) {
  return (
    <fieldset aria-describedby={error ? `${name}-error` : undefined}>
      <legend className="kicker mb-2 text-white/70">{legend}</legend>
      <div className={cn('grid grid-cols-2 gap-2', cols)}>
        {opciones.map((o) => (
          <label
            key={o.id}
            className={cn(
              'cursor-pointer rounded-xl border px-3 py-3 transition-colors has-focus-visible:ring-2 has-focus-visible:ring-crema',
              value === o.id ? 'border-crema bg-crema text-ink-950' : 'border-white/15 bg-ink-950/60 text-white hover:border-crema/60',
            )}
          >
            <input
              type="radio"
              name={name}
              id={`${name}-${o.id}`}
              value={o.id}
              checked={value === o.id}
              onChange={() => onChange(o.id)}
              className="sr-only"
            />
            <span className="block font-sub text-sm uppercase tracking-[0.12em]">{o.label}</span>
            <span className={cn('block text-xs', value === o.id ? 'text-ink-950/70' : 'text-white/45')}>{o.detalle}</span>
          </label>
        ))}
      </div>
      {error && (
        <p id={`${name}-error`} className="mt-1.5 text-sm text-[#ff8a75]">
          {error}
        </p>
      )}
    </fieldset>
  );
}

/* ─── Modal ────────────────────────────────────────────────── */
/** copiado: null mientras se está copiando (solo Instagram). */
type Enviado = { canal: Medio; copiado: boolean | null; mensaje: string } | null;

const ORDEN_ERRORES: (keyof Errores)[] = ['equipo', 'contacto', 'dato', 'fechas', 'franja', 'cancha', 'canchaDetalle'];
const ID_CAMPO: Record<keyof Errores, string> = {
  equipo: 'desafio-equipo',
  contacto: 'desafio-contacto',
  dato: 'desafio-dato',
  fechas: 'desafio-fecha-0',
  franja: 'franja-tarde',
  cancha: 'cancha-valbe',
  canchaDetalle: 'desafio-cancha-detalle',
};

function DesafioModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { stop, start } = useScrollApi();
  const panel = useRef<HTMLDivElement>(null);
  const [d, setD] = useState<Desafio>(DESAFIO_VACIO);
  const [intentado, setIntentado] = useState(false);
  const [enviado, setEnviado] = useState<Enviado>(null);
  const hoy = hoyISO();

  const errores = useMemo(() => validar(d, hoy), [d, hoy]);
  const valido = Object.keys(errores).length === 0;
  const mensaje = useMemo(() => (valido ? armarMensaje(d) : ''), [d, valido]);
  const err = (k: keyof Errores) => (intentado ? errores[k] : undefined);
  const set = <K extends keyof Desafio>(k: K, v: Desafio[K]) => setD((prev) => ({ ...prev, [k]: v }));

  const cerrar = useCallback(() => {
    onClose();
    // Si ya se mandó, la próxima vez arranca en blanco. Si no, se conserva lo cargado.
    if (enviado) {
      window.setTimeout(() => {
        setD(DESAFIO_VACIO);
        setIntentado(false);
        setEnviado(null);
      }, 400);
    }
  }, [onClose, enviado]);

  // Scroll de fondo frenado, Esc para cerrar, foco adentro del modal.
  useEffect(() => {
    if (!open) return;
    stop();
    const prev = document.activeElement as HTMLElement | null;
    // Foco al primer campo de texto (o al primer botón en la pantalla de éxito).
    const t = window.setTimeout(() => {
      const p = panel.current;
      (p?.querySelector<HTMLElement>('input:not([type=radio])') ?? p?.querySelector<HTMLElement>('button'))?.focus();
    }, 80);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrar();
      if (e.key !== 'Tab' || !panel.current) return;
      const f = [...panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, textarea, select')].filter(
        (el) => el.offsetParent !== null || el.classList.contains('sr-only'),
      );
      if (!f.length) return;
      const [first, last] = [f[0], f[f.length - 1]];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('keydown', onKey);
      start();
      prev?.focus?.();
    };
  }, [open, cerrar, stop, start]);

  /** Antes de mandar: si falta algo, marca errores y lleva el foco al primero. */
  const listo = () => {
    if (valido) return true;
    setIntentado(true);
    const primero = ORDEN_ERRORES.find((k) => errores[k]);
    if (primero) {
      const el = document.getElementById(ID_CAMPO[primero]);
      el?.focus();
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
    return false;
  };

  const wa = valido ? linkWhatsApp(mensaje) : null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[86] flex items-end justify-center bg-ink-950/85 backdrop-blur-md md:items-center md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          // Mientras se va, que no tape clicks de la página.
          exit={{ opacity: 0, pointerEvents: 'none' }}
          onClick={cerrar}
        >
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="desafio-titulo"
            data-lenis-prevent
            className="relative max-h-[100svh] w-full overflow-y-auto overscroll-contain bg-ink-900 ring-1 ring-crema/20 md:max-h-[92svh] md:max-w-2xl md:rounded-3xl"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE.espresso }}
            onClick={(e) => e.stopPropagation()}
          >
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,rgba(232,213,181,0.14),transparent_70%)]" />
            <button
              type="button"
              onClick={cerrar}
              className="absolute right-4 top-4 z-10 font-sub text-xs uppercase tracking-[0.25em] text-crema hover:text-white md:right-6 md:top-6"
            >
              Cerrar ✕
            </button>

            <div className="relative px-5 pb-8 pt-14 md:px-10 md:pt-10">
              {enviado ? (
                <Exito enviado={enviado} onCerrar={cerrar} />
              ) : (
                <>
                  <p className="kicker text-crema">Desafianos</p>
                  <h2 id="desafio-titulo" className="font-display mt-2 text-[clamp(2.8rem,8vw,4.5rem)] leading-[0.9] text-white">
                    Armemos un amistoso
                  </h2>
                  <p className="mt-3 max-w-md text-white/65">
                    Completá la planilla y mandala por WhatsApp o Instagram. Te respondemos a la brevedad.
                  </p>

                  <form className="mt-8 space-y-8" noValidate onSubmit={(e) => e.preventDefault()}>
                    {/* 1. Su equipo */}
                    <section className="space-y-4">
                      <p className="font-display text-2xl text-white/90">1 · Su equipo</p>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Campo id="desafio-equipo" label="Nombre del equipo" error={err('equipo')}>
                          <input
                            id="desafio-equipo"
                            className={INPUT}
                            value={d.equipo}
                            onChange={(e) => set('equipo', e.target.value)}
                            placeholder="Los Galácticos de Sunchales"
                            autoComplete="organization"
                            aria-invalid={!!err('equipo')}
                            aria-describedby={err('equipo') ? 'desafio-equipo-error' : undefined}
                          />
                        </Campo>
                        <Campo id="desafio-contacto" label="¿Quién organiza?" error={err('contacto')}>
                          <input
                            id="desafio-contacto"
                            className={INPUT}
                            value={d.contacto}
                            onChange={(e) => set('contacto', e.target.value)}
                            placeholder="Nombre y apellido"
                            autoComplete="name"
                            aria-invalid={!!err('contacto')}
                            aria-describedby={err('contacto') ? 'desafio-contacto-error' : undefined}
                          />
                        </Campo>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-start">
                        <fieldset>
                          <legend className="kicker mb-2 text-white/70">Te respondemos por</legend>
                          <div className="flex gap-2">
                            {(['whatsapp', 'instagram'] as Medio[]).map((m) => (
                              <label
                                key={m}
                                className={cn(
                                  'cursor-pointer rounded-full border px-4 py-3 font-sub text-xs uppercase tracking-[0.15em] transition-colors has-focus-visible:ring-2 has-focus-visible:ring-crema',
                                  d.medio === m ? 'border-crema bg-crema text-ink-950' : 'border-white/15 text-white/70 hover:border-crema/60',
                                )}
                              >
                                <input
                                  type="radio"
                                  name="medio"
                                  value={m}
                                  checked={d.medio === m}
                                  onChange={() => setD((p) => ({ ...p, medio: m, dato: '' }))}
                                  className="sr-only"
                                />
                                {m === 'whatsapp' ? 'WhatsApp' : 'Instagram'}
                              </label>
                            ))}
                          </div>
                        </fieldset>
                        <Campo id="desafio-dato" label={d.medio === 'whatsapp' ? 'Su WhatsApp' : 'Su Instagram'} error={err('dato')}>
                          <input
                            id="desafio-dato"
                            className={INPUT}
                            value={d.dato}
                            onChange={(e) => set('dato', e.target.value)}
                            placeholder={d.medio === 'whatsapp' ? '3493 15 123456' : '@suequipo'}
                            inputMode={d.medio === 'whatsapp' ? 'tel' : 'text'}
                            autoComplete={d.medio === 'whatsapp' ? 'tel' : 'off'}
                            autoCapitalize="off"
                            aria-invalid={!!err('dato')}
                            aria-describedby={err('dato') ? 'desafio-dato-error' : undefined}
                          />
                        </Campo>
                      </div>
                    </section>

                    {/* 2. Cuándo */}
                    <section className="space-y-4">
                      <p className="font-display text-2xl text-white/90">2 · Cuándo</p>
                      <div className="space-y-2">
                        {d.fechas.map((f, i) => (
                          <Campo
                            key={i}
                            id={`desafio-fecha-${i}`}
                            label={i === 0 ? 'Fecha' : 'Otra fecha posible'}
                            error={i === d.fechas.length - 1 ? err('fechas') : undefined}
                          >
                            <div className="flex gap-2">
                              <input
                                id={`desafio-fecha-${i}`}
                                type="date"
                                min={hoy}
                                className={cn(INPUT, '[color-scheme:dark]')}
                                value={f}
                                onChange={(e) => set('fechas', d.fechas.map((x, j) => (j === i ? e.target.value : x)))}
                                aria-invalid={!!err('fechas')}
                                aria-describedby={err('fechas') ? `desafio-fecha-${d.fechas.length - 1}-error` : undefined}
                              />
                              {i > 0 && (
                                <button
                                  type="button"
                                  onClick={() => set('fechas', d.fechas.filter((_, j) => j !== i))}
                                  className="shrink-0 rounded-xl border border-white/15 px-4 font-sub text-xs uppercase tracking-[0.15em] text-white/60 hover:text-white"
                                >
                                  Quitar
                                </button>
                              )}
                            </div>
                          </Campo>
                        ))}
                        {d.fechas.length < 2 && (
                          <button
                            type="button"
                            onClick={() => set('fechas', [...d.fechas, ''])}
                            className="font-sub text-xs uppercase tracking-[0.18em] text-crema hover:text-white"
                          >
                            + Agregar otra fecha
                          </button>
                        )}
                      </div>
                      <Opciones name="franja" legend="Horario" value={d.franja} onChange={(v) => set('franja', v)} opciones={FRANJAS} error={err('franja')} />
                    </section>

                    {/* 3. Dónde */}
                    <section className="space-y-4">
                      <p className="font-display text-2xl text-white/90">3 · Dónde</p>
                      <Opciones
                        name="cancha"
                        legend="Cancha"
                        value={d.cancha}
                        onChange={(v) => set('cancha', v)}
                        opciones={CANCHAS}
                        error={err('cancha')}
                        cols="sm:grid-cols-3"
                      />
                      {d.cancha === 'propia' && (
                        <Campo id="desafio-cancha-detalle" label="¿Qué cancha?" error={err('canchaDetalle')}>
                          <input
                            id="desafio-cancha-detalle"
                            className={INPUT}
                            value={d.canchaDetalle}
                            onChange={(e) => set('canchaDetalle', e.target.value)}
                            placeholder="Nombre del complejo y ciudad"
                            aria-invalid={!!err('canchaDetalle')}
                            aria-describedby={err('canchaDetalle') ? 'desafio-cancha-detalle-error' : undefined}
                          />
                        </Campo>
                      )}
                    </section>

                    {/* 4. Envío */}
                    <section className="space-y-4">
                      <p className="font-display text-2xl text-white/90">4 · Mandalo</p>
                      {valido ? (
                        <pre className="whitespace-pre-wrap rounded-2xl bg-crema p-5 font-sans text-sm leading-relaxed text-ink-950">{mensaje}</pre>
                      ) : (
                        <p className="rounded-2xl border border-dashed border-white/15 p-5 text-sm text-white/45">
                          Completá los datos y acá vas a ver el mensaje que nos llega.
                        </p>
                      )}
                      <div className="grid gap-3 sm:grid-cols-2">
                        {CLUB.contact.whatsapp && (
                          <a
                            href={wa ?? '#'}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => {
                              if (!listo()) return e.preventDefault();
                              track('desafio_enviado', { canal: 'whatsapp' });
                              setEnviado({ canal: 'whatsapp', copiado: false, mensaje });
                            }}
                            className="flex items-center justify-center gap-2 rounded-full bg-crema px-6 py-4 font-sub text-sm uppercase tracking-[0.2em] text-ink-950 transition-colors hover:bg-white"
                          >
                            Enviar por WhatsApp
                          </a>
                        )}
                        {LINK_IG_DM && (
                          <a
                            href={LINK_IG_DM}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => {
                              if (!listo()) return e.preventDefault();
                              const copia = copiar(mensaje);
                              track('desafio_enviado', { canal: 'instagram' });
                              setEnviado({ canal: 'instagram', copiado: null, mensaje });
                              copia.then((ok) => setEnviado((prev) => (prev ? { ...prev, copiado: ok } : prev)));
                            }}
                            className="flex items-center justify-center gap-2 rounded-full px-6 py-4 font-sub text-sm uppercase tracking-[0.2em] text-crema ring-1 ring-crema/60 transition-colors hover:bg-crema/10"
                          >
                            Enviar por Instagram
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-white/40">
                        Instagram no deja precargar mensajes: lo copiamos por vos y abrimos el chat de @{CLUB.contact.instagram}.
                      </p>
                    </section>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Exito({ enviado, onCerrar }: { enviado: NonNullable<Enviado>; onCerrar: () => void }) {
  const ig = enviado.canal === 'instagram';
  return (
    <div className="py-6 text-center">
      <p className="kicker text-crema">Desafío en camino</p>
      <h2 id="desafio-titulo" className="font-display mt-3 text-[clamp(3rem,9vw,5rem)] leading-[0.9] text-white">
        ¡Recibido el guante!
      </h2>
      <p className="mx-auto mt-4 max-w-md text-white/70">
        {!ig
          ? 'Se abrió WhatsApp con el mensaje listo: solo falta tocar enviar.'
          : enviado.copiado === null
            ? 'Copiando el mensaje…'
            : enviado.copiado
              ? `Copiamos el mensaje: pegalo en el chat de @${CLUB.contact.instagram} que se abrió y mandalo.`
              : `No pudimos copiarlo solo. Copialo de acá abajo y pegalo en el chat de @${CLUB.contact.instagram}.`}
      </p>
      {ig && enviado.copiado === false && (
        <textarea
          readOnly
          value={enviado.mensaje}
          rows={9}
          onFocus={(e) => e.currentTarget.select()}
          className="mx-auto mt-5 block w-full max-w-md rounded-2xl bg-crema p-4 text-left text-sm text-ink-950"
          aria-label="Mensaje del desafío para copiar"
        />
      )}
      <p className="mt-5 text-sm text-white/45">Te respondemos a la brevedad. Andá calentando.</p>
      <button
        type="button"
        onClick={onCerrar}
        className="mt-8 rounded-full bg-crema px-7 py-3.5 font-sub text-sm uppercase tracking-[0.2em] text-ink-950 hover:bg-white"
      >
        Listo
      </button>
    </div>
  );
}
