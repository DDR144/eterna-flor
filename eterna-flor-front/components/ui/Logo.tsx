/**
 * Marca de EternaFlor.
 *
 * El logotipo no es un símbolo más un nombre: la "o" final de EternaFlor *es*
 * la flor. Por eso hay un solo trazado de flor y todo lo demás se deriva de
 * él — el logotipo, el icono de la app y el favicon. Si cambia la flor, cambia
 * en un solo sitio.
 *
 * El tamaño de la flor se mide en `ex`, la altura de la x de la fuente, no en
 * `em`: así queda alineada con las minúsculas del nombre con cualquier
 * tipografía, sin números mágicos por fuente.
 */

/** Los cinco pétalos, compartidos por todas las formas de la marca. */
const PETALOS = [
  { cx: 16, cy: 7, r: 6.4 },
  { cx: 24.6, cy: 13.2, r: 6.4 },
  { cx: 21.3, cy: 23.3, r: 6.4 },
  { cx: 10.7, cy: 23.3, r: 6.4 },
  { cx: 7.4, cy: 13.2, r: 6.4 },
];

/**
 * La flor suelta. El centro va en `ink` siempre: sobre fondo oscuro se funde
 * con el fondo y la flor se lee como un anillo de pétalos, que además es
 * exactamente lo que necesita la "o".
 */
export function MarcaFlor({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <g className="fill-blossom">
        {PETALOS.map((p) => (
          <circle key={`${p.cx}-${p.cy}`} cx={p.cx} cy={p.cy} r={p.r} />
        ))}
      </g>
      <circle cx="16" cy="16" r="3.6" className="fill-ink" />
    </svg>
  );
}

/**
 * El icono de la app: la misma flor sobre el cuadrado redondeado.
 * Es lo que va en la pestaña del navegador y en la barra lateral colapsada.
 */
export function IconoMarca({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <rect width="32" height="32" rx="7" className="fill-ink" />
      <g className="fill-blossom">
        {PETALOS.map((p) => (
          <circle key={`${p.cx}-${p.cy}`} cx={p.cx} cy={p.cy} r={p.r} />
        ))}
      </g>
      <circle cx="16" cy="16" r="3.6" className="fill-ink" />
    </svg>
  );
}

/**
 * El logotipo completo: "EternaFl" + flor + "r".
 *
 * La flor se envuelve en un `span` para poder dimensionarla con `ex` sin
 * afectar el resto del texto. No se usa `aria-label` en el contenedor: el
 * texto real sigue siendo legible por un lector de pantalla.
 */
export function Logo({
  className = "",
  tamaño = "1em",
}: {
  className?: string;
  /** Tamaño del nombre. La flor escala con la altura de la x. */
  tamaño?: string;
}) {
  return (
    <span
      className={`whitespace-nowrap font-display leading-none font-semibold tracking-[-0.028em] ${className}`}
      style={{ fontSize: tamaño }}
    >
      EternaFl
      {/* La flor se alinea por línea base, no por caja: `vertical-align`
          negativo la centra en la banda de las minúsculas. */}
      <MarcaFlor className="mx-[0.03em] inline-block h-[1.14ex] w-[1.14ex] align-[-0.07ex]" />
      r
    </span>
  );
}
