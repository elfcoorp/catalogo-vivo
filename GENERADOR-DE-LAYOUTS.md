# Generador de layouts a partir de los planos — arranque del trabajo

> **Léeme junto con `ESTADO-DEL-PROYECTO.md`.** Ese trae el catálogo y el
> planeador; este trae **solo** el generador de layouts, que es el trabajo
> que sigue.

---

## 1. El problema que hay que resolver

Eduardo (dueño de ELFCO) **paga entre $1,000 y $1,500 pesos por cada dibujo
en AutoCAD**. Necesita un layout para cada visita de venta, así que eso se
acumula. Además **su licencia de AutoCAD está bloqueada** — no puede ni abrir
los archivos.

**El objetivo:** que él pueda generar el layout de una línea, con las medidas y
las cotas a las paredes, sin pagar ese dibujo cada vez.

**Para qué sirve el layout:** es la **presentación que ve el cliente** en la
visita, para decirle *"aquí cabe, esto es lo que te estoy dando"*. Es lo que
decide la venta. **No** es plano de fabricación — ese viene después del
anticipo y lo hace su ingeniero.

Palabras de él, para calibrar el nivel:
> *"Acuérdate que esta empresa la queremos vender en ochenta, noventa millones
> de pesos."*
> *"Esto lo puedo presentar en una sala de juntas."*

---

## 2. Lo que ya se probó y FUNCIONA

### 2.1 Sus PDF de AutoCAD sí se pueden leer

**No hace falta AutoCAD.** Los PDF que salen de AutoCAD son **vectoriales**: se
pueden renderizar a cualquier resolución y recortar sin pixelearse.

Herramienta ya instalada (paquete `mupdf` de npm):
`C:\Users\PROPIE~1\AppData\Local\Temp\claude\pdftool\`

- `node texto.mjs <pdf>` → el texto con sus coordenadas (cuadros de máquinas,
  cotas). Ojo: algunos PDF traen el texto convertido a curvas y entonces no
  hay nada que leer.
- `PAG=<n> node render.mjs <pdf> <salida.png> <dpi> [x0 y0 x1 y1]` → renderiza
  o recorta. Las coordenadas van en **puntos del PDF**.

### 2.2 Se armó un layout con su máquina real

Del PDF `pepino PDF .pdf` (plano de CIU para Invernaderos Comitán) se extrajo
la vista en planta y se metió en una lámina de ELFCO con:
- La nave a escala con su largo y ancho
- **Cotas de la máquina a las cuatro paredes**
- El cuadro de máquinas numerado
- Rótulo con la marca ELFCO, cliente, fruta, copita, salidas y fecha

Él lo aprobó: *"me estás convenciendo"*.

### 2.3 La máquina se puede ESTIRAR a otra configuración

Con **un solo plano por máquina** se pueden generar otras configuraciones. La
cuenta es:

```
Largo total = (número de salidas × separación) + la parte fija de los extremos
```

La parte fija (singulador, andamio, entrada, cajón de video, descarga) **se
despeja** del plano que él manda:

> Ejemplo real: la de pepino es **charola paso 6", 2 líneas × 12 salidas @ 24"**
> y la línea completa mide **16.27 m**.
> 12 × 24" = 7.32 m → **parte fija = 8.95 m**
> Pedida a **18 salidas @ 36"**: 18 × 36" = 16.46 m + 8.95 = **25.41 m**

Eso ya se generó y se ve bien.

---

## 3. El TECHO del método actual (importante)

Hoy se **recortan pedazos de imagen y se pegan**: cabeza + N módulos de salida.
Con eso:

- Los **empalmes entre módulos se notan** — hay monitos encimados.
- Se puede mejorar mucho afinando dónde se corta, pero **siempre habrá riesgo
  de costura**, porque son parches de imagen.
- **No se puede cambiar el número de líneas.** Si el plano es de 2 líneas y se
  pide de 4, eso es redibujar, no repetir un pedazo.

### Cómo se rompe ese techo: DXF

| | Qué es | Qué se puede hacer |
|---|---|---|
| **PDF** | Una **foto** del dibujo (vectorial, pero imagen) | Recortar y pegar. Se notan los cortes |
| **DXF** | Las **instrucciones** del dibujo: "raya de A a B", "rectángulo aquí" | **Redibujar la máquina completa**: sin costuras, a cualquier número de líneas |

Como la diferencia entre **la foto de un pastel y la receta del pastel**.

**Por eso hay que pedir PDF _y_ DXF.** Con PDF se llega a lo de ayer. Con DXF se
puede competir con el dibujo de $1,500.

---

## 4. LO QUE ÉL VA A ENTREGAR

Va a pasar layouts en PDF. De arranque:

1. **Tomate grape, clip 1¼", 4 líneas**
2. **Tomate grape, clip 1¼", 6 líneas**

> Se le habían pedido dos del mismo paso con distinto número de líneas (4 y 8)
> para deducir **cómo crece el ancho con las líneas**. **No tiene de 8 líneas
> — casi no se venden.** Con 4 y 6 hay que trabajar.

### Los 4 datos que se necesitan de CADA plano

Sin esto no se puede parametrizar. **Pedírselos siempre, y NO inventarlos.**

| Dato | Ejemplo |
|---|---|
| Qué copita y su paso | Charola paso 6" · Clip 1¼" |
| Cuántas **líneas** | 2 · 4 · 6 |
| Cuántas **salidas** trae ese dibujo | 12 |
| **A cada cuánto** están las salidas | 24" |

Y si se sabe: de qué lado salen, y si trae peso.

---

## 5. TAREAS, en orden

### 5.1 Recibir los dos planos de tomate grape clip 1¼" (4 y 6 líneas)
Confirmar que sean vectoriales (`texto.mjs` / `render.mjs`) y anotar sus 4 datos.

### 5.2 Deducir cómo crece el ancho con las líneas
Medir el ancho del cuerpo en el de 4 y en el de 6. Con esos dos puntos, sacar
la regla. **Esto es lo que falta desde ayer** y no se pudo resolver:

- Los anchos **0.60 / 0.90 / 1.20 / 1.80 m** (2/4/6/8 líneas) son de los
  **módulos** (cepilladoras, mesas, bandas), NO de la clasificadora.
- Del cuerpo de la clasificadora solo se tiene **1.343 m**, de la cota de 1343 mm
  del plano `LINEA CHAROLAS 6 x 12+1`.
- **CIU no va a dar la tabla** — venden máquinas, no comparten medidas de
  fabricación. No insistir por ahí. **Hay que medirlo en los planos.**

### 5.3 Afinar el corte de los módulos
Los empalmes se notan. Hay que encontrar el corte exacto de un módulo de salida
para que al repetirlo no se encimen los monitos.

### 5.4 Pedir los DXF y hacer el generador de verdad
Con DXF: leer los trazos y **regenerar** la máquina en vez de parcharla.
Ese es el camino para llegar al nivel del dibujo pagado.

### 5.5 Llegar a los ~9 planos
clip 1¼" · 2¼" · 3" · 3¾" · 4½" · charola 6" · 7½" · 9" · y las cepilladoras.
**Uno por tipo basta** — no hace falta uno por cada variación.

---

## 6. Detalles técnicos que costó descubrir (no repetir los errores)

### Las líneas se ven "como fotocopia con poca tinta"
**Causa:** renderizar el dibujo enorme y luego encogerlo. Las líneas del CAD son
finísimas y al reducir se rompen y se aclaran.
**Solución:** rasterizar el PDF **al tamaño final en que se va a ver**, no
grande para después encoger. Ayer: fue de 700 dpi a **160 dpi**, y quedó sólido.

### Salían 11 salidas en vez de 18
**Causa:** la tira armada quedó más alta que el contenedor y se cortó.
**Solución:** que el alto del contenedor cuadre con `cabeza + N × módulo`.

### Para la lámina en alta definición
`--force-device-scale-factor=2` en Edge headless. Da 2800 × 1800 px, que aguanta
proyector.

### El plano viene vertical en la hoja
Hay que acostarlo 90°. Se hace con un contenedor del tamaño final y la imagen
girada sobre su centro:

```html
<div style="width:ANCHO; height:ALTO; overflow:hidden; position:relative">
  <img style="position:absolute; left:50%; top:50%; width:ALTO; height:ANCHO;
              transform: translate(-50%,-50%) rotate(-90deg)">
</div>
```

---

## 7. Cómo tratarlo (y qué le molesta)

- **No es técnico**, ve con dificultad y dicta por voz: sus mensajes **se cortan
  a media frase**. Cuando pase, preguntarle qué seguía.
- **Explicarle simple**, sin palabras técnicas ni inglés.
- **Prefiere lo más sencillo:** *"entre menos botones que llenar, mejor."*

**Lo que más le molesta:**
1. **Que se le pregunte algo que ya dijo.** Por eso existen estos archivos.
2. **Que se le inventen medidas.** Van a acabar en cotizaciones de millones de
   pesos. Si no se tiene el dato, se le pregunta o se lee de sus documentos.
3. **Minimizar los problemas.** Ayer se le dijo que unos errores eran "leves" y
   él contestó: *"los errores de los bancos no se ven tan leves como los
   describes."* Tenía razón. **Decir los defectos completos, sin suavizarlos.**
4. **Rehacer trabajo ya hecho.** Antes de decir "se perdió", revisar `git log`.

**Verificar de verdad antes de decir que algo funciona.** Él prueba todo en su
teléfono y encuentra lo que no se probó. Ayer se le entregó una lámina con 11
salidas cuando había pedido 18, y él lo cachó.

---

## 8. Lo que NO se le prometió (mantenerlo así)

Él preguntó: *"si te sigo dando retroalimentación, ¿eres capaz de mejorarlo por
completo?"* y *"¿me lo prometes?"*.

**La respuesta que se le dio, y hay que sostenerla:**

- **No se le prometió** que los layouts queden igual que los de $1,500.
- Sí se le dijo, con seguridad: **van a quedar bastante mejor** que los de ayer.
- Con **DXF** tienen buena oportunidad de acercarse.
- Si van a quedar **igual de buenos, no se sabe** — depende del detalle del
  dibujo original y de qué tan bien salga el DXF.

**Consejo que se le dio:** que **no deje de pagar el dibujo todavía**. Primero
probar con dos o tres máquinas, comparar contra uno pagado, y que **él decida
con los dos enfrente**.

**No prometer más de eso.** Es lo que más confianza le da.

---

## 9. Dónde están sus archivos

En `C:\Users\Propietario\Downloads\`:

| Archivo | Qué trae |
|---|---|
| `pepino PDF .pdf` | Plano CIU completo. Charola paso 6", 2 líneas × 12 salidas @ 24", línea de 16.27 m |
| `LINEA CHAROLAS 6 x 12+1 10-2025.pdf` | **Trae lista de partes con medidas legibles.** Muy útil |
| `4 x 24 layout.PDF` | IDEPRO, 4 líneas × 24 salidas |
| `Salidas para CCO de rodillos.pdf` | **La tabla de salidas por paso de clip** |
| `Salidas para CCO de charolas.pdf` | **La tabla de salidas por paso de charola** |
| `LINEA 4x12.pdf` · `Chile Morron 6 Lineas .pdf` · `Cítricos .pdf` · `DESCANICADOR.pdf` · `Layout Linea de Tomate.pdf` | Más planos |

**Nota:** los `.pdf` están en `.gitignore` — son documentos de su negocio, no
del sitio. No subirlos al repositorio.
