# Lo que este proyecto le aporta al ERP de ELFCO

> **Aviso:** este documento sale del chat donde se construyó el **Catálogo Vivo**
> y el **planeador/generador de layouts**. **No es el contexto del ERP** — ese
> vive aparte. Aquí va solo lo que se aprendió aquí y que el ERP necesita,
> sobre todo para el **módulo de Layouts** y el de **Inventario de máquinas**.
>
> **Nada de esto está inventado:** todo salió de los documentos del dueño o de
> él mismo por voz, y se indica de dónde.

---

## 1. CORRECCIÓN IMPORTANTE — un dato que estaba mal

En las notas del ERP quedó anotado como dato confirmado:

> *"separación de salidas = 1828.8 mm (72") de centro a centro"*

**Eso NO es un estándar.** El dueño lo aclaró textualmente:

> *"Fue una fabricación especial que la quiso el cliente de esa manera. Como que
> tal vez quería poner dos personas en cada salida."*

**Por qué importa para el ERP:** 72" **no aparece** en las tablas de salidas de
ELFCO (la más grande es 60"). Si el ERP lo toma como estándar, va a calcular mal
el largo de las máquinas.

**Regla para el ERP:** las tablas de salidas son lo normal, **pero el sistema
debe permitir capturar una medida especial fuera de tabla**, porque sí se
fabrican a petición del cliente.

---

## 2. Cómo calcular el largo de una clasificadora (validado)

La fórmula que el ERP necesita para el módulo de Layouts:

```
Largo total = (número de salidas × separación) + parte fija de los extremos
```

La **parte fija** (singulador, andamio, entrada, cajón de video, descarga) se
despeja de un plano real que ya se tenga:

**Caso validado con el plano `pepino PDF .pdf`:**

| Dato | Valor |
|---|---|
| Máquina | Charola paso 6", **2 líneas × 12 salidas @ 24"** |
| Línea completa (cota del plano) | **16.27 m** |
| Corrida de salidas (12 × 24") | 7.32 m |
| **Parte fija despejada** | **8.95 m** |

Comprobación con otra configuración pedida por el dueño (18 salidas @ 36"):
18 × 36" = 16.46 m + 8.95 = **25.41 m**.

**Segundo caso, del plano `LINEA CHAROLAS 6 x 12+1`:**
12 salidas @ 36" = 10.97 m · clasificadora 15.34 m → **parte fija ≈ 4.37 m**
(aquí la cota es solo de la clasificadora, no de la línea completa).

> **Ojo:** la parte fija **no es la misma** si la cota abarca la línea completa
> o solo la clasificadora. El ERP debe guardar **qué abarca cada medida**.

---

## 3. Anchos — aquí se cometieron dos errores, que no se repitan

| Qué | Ancho | De dónde salió |
|---|---|---|
| **Módulos** (cepilladora, mesa de selección, bandas) | 2 líneas **0.60 m** · 4 líneas **0.90 m** · 6 líneas **1.20 m** · 8 líneas **1.80 m** | Dictado por el dueño. Es el ancho **ÚTIL**, por donde pasa la fruta |
| **Cuerpo de la clasificadora** | **1.343 m** (dato único, sin tabla por líneas) | Cota de 1343 mm del plano `LINEA CHAROLAS 6 x 12+1` |

**Los dos errores cometidos:**
1. Se sacó el ancho de la clasificadora multiplicando líneas × una cota
   interpretada a ojo → 6 líneas daban **4.35 m**. Esa cota de 4349 mm abarca la
   máquina **con sus tolvas de los dos lados**, no el cuerpo.
2. Después se puso el ancho de la clasificadora **igual al de los módulos** →
   2 líneas daban 0.60 m. **La clasificadora NO mide lo mismo que las
   cepilladoras.**

**El dueño confirmó que 8 líneas casi no se venden.** Para deducir cómo crece el
ancho hay que comparar planos de **4 y 6 líneas** del mismo paso.

**No pedirle la tabla a CIU:** el dueño dijo que no la van a dar —
*"ellos venden máquinas, no dan información confidencial... se presta para copia
o réplica."* **Hay que medirlo en los planos que él ya tiene.**

---

## 4. Tablas de salidas (confirmadas, de sus PDF)

Sacadas de `Salidas para CCO de rodillos.pdf` y `Salidas para CCO de charolas.pdf`.
Coinciden con lo que ya está en las notas del ERP; se repiten aquí porque el
módulo de Layouts las necesita cargadas:

| Clip / rodillo | Salidas posibles (pulgadas) |
|---|---|
| 1¼" | 12½ · 15 · 18¾ · 22½ · 25 |
| 2¼" | 18 · 22½ · 27 · 36 |
| 3" | 18 · 21 · 24 · 27 · 30 · 36 |
| 3¾" | 22½ · 30 · 37½ · 45 · 48¾ · 60 |
| 4½" | 22½ · 27 · 36 · 45 · 54 |

| Charola | Salidas posibles (pulgadas) |
|---|---|
| 6" | 22½ · 30 · 37½ · 45 |
| 7½" | 24 · 30 · 36 · 42 · 48 |
| 9" | 27 · 36 · 45 · 54 |

**Nomenclatura que prefiere el dueño:** solo existen **dos familias, clip y
charola**. "Rodillo" es otro nombre para el clip, y él prefiere que se diga
**clip**.

> ⚠️ **Pendiente de aclarar (viene de antes):** en el catálogo la máquina IDEPRO
> dice `Clip 3¾"` y la de tomate roma dice `Rodillo 3¾"`. Si son mecánicamente
> distintas, no se pueden juntar. El dueño no lo ha confirmado.

---

## 5. Módulo de Layouts — qué ya se probó que SÍ funciona

### 5.1 Los planos en PDF se leen sin AutoCAD

**Su licencia de AutoCAD está bloqueada** y no puede abrir los `.dwg`.
**No hace falta:** los PDF que salen de AutoCAD son **vectoriales** y se pueden
leer, medir y recortar.

> **Corrección técnica:** en las notas del ERP dice que los PDF se leen "vía Read
> tool". En este equipo **eso falló** (`pdftoppm is not installed`). Lo que sí
> funcionó fue instalar el paquete **`mupdf` de npm**. Herramienta ya armada en
> `C:\Users\PROPIE~1\AppData\Local\Temp\claude\pdftool\`.

### 5.2 Se generó un layout real y él lo aprobó

Del plano de pepino (CIU, para Invernaderos Comitán) se sacó la vista en planta y
se armó una lámina de ELFCO con la nave a escala, **cotas de la máquina a las
cuatro paredes**, cuadro de máquinas numerado y rótulo con la marca. Reacción del
dueño: *"me estás convenciendo"*.

### 5.3 Y se estiró a otra configuración

Se cortó el dibujo en módulos (cabeza + módulo de salida repetido) y se generó la
misma máquina a 18 salidas @ 36". **Con un solo plano por máquina se pueden
generar las demás configuraciones** — no hace falta un plano por variación.

**Serían ~9 planos en total:** clip 1¼" · 2¼" · 3" · 3¾" · 4½" · charola 6" ·
7½" · 9" · y las cepilladoras.

### 5.4 De cada plano se necesitan 4 datos

Sin esto no se puede parametrizar. **El ERP debe capturarlos en la ficha de
inventario:**

1. Qué copita y su paso
2. Cuántas **líneas**
3. Cuántas **salidas** trae ese dibujo
4. **A cada cuánto** están las salidas

---

## 6. El techo del método actual, y cómo se rompe (DXF)

Hoy se **recortan pedazos de imagen y se pegan**. Con eso:

- **Los empalmes se notan** — el dueño vio monitos encimados y lo señaló.
- **No se puede cambiar el número de líneas.** Si el plano es de 2 líneas y se
  pide de 4, eso es redibujar, no repetir un pedazo.

| | Qué es | Qué permite |
|---|---|---|
| **PDF** | Una **foto** del dibujo (vectorial, pero imagen) | Recortar y pegar. Se notan los cortes |
| **DXF** | Las **instrucciones**: "raya de A a B", "rectángulo aquí" | **Redibujar la máquina completa**: sin costuras, a cualquier número de líneas |

**Recomendación para el ERP:** pedirle al asistente que exporte **PDF _y_ DXF**
de cada plano. Con PDF se llega a lo que ya se vio; **con DXF el módulo de
Layouts puede competir con el dibujo pagado.**

### Cómo pedirlos (instrucción lista para el asistente)

> *"Antes de meterlos al USB, expórtalos desde AutoCAD a PDF (Archivo → Exportar
> → PDF). Si puedes, también en DXF. No me los pases solo en .dwg."*

Si ya llegaron en `.dwg`, hay salidas gratis: **ODA File Converter** o el visor
gratuito de Autodesk en internet.

---

## 7. Lo que NO se le prometió (sostenerlo)

El dueño preguntó directamente si los layouts van a quedar como los de
**$1,000–$1,500** que paga, y pidió una promesa.

**Lo que se le respondió, y hay que sostener:**
- **No se le prometió** que queden igual que los pagados.
- Sí se le dijo con seguridad: **van a quedar bastante mejor** que los primeros
  intentos.
- Con **DXF** tienen buena oportunidad de acercarse.
- Si van a quedar **igual de buenos, no se sabe** — depende del detalle del
  dibujo original.

**Consejo dado:** que **no deje de pagar el dibujo todavía**. Probar con dos o
tres máquinas, comparar contra uno pagado, y **que él decida con los dos
enfrente**.

---

## 8. Reglas de negocio que se confirmaron aquí (útiles para el ERP)

### 8.1 "Verificada" NO es lo mismo que "tiene video"

En el catálogo se había ligado el sello **Verificada** a que la máquina tuviera
video. **Está mal.** El dueño lo corrigió: verificada significa que **ELFCO ya la
vio y la probó en persona**. Hay máquinas con video sin verificar, y verificadas
a las que les falta el video.

**Para el ERP:** en la ficha de inventario deben ser **dos campos separados**.

Estado real hoy (dictado por él):
- **Verificadas:** tomate grape 4×12 (le falta el video) · Cítricos SIAI ·
  6 líneas ×12 · 2 líneas ×12 · 4 líneas ×12 con peso · IDEPRO 4×24
- **NO verificadas:** Volteadora de bins Rochin · Calibrador de pepino 2×7

### 8.2 Tres procedencias, y el espejo solo aplica a una

| Origen | ¿Se puede voltear en espejo? |
|---|---|
| Ya lo tiene el cliente | **No** — ya está construida |
| Usada de ELFCO | **No** — se vende como está |
| **Nueva a fabricar** | **Sí** — se manda hacer con las salidas del lado que se pida |

Palabras de él: *"las máquinas que ya tengo así se van a vender, pero las nuevas
sí se podrían cambiar los lados."*

**Para el ERP:** el cotizador debe distinguir esas tres procedencias.

### 8.3 El ancho de lo que ya tiene el cliente abre la venta del upgrade

Descubrimiento del dueño, muy valioso para el cotizador:

> Hay clientes que pusieron la cepilladora de **1.20 m** con clasificadora de
> **2 líneas** *a propósito*, pensando en crecer después. **Esa cepilladora ya
> les sirve para 6 líneas** — no se cambia, y el upgrade sale más barato.

**Para el ERP:** al capturar lo que el cliente ya tiene, el sistema debe avisar
**hasta cuántas líneas le alcanza cada pieza**, y cuáles se quedan cortas. Eso
es argumento de venta directo.

### 8.4 Solo se captura el ancho ÚTIL

Hay máquinas muy robustas cuyo ancho total no tiene que ver con el paso de la
fruta. Palabras de él: *"ya si con el puro ancho útil no cabe, pues no cabe."*

### 8.5 Ya no hay vendedores dados de alta

Araceli estaba dada de alta como vendedora en el catálogo y **no vende**. Se
quitó. Hoy **todos los "Lo quiero" llegan al WhatsApp del negocio**
(`524521300840`).

### 8.6 Existe una "liga para técnicos" sin contacto

El catálogo tiene un modo (`?modo=tecnico`) que **esconde todo botón y liga de
WhatsApp**. Sirve para compartir con técnicos aliados sin exponer el contacto.

> **Nota:** esto se parece mucho al **"catálogo mudo"** que ya está planeado en
> el módulo Marketplace del ERP. Vale la pena revisar si es la misma pieza.

---

## 9. Cómo trabaja el dueño (para el chat del ERP)

- **No es técnico**, ve con dificultad y **dicta por voz**: sus mensajes **se
  cortan a media frase**. Cuando pase, preguntarle qué seguía.
- Explicarle **simple**, sin palabras técnicas ni en inglés.
- Prefiere lo más sencillo: *"entre menos botones que llenar, mejor."*

**Lo que más le molesta:**
1. Que se le pregunte algo que **ya dijo**.
2. Que se le **inventen medidas** — van a acabar en cotizaciones de millones.
3. **Minimizar los problemas.** Se le dijo que unos errores eran "leves" y
   contestó: *"los errores de los bancos no se ven tan leves como los
   describes."* Tenía razón. **Decir los defectos completos.**
4. **Rehacer trabajo ya hecho.** Antes de decir "se perdió", revisar `git log`.

**Verificar antes de decir que algo funciona.** Él prueba todo en su teléfono y
encuentra lo que no se probó — cachó una lámina con 11 salidas cuando había
pedido 18.

---

## 10. Dónde están sus planos

En `C:\Users\Propietario\Downloads\`:

| Archivo | Qué trae |
|---|---|
| `pepino PDF .pdf` | Plano CIU completo. Charola paso 6", 2 líneas × 12 salidas @ 24", línea 16.27 m |
| `LINEA CHAROLAS 6 x 12+1 10-2025.pdf` | **Trae lista de partes con medidas legibles.** El más útil |
| `Salidas para CCO de rodillos.pdf` | La tabla de salidas por paso de clip |
| `Salidas para CCO de charolas.pdf` | La tabla de salidas por paso de charola |
| `4 x 24 layout.PDF` · `LINEA 4x12.pdf` · `Chile Morron 6 Lineas .pdf` · `Cítricos .pdf` · `DESCANICADOR.pdf` · `Layout Linea de Tomate.pdf` | Más planos |
| `CATALOGO CepaMex DE CEPILLOS.pdf` | Catálogo de cepillos. Las fotos de fruta salen de la penúltima hoja (el dueño confirmó que tiene permiso de CepaMex para usarlas) |

**Los `.pdf` y `.docx` están en `.gitignore`** — son documentos del negocio, no
del sitio. No subirlos al repositorio.
