# Catálogo Vivo — guía para tu Claude Code

> Copia este prompt en tu **Claude Code** (o **Claude Cowork**):
> *"Descarga el proyecto de https://github.com/m4nueldeleon/catalogo-vivo y ayúdame a configurar mi Catálogo Vivo para mi negocio, siguiendo el CLAUDE.md."*
> Este archivo te dice, Claude, exactamente cómo ayudarle al dueño del negocio.

## Qué es esto
Un catálogo de productos o servicios, hecho en Next.js, que:
- se comparte con **un solo link** y está disponible **24/7**,
- se **descarga en PDF**,
- tiene un botón **"Lo quiero"** que abre **WhatsApp** con el mensaje ya escrito,
- da a cada **vendedor** su propia liga (`?v=nombre`) para saber quién trajo la venta.

No usa base de datos: todo vive en dos archivos de datos + imágenes en `public/`.

## Tu trabajo, Claude (en orden)

### 1. Configurar la marca → `lib/config.ts`
Pregúntale al dueño: nombre del negocio, una línea de qué vende y para quién,
ciudad, su WhatsApp (con código de país), sus colores (o deja los de ejemplo),
y su equipo de vendedores con WhatsApp. Escríbelo en `lib/config.ts`.
- El dueño también puede usar el **wizard** en `/configurar` y pegarte el resultado.

### 2. Cargar sus productos → `lib/productos.ts`
Cada producto/servicio sigue la **anatomía del que vende** (respetar SIEMPRE):
| Campo | Qué poner | Regla |
|---|---|---|
| `paraQuien` | El "trabajo" que resuelve y para quién | Empieza por el cliente, no por la ficha técnica |
| `beneficio` | El resultado que se lleva | Resultado, no característica |
| `caracteristicas` | Máximo **3** datos que importan | Nunca llenar de especificaciones |
| `precio` / `precioAntes` | Precio actual y el de lista (ancla) | El tachado hace ver el actual como oferta |
| `facilidades` | Pagos, apartado | Quita el miedo al gasto |
| `bono` | Lo que incluye además | "Además te llevas…" |
| `escasez` | Por tiempo o unidades, **honesta** | Jamás inventar escasez falsa |
| `prueba` | Testimonio, número o marca | Da confianza |
- Deja **3 a 6 productos por categoría** y marca uno como `destacado: true` (el más pedido).
- **Voz humana, en español, sin palabras rebuscadas ni en inglés.** Nada de relleno.

### 3. Limpiar y mejorar las fotos
El dueño pone sus fotos (del celular o la compu) en `fotos-crudas/`. Tú:
1. Si tienes herramientas de imagen, **quítales el fondo y mejora la luz**, y guárdalas
   en `public/productos/` con nombres simples (`vela.jpg`, `bolsa.jpg`).
2. Empareja tamaño y encuadre corriendo `npm run fotos` (usa `scripts/preparar-fotos.mjs`).
3. Pon esos nombres en `lib/productos.ts` (`imagen: "/productos/vela.jpg"`).
- Si aún no hay foto, el catálogo muestra un recuadro con la marca (no se rompe).
- Buenas fotos: fondo limpio, buena luz, y **el producto en uso** o con algo al lado
  para que se vea el tamaño real.

### 4. Probar y publicar
- Local: `npm install` y luego `npm run dev` → abre http://localhost:3000
- Antes de publicar, corre `npm run build` y arregla lo que marque.
- Publicar en Vercel: sigue el `README.md` (está explicado para principiantes).

## Reglas que NO se rompen
- **No inventes** datos, precios, testimonios ni escasez. Pregúntale al dueño.
- **Máximo 3 características** por producto. Menos vende más.
- Los números de WhatsApp van **solo con dígitos** y **código de país** (ej. `5213312345678`).
- No agregues base de datos ni servicios de pago salvo que el dueño lo pida.
- Mantén el español y la voz humana. Sin palabras en inglés en lo que ve el cliente.

## Mapa del proyecto
```
lib/config.ts       → la marca, colores, WhatsApp y vendedores
lib/productos.ts    → tus productos/servicios (la anatomía)
lib/whatsapp.ts     → arma el botón "Lo quiero" con el vendedor referido
app/page.tsx        → el catálogo (home)
app/producto/[slug] → la ficha de cada producto
app/vendedores      → el kit con la liga de cada vendedor
app/configurar      → el wizard (sin código)
app/imprimir        → la versión para PDF
scripts/preparar-fotos.mjs → empareja las fotos
```
