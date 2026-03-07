

## Plan: Agregar banner de Comparar Vehículos en la landing

### Ubicacion
Entre la seccion del inventario (linea 163) y el footer (linea 165) en `src/pages/Index.tsx` hay un espacio vacio. Ahi se insertara un componente tipo banner/CTA que invite al usuario a usar la herramienta de comparacion.

### Diseno
Un bloque ancho (`neu-card` o `neu-accent`) con:
- Icono de dos rectangulos lado a lado (representando comparacion)
- Titulo: "Compara modelos lado a lado"
- Subtitulo breve explicando la funcionalidad
- Boton/Link que lleva a `/comparar`
- Layout horizontal en desktop, vertical en movil
- Estilo coherente con el resto del sitio (tipografia uppercase, tracking-widest, rounded-2xl)

### Cambios
1. **`src/pages/Index.tsx`** — Insertar un `<section>` entre el cierre de la seccion de filtros+vehiculos y el `<FooterSection>`. Contendra un `Link` a `/comparar` con el diseno descrito, responsive con flex-col en movil y flex-row en desktop.

Un solo archivo, una sola insercion.

