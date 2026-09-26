/**
 * Estado compartido del Hero, fuera de React (se escribe desde GSAP y se lee en el loop 3D).
 * Evita re-renders a 60fps: nadie hace setState con esto.
 */
export const heroState = {
  /** 0→1: recorrido del scroll dentro del Hero. */
  progress: 0,
  /** 0→1: animación de entrada después del preloader. */
  intro: 0,
  /** -1→1: posición normalizada del puntero (parallax/tilt del escudo). */
  px: 0,
  py: 0,
};
