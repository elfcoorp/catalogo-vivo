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

### Los anchos — LEER ESTO ANTES DE TOCAR NADA

Aquí me equivoqué **dos veces seguidas**. Que no vuelva a pasar:

| Qué | Ancho | De dónde salió |
|---|---|---|
| **Módulos** (cepilladora, mesa, bandas) | 2 líneas **0.60 m** · 4 líneas **0.90 m** · 6 líneas **1.20 m** · 8 líneas **1.80 m** | Se lo dictó Eduardo. Es el ancho **ÚTIL**, por donde pasa la fruta |
| **Cuerpo de la clasificadora** | **1.343 m** para todas | Cota de 1343 mm del plano `LINEA CHAROLAS 6 x 12+1` |

**Los dos errores que cometí:**
1. Saqué el ancho de la clasificadora multiplicando líneas × una cota que
   interpreté a ojo → una de 6 líneas daba **4.35 m**. La de 4349 mm abarca la
   máquina **con sus tolvas de los dos lados**, no el cuerpo.
2. Luego la puse igual a los módulos → una de 2 líneas daba **0.60 m**. **La
   clasificadora NO mide lo mismo que las cepilladoras.**

**El fabricante (CIU) no va a dar la tabla real** por líneas y por copita: venden
máquinas, no comparten medidas de fabricación. No insistir con eso. El ancho se
puede teclear en la pantalla si se conoce el de una máquina en concreto.

**El ancho automático es solo el punto de partida.** Cada pieza lleva su propio
ancho útil editable, porque:
- Lo que el cliente **ya tiene** trae su medida real.
- Hay clientes que pusieron la cepilladora de 1.20 m con clasificadora de 2
  líneas **a propósito**, pensando en crecer: esa cepilladora ya les sirve para
  6 y no se cambia — el upgrade sale más barato. El planeador ya avisa
  "alcanza hasta N líneas" o "se queda corta".
- Y se puede bajar el ancho de las mesas para abaratar una cotización.

### El largo

- **De cada equipo:** arranca **VACÍO**. Hay cepilladoras de muchos largos, no se
  vale inventar una medida que va a acabar en una cotización. La pieza avisa
  "falta ponerle el largo" y antes de mandar el levantamiento se listan las que
  siguen sin medir.
- **De la clasificadora:** se calcula solo, `(salidas × separación) + 2.2 m de
  entrada + 2.2 m de descarga`. Los 2.2 + 2.2 son **estimados míos**, pero
  cuadran: en el plano de charolas las salidas se llevan 10.97 m y la máquina
  completa mide 15.34 m — sobran 4.37 m contra los 4.40 m estimados.
  Eduardo describió que ahí van: singulador (**3.05 m**, confirmado en su
  cotización de morrón), otro singulador al que cae, y el cajón de video. No se
  pudo repartir con certeza entre esas tres partes.

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

## 5. LO QUE SIGUE — EL CAMBIO DE RUMBO (leer primero)

**Aquí es donde va el trabajo ahora.** Todo lo de arriba ya está hecho.

### 5.0 El layout final para el cliente — PRIMERA VERSIÓN YA HECHA

**Ya existe** en `components/catalogo/LayoutFinal.tsx`. Se abre con el botón
*"Ver el layout para el cliente"* (paso 7 del planeador) y trae:

- **El plano en UN SOLO SVG en metros** (no recuadros de HTML como el lienzo que
  se arrastra): así las cotas, las flechas y el texto salen parejos en pantalla
  y en el PDF, a cualquier tamaño de hoja.
- **Cota de cada máquina a su pared más cercana**, a lo largo y a lo ancho. Si la
  pieza está pegada a la pared (< 6 cm) no se acota: no hay nada que medir.
- **Globitos numerados** con guía, y la lista numerada abajo que les corresponde.
- **Ficha de la clasificadora**: copita, paso, líneas × salidas, lado y medida.
- **Barra de escala** gráfica (vale aunque la hoja se imprima de cualquier tamaño)
  y las medidas totales del piso.
- **Encabezado con la marca**, cliente (se teclea ahí), fruta y fecha.
- **Guardar en PDF** con `window.print()`.

**Cómo se imprime solo la hoja:** la capa se cuelga del `body` con un portal y le
pone la clase `con-layout-final`. En `globals.css`, dentro de `@media print`:
`body.con-layout-final > *:not(.capa-layout) { display: none }`. Sin eso, la
pantalla del vendedor se imprimía debajo. La hoja usa una **página con nombre**
(`@page hoja-apaisada`) para salir apaisada **sin** voltear el PDF del catálogo.

**Lo que falta preguntarle / pulir:**
- Si los números del plano se leen bien en su teléfono (van en metros del plano,
  a `tam/44`; si los quiere más grandes se cambia ahí nada más).
- Si quiere el logo más grande, o un cuadro de rótulo como los de IDEPRO.
- Si quiere que salga el precio o la cotización en la misma hoja.

Palabras de Eduardo, y tiene razón:

> *"Lo que está en el tabulador no es muy importante, podemos buscar algo más
> sencillo. Lo que necesitamos nosotros es la presentación final que el cliente
> va a ver."*

Se estuvo puliendo el dibujo **de la pantalla del vendedor** y ahí es donde salen
los puntitos que le dan desconfianza. Dijo, textual: *"no es para una empresa que
se va a vender en ochenta millones de pesos"*.

**El reparto correcto es:**

| | Cómo debe ser |
|---|---|
| **Pantalla del vendedor** | Herramienta de trabajo. Sencilla y rápida, aunque se vea tosca. La usa parado en el empaque |
| **Layout final para el cliente** | **Impecable.** Es lo que decide la venta |

**Lo que quiere de la presentación final:** que después de acomodar los módulos y
pasar las medidas, se genere **un layout en PDF** que muestre:
- El acomodo a escala
- **Las cotas de cada máquina a su respectiva pared**
- El clip / la charola y el paso
- Las medidas de cada pieza
- Con la marca ELFCO

O sea: algo como los planos de IDEPRO/CIU que él ya maneja, pero armado por el
vendedor en la visita. Ese es el entregable que el cliente ve.

**Nota:** ya existe `/imprimir` para el PDF del catálogo — ver si sirve de base.

### 5.1 El flujo de captura (ya implementado)

El vendedor llega al empaque, **va tocando todo lo que hay SIN que se le
pregunten medidas todavía**. Ya que está todo puesto, **ahí sí** vienen las
preguntas de cuánto mide cada cosa.

Orden de la pantalla:
1. Dimensiones del empaque
2. Qué fruta (con fotos)
3. Toca todo lo que veas en el empaque
4. **La clasificadora que le proponemos** (copita → líneas → lado → salidas)
5. Las medidas de cada pieza
6. Mándalo para cotizar
7. Ver el layout para el cliente

**La clasificadora va en el paso 4, NO al principio.** Razón de Eduardo: el
levantamiento se hace recorriendo el empaque y midiendo lo que el cliente ya
tiene; hasta que vio todo, decide qué clasificadora le conviene proponer.

### 5.1.1 Los grupos van por ETAPA DEL PROCESO, no por familia de máquina

Dictado por Eduardo, siguiendo el recorrido de la fruta:

| Etapa | Qué lleva |
|---|---|
| **Recepción** | Volteadora de bins · Volteadora de cajas · Vaciado manual · Banco para vaciar la caja · Tina de lavado · Banda de PVC |
| **Rezaga o desecho** | Las 3 mesas de selección manual · Descanicador de tubos · Descanicador en malla |
| **Lavado** | Cepilladora lavadora · secadora · enceradora |
| **Clasificación de segunda calidad** | Las 3 mesas otra vez · Banda de segunda calidad |
| **Transporte de caja llena y vacía** | Motorizado · De gravedad · De banda de PVC · De caja vacía |
| **Empaque y cajas** | Tolvas · Básculas · Bancos |
| **Otros equipos** | Lo que fue saliendo de otros grupos y él no mandó borrar |
| **Accesorios** | Caseta de vigilancia |

- **Rezaga va ANTES de lavado**: el descanicador saca la fruta muy chiquita, y
  no tiene caso lavarla, secarla ni encerarla si no tiene costo.
- **Las 3 mesas van repetidas a propósito** (rezaga y 2ª calidad). Cada pieza
  guarda su `etapa`, así el layout las distingue y cada botón lleva su
  propia numeración.
- Las 3 mesas son: **guía central**, **banda superior** y **con chutes**.
  Cada una es su propio botón con su propio dibujo — ya no se pregunta la
  guía aparte.

### 5.1.2 Los colores del layout del cliente

- **Lo que el cliente YA TIENE va en verde** (la pieza sale teñida).
- **Lo que le vende ELFCO se queda en blanco**, con su contorno de color.
- **Las cotas van en ROJO** (`#cc1111`).
- La lista de abajo va **separada en tres**: lo que ya tiene el cliente, lo
  usado de ELFCO y lo nuevo a fabricar, cada equipo con su número del plano
  y sus dos medidas.

### 5.2 Ancho útil

**Solo se captura el ancho ÚTIL** (por donde pasa la fruta), no el total. Hay
máquinas muy robustas cuyo ancho total no tiene que ver con el paso de la fruta.
Palabras de él: *"ya si con el puro ancho útil no cabe, pues no cabe"*.

### 5.3 Faltan equipos de los layouts

Ya entraron varios (transportador de caja llena y vacía, banda de cangilones,
tina de lavado, mesa de rodillos, descanicador, singulador, volteadora de cajas,
caseta de control). Falta revisar contra sus planos si queda alguno, y la
**caseta de vigilancia** que pidió expresamente.

### 5.4 Otros pendientes chicos

- **El video de la tomate grape** — está marcada verificada pero falta el video.
- **Jalapeño** no venía en el folleto de CepaMex; se quitó de la lista de frutas.
- **Kit para vendedores** está visible al público: cuando dé de alta vendedores,
  cualquier cliente podrá ver sus nombres y WhatsApp. Ya se le avisó, él lo dejó así.

### 5.5 Cosas que él DESCARTÓ (no volver a proponerlas)

- **Postes** en el planeador — los pidió, luego dijo *"mejor quita los postes"*.
  Después dijo que podrían arrastrarse junto con desniveles, pero al final lo
  confirmó: **no van**.
- **Pestaña "Líneas nuevas a pedido"** — la quitó porque daba a entender que ELFCO
  es intermediario de otros fabricantes, y no quiere comunicar eso.
- **Renders 3D tipo CIU/SolidWorks** — Claude no los puede hacer. Él ya tiene
  ingeniero para eso. No insistir.
- **La ✕ para cerrar el menú** — no la quiere; se cierra tocando fuera.
- **Pedirle la tabla de anchos a CIU** — no la van a dar. Venden máquinas, no
  comparten medidas de fabricación.
- **Recortar máquinas de los PDF** para usarlas como dibujo — ya se intentó y no
  sirvió (anchos que no empatan, monitos y frutas coladas, piezas chicas
  ilegibles). Las máquinas se **generan** por parámetros.
- **Pulir el dibujo de la pantalla del vendedor** — esa puede ser sencilla. El
  esfuerzo va en el layout final que ve el cliente.

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
components/catalogo/LayoutFinal.tsx     → la hoja limpia que ve el cliente (PDF)
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

### Lo que más le molesta (aprendido a la mala)

1. **Que le preguntes algo que ya te dijo.** Por eso existe este archivo. Léelo
   completo antes de preguntar.
2. **Que le inventes medidas.** Si un número va a acabar en una cotización de
   millones de pesos, o sale de sus documentos o se le pregunta. Si no se tiene,
   el campo va vacío y avisa que falta.
3. **Rehacer trabajo ya hecho.** Antes de decir "se perdió", revisar
   `git log` — casi siempre está ahí.

### Cómo verificar de verdad

- `npx tsc --noEmit` para los tipos, y **`npm run build` es la prueba que vale**.
- Probar en el navegador **antes** de decirle que algo funciona. Él prueba todo
  en su teléfono y encuentra lo que no se probó.
- Subir seguido, en tandas chicas. Él revisa en Vercel, no en local.
