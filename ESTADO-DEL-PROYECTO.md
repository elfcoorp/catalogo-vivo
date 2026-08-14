# Estado del proyecto ELFCO — para continuar en un chat nuevo

> **Cómo usar esto:** en el chat nuevo dile a Claude:
> *"Lee `ESTADO-DEL-PROYECTO.md` en la raíz del proyecto y continúa desde ahí."*
> Todo lo de abajo ya está hecho, probado y publicado.

---

## 1. Quién es el dueño y cómo tratarlo

- **Eduardo Lozano Fimbres**, dueño de **ELFCO** (Ciudad Obregón, Sonora).
- Vende **maquinaria agroindustrial usada y nueva** para empaques de exportación
  de frutas y verduras: clasificadoras, cepilladoras, mesas de selección, tolvas,
  bandas, volteadoras de bins.
- **No es técnico.** Ve con dificultad y dicta por voz, así que sus mensajes a
  veces llegan cortados a media frase — cuando pase, pregúntale qué seguía.
- **Explícale simple, sin palabras técnicas.** Nada de inglés en lo que ve el
  cliente.
- **Prefiere lo más sencillo posible**: "entre menos botones que llenar, mejor".
- Su WhatsApp de negocio: `524521300840`.

---

## 2. Qué es el proyecto

Dos cosas dentro del mismo sitio:

| | Qué es | Dónde vive |
|---|---|---|
| **Catálogo** | Las 8 máquinas usadas que vende, con ficha, fotos, video y precio | `/` y `/producto/[slug]` |
| **Planeador** | Herramienta de levantamiento: ¿cabe la línea en el empaque del cliente? | `/planeador` |

- **Repositorio:** https://github.com/elfcoorp/catalogo-vivo
- **Sitio publicado:** https://catalogo-vivo-kappa.vercel.app
- **Se publica solo**: al hacer `git push origin main`, Vercel lo sube en 1-2 min.
- Next.js 16 + TypeScript + Tailwind. Sin base de datos: todo vive en `lib/`.

---

## 3. El catálogo — TERMINADO

### Las 8 máquinas (en `lib/productos.ts`)

| Máquina | Marca | Paso | Verificada |
|---|---|---|---|
| Calibrador 4 líneas x 12 salidas (tomate grape) | CIU | Rodillo 1¼" | Sí (falta el video) |
| Calibrador Cítricos | SIAI | 4 salidas 1ª + 4 de 2ª, inoxidable | Sí |
| Calibrador 6 líneas x 12 salidas | CIU | Charola 6" | Sí |
| Calibrador 2 líneas x 12 salidas | CIU | Rodillo 3¾" | Sí |
| Calibrador 4 líneas x 12 salidas (con peso) | CIU | Rodillo 4½" | Sí |
| Calibrador 4 líneas x 24 salidas | IDEPRO | Clip 3¾" | Sí |
| Volteadora de bins | Rochin | — | **No** |
| Calibrador pepino 2 líneas x 7 salidas | CIU | Charola 6" especial | **No** |

**REGLA IMPORTANTE:** el sello "Verificada" es un campo aparte (`verificada: true`),
**NO** se deduce de tener video. Significa que ELFCO ya vio y probó la máquina en
persona. Hay máquinas con video sin verificar, y verificadas sin video.

### Lo que ya tiene el catálogo

- **Tema oscuro** (fondo negro). Él lo escogió: resalta el verde y el logo.
- **Filtros laterales**: por fruta, tipo de copita, cómo clasifica, estatus.
- **Buscador** en la barra fija de arriba. Busca por el **inicio de cada palabra**
  y **la fruta manda**: "t" saca tomate, "p" pepino, "ce" cebolla, "ci" cítricos.
  Si lo escrito no es fruta (ej. "idepro"), busca en nombre, marca y paso.
- **Sello "Verificada"** en amarillo (`#f7c530`) sobre la foto.
- **Video de YouTube** incrustado en la galería de cada ficha.
- **Zona y flete** en cada ficha ("Noroeste de México · el flete se cotiza…").
- **3 idiomas** 🇲🇽 🇺🇸 🇧🇷 con banderita en la barra. La ficha técnica detallada y
  la frase de la marca **se quedan en español** — él ya lo sabe y lo aceptó.
- **Menú ☰** (arriba a la derecha) con: ¿Cabe en tu empaque? · Personaliza tu
  máquina · Vende tu máquina · Kit para vendedores · Liga para técnicos.
  Se cierra al tocar fuera. **NO lleva ✕** — se la quitó a propósito.
- **Versión para técnicos**: liga `?modo=tecnico` que esconde todo WhatsApp.
- **Sin vendedores dados de alta**: se quitó a Araceli (no vende), así que todos
  los "Lo quiero" llegan al WhatsApp de ELFCO.
- **Páginas aparte**: `/vender`, `/personaliza` (10 preguntas), `/vendedores`.

---

## 4. El planeador (`/planeador`) — EN PROCESO

### Para qué sirve

El vendedor está parado en el empaque del cliente y contesta **una sola pregunta:
¿cabe?**. El plano a detalle es **otra fase** (después del anticipo, con ingeniero).
Eduardo ya tiene ingeniero, renders y cortadora láser para esa fase — **no necesita
nada de eso de Claude**.

### Lo que ya funciona

1. **Dimensiones del empaque** (largo × ancho en metros).
2. **Fruta**, con **fotos en círculo** (tomate, morrón, pepino, cítricos, mango,
   aguacate, cebolla, papa).
3. **Armar la clasificadora**: copita → líneas → lado de las salidas.
4. **Listado "qué ya tiene / qué le ponemos"** por equipo, con su largo.
5. **Dibujo a escala** visto desde arriba, se arrastra con el dedo.
6. **Distancias a las 4 paredes** del módulo elegido, y se quedan al soltar.
7. **Las piezas se pegan solas** al acercarlas (imán de 22 cm).
8. **Se gira 90°** y **se voltea en espejo**.
9. **Dice "Sí cabe" / "Todavía no cabe"** + los m² ocupados.
10. **Manda el levantamiento por WhatsApp**, separado en tres listas.

### Las tres procedencias (importante)

| Origen | Color | ¿Se puede voltear en espejo? |
|---|---|---|
| Ya lo tiene el cliente | Verde `#2f9e44` | **No** — ya está construida |
| Usada de ELFCO | Azul `#1c7ed6` | **No** — se vende como está |
| Nueva a fabricar | Verde marca | **Sí** — se manda hacer |

Regla de él: *"las máquinas que ya tengo así se van a vender, pero las nuevas sí
se podrían cambiar los lados"*.

### Tabla real de copitas y salidas

Sacada de sus PDF `Salidas para CCO de rodillos.pdf` y `…de charolas.pdf`
(están en `C:\Users\Propietario\Downloads\`). Vive en `lib/dibujos.tsx` → `COPITAS`.

| Clip | Salidas a cada |
|---|---|
| 1¼" | 12½" · 15" · 18¾" · 22½" · 25" |
| 2¼" | 18" · 22½" · 27" · 36" |
| 3" | 18" · 21" · 24" · 27" · 30" · 36" |
| 3¾" | 22½" · 30" · 37½" · 45" · 48¾" · 60" |
| 4½" | 22½" · 27" · 36" · 45" · 54" |

| Charola | Salidas a cada |
|---|---|
| 6" | 22½" · 30" · 37½" · 45" |
| 7½" | 24" · 30" · 36" · 42" · 48" |
| 9" | 27" · 36" · 45" · 54" |

**Solo hay dos familias: clip y charola.** "Rodillo" es otro nombre para el clip;
él prefiere que se diga **clip**.

> ⚠️ **Pendiente de aclarar:** en el catálogo la IDEPRO dice `Clip 3¾"` y la de
> tomate roma dice `Rodillo 3¾"`. Si son mecánicamente distintas, hay que
> separarlas otra vez. Él todavía no lo confirma.

### Cómo se dibujan las máquinas

**NO se recortan de los planos.** Se **generan** por parámetros en `lib/dibujos.tsx`
(SVG a escala). Se intentó recortarlas de los PDF y **no sirvió**: los anchos no
coincidían entre máquinas de la misma línea, se colaban monitos y frutas del plano,
y las piezas chicas se veían como manchas blancas sin nombre.

Calibración: con 6 líneas × 12 salidas @ 36" la generada mide **15.37 × 4.32 m** y
la del plano real mide **15.34 × 4.35 m**.

---

## 5. LO QUE FALTA (por orden de importancia)

### 5.1 El flujo nuevo que él pidió — LO MÁS IMPORTANTE

Cambia el orden completo. Él lo explicó así: el vendedor llega al empaque,
**ve alrededor y va arrastrando todo lo que hay, SIN que se le pregunten medidas
todavía**. Ya que está todo puesto, **ahí sí** vienen las preguntas: *"la mesa de
selección #1, ¿de cuánto es?"*, *"la cepilladora #2, ¿de cuánto?"*.

El orden que quiere:
1. Dimensiones del empaque
2. Qué fruta
3. La clasificadora (clip/charola + salidas)
4. **Arrastra todo lo que veas** ← el cambio
5. **Ya puesto todo, las preguntas de medidas**
6. Acomodar

### 5.2 Ancho útil

**Solo se captura el ancho ÚTIL** (por donde pasa la fruta), no el total. Hay
máquinas muy robustas cuyo ancho total no tiene que ver con el paso de la fruta.
Palabras de él: *"ya si con el puro ancho útil no cabe, pues no cabe"*.

### 5.3 Faltan equipos de los layouts

Agregar todo lo que aparece en sus planos: **caseta de vigilancia**, transportador
de caja llena, transportador de caja vacía, volteadora de cajas, banda de cangilones,
tolvas, bandas de PVC. De cada uno se le preguntará **cuántos** y **ancho útil y
largo** de cada uno.

### 5.4 Calibrar el ancho según clip o charola

Él dice que **el clip hace la máquina más angosta y la charola más ancha**
(ejemplo suyo: clip 3¾" de 4 líneas ≈ 90 cm; charola 4½" con peso ≈ 1.20 m).
Ahorita todas usan **0.72 m por línea**, sacado del layout de charolas.
**Se puede medir en sus propios layouts** — no hace falta pedirle nada.

### 5.5 Otros pendientes chicos

- **El video de la tomate grape** — está marcada verificada pero falta el video.
- **Jalapeño** no venía en el folleto de CepaMex; se quitó de la lista de frutas.
- **Kit para vendedores** está visible al público: cuando dé de alta vendedores,
  cualquier cliente podrá ver sus nombres y WhatsApp. Ya se le avisó, él lo dejó así.

### 5.6 Cosas que él DESCARTÓ (no volver a proponerlas)

- **Postes** en el planeador — los pidió, luego dijo *"mejor quita los postes"*.
  Después dijo que podrían arrastrarse junto con desniveles, pero al final lo
  confirmó: **no van**.
- **Pestaña "Líneas nuevas a pedido"** — la quitó porque daba a entender que ELFCO
  es intermediario de otros fabricantes, y no quiere comunicar eso.
- **Renders 3D tipo CIU/SolidWorks** — Claude no los puede hacer. Él ya tiene
  ingeniero para eso. No insistir.
- **La ✕ para cerrar el menú** — no la quiere; se cierra tocando fuera.

---

## 6. Cosas técnicas que hay que saber

### Trucos que costó descubrir

1. **El servidor de desarrollo guarda caché vieja.** Muy seguido marca errores de
   variables que ya no existen aunque `npx tsc --noEmit` pase limpio.
   **`npm run build` es la prueba que vale.** Si sigue, borrar `.next` y reiniciar.

2. **Los campos de medida se guardan como TEXTO, no como número.** Si se guardan
   como número y se les pone `Math.max(1, …)` en el `onChange`, al borrarlos queda
   un "1" pegado que no se puede quitar. Le pasó dos veces y le molestó.

3. **El id se genera FUERA del actualizador de estado.** React corre el actualizador
   dos veces en desarrollo; si el id se genera adentro, el módulo se queda con un id
   y la selección con otro, y el panel de ajustes nunca abre.

4. **El dibujo se posiciona en PORCENTAJES, no en píxeles.** Medirlo con JavaScript
   dejaba la escala congelada al cambiar de pantalla (el `ResizeObserver` se anulaba
   solo porque el alto que observaba dependía de su propia medición).

5. **Las piezas chicas necesitan un mínimo de píxeles para agarrarse con el dedo.**
   Un poste de 30 cm a escala mide 3 px.

### Leer los PDF de Eduardo (muy útil)

Sus planos son **vectoriales**, así que se pueden leer y recortar sin AutoCAD
(su licencia de AutoCAD está bloqueada y **no la necesita**).

Herramienta ya instalada en:
`C:\Users\PROPIE~1\AppData\Local\Temp\claude\pdftool\` (paquete `mupdf` de npm)

- `node texto.mjs <pdf>` → saca el texto con sus coordenadas (ahí vienen las listas
  de partes con medidas)
- `PAG=<n> node render.mjs <pdf> <salida.png> <dpi> [x0 y0 x1 y1]` → renderiza o
  recorta (las coordenadas van en puntos del PDF)

PDFs útiles en `C:\Users\Propietario\Downloads\`:
`LINEA CHAROLAS 6 x 12+1 10-2025.pdf` · `4 x 24 layout.PDF` · `LINEA 4x12.pdf` ·
`Chile Morron 6 Lineas .pdf` · `Cítricos .pdf` · `DESCANICADOR.pdf` ·
`Salidas para CCO de rodillos.pdf` · `Salidas para CCO de charolas.pdf` ·
`CATALOGO CepaMex DE CEPILLOS.pdf` (las fotos de fruta están en la penúltima hoja)

### Permisos

Las fotos de fruta salen del **catálogo de CepaMex**. **Eduardo confirmó que tiene
permiso** de ellos para usarlas.

---

## 7. Mapa de archivos

```
lib/config.ts        → marca, colores, WhatsApp, vendedores (vacío a propósito)
lib/productos.ts     → las 8 máquinas
lib/tipos.ts         → los campos de un producto (incluye `verificada`)
lib/i18n.tsx         → los textos en español, inglés y portugués
lib/traducciones.ts  → nombres de máquinas y frutas traducidos
lib/planeador.ts     → choques, imán, lista de equipos, resumen de WhatsApp
lib/dibujos.tsx      → los SVG generados (clasificadora, cepilladora, mesa, tolva)
lib/modo.ts          → la versión para técnicos
lib/youtube.ts       → saca el id del video

components/catalogo/Planeador.tsx       → toda la pantalla del planeador
components/catalogo/BarraSuperior.tsx   → barra fija: logo, buscador, menú
components/catalogo/CatalogoGrid.tsx    → el catálogo con filtros y buscador
components/catalogo/ProductoCard.tsx    → la tarjeta de cada máquina
components/catalogo/FormularioEmpaque.tsx → las 10 preguntas

public/frutas/       → las fotos de fruta (de CepaMex)
public/modulos/      → recortes viejos de los planos (YA NO SE USAN, se generan)
```

---

## 8. Cómo trabajar con él

- **Verifica siempre en el navegador antes de decir que algo funciona.** Él prueba
  todo en su teléfono y detecta lo que no se probó.
- **Súbelo seguido.** Él revisa en Vercel, no en local. Trabaja en tandas chicas.
- **No inventes datos** de máquinas, medidas ni precios. Si no los tienes, léelos
  de sus PDF o pregúntale.
- **Cuando algo esté mal hecho de tu parte, dilo claro.** Lo agradece más que las
  explicaciones largas.
- **Los `.pdf`, `.docx` y la carpeta `anuncios/` están en `.gitignore`** — son
  documentos de su negocio, no del sitio. No subirlos.
