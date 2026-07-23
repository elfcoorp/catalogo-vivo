# Catálogo Vivo 🌿

Tu catálogo de productos o servicios, **disponible las 24 horas** con un solo link,
descargable en **PDF**, con un botón **"Lo quiero"** que lleva directo a tu **WhatsApp**.
Hecho para negocios de 10 personas o menos. No necesitas saber programar.

**Así se ve:** un catálogo bonito con la marca, los colores y el WhatsApp de tu negocio.
Lo compartes por un link (bio de Instagram, estados de WhatsApp, grupos, QR) y tus
clientes piden con un botón. Cada vendedor tiene su propia liga.

---

## Lo que vas a lograr
1. Poner tu marca, tus colores y tu WhatsApp.
2. Subir tus productos o servicios (con fotos).
3. Publicarlo **gratis** en internet y quedarte con tu link.
4. Compartirlo y darle a cada vendedor su liga.

---

## Hay dos caminos

### 🟢 Camino fácil: con Claude Code (recomendado)
1. Descarga **Claude Code** en `claude.com/download` (pestaña *Code*).
2. Abre este proyecto con Claude Code.
3. Escríbele: **"Descarga el proyecto de https://github.com/m4nueldeleon/catalogo-vivo y ayúdame a configurar mi Catálogo Vivo siguiendo el CLAUDE.md"**.
4. Contéstale lo que te pregunte (tu negocio, tus productos, tus fotos) y él lo arma.

### 🔧 Camino a mano
1. Abre el archivo `lib/config.ts` y cambia el nombre, los colores y tu WhatsApp.
   (O entra al **wizard**: corre el proyecto y ve a `/configurar`; te da el texto listo para pegar.)
2. Abre `lib/productos.ts` y reemplaza los productos de ejemplo por los tuyos.
3. Sigue con "Tus fotos" y "Publícalo" aquí abajo.

---

## Paso 1 · Probarlo en tu compu (opcional)
Si quieres verlo antes de publicar:
```bash
npm install
npm run dev
```
Abre `http://localhost:3000` en tu navegador. Ahí está tu catálogo.

## Paso 2 · Tus fotos
1. Mete las fotos de tus productos en la carpeta `fotos-crudas/`.
2. Corre `npm run fotos`. Quedan parejas y cuadradas en `public/productos/`.
3. En `lib/productos.ts` pon el nombre de cada foto (ej. `imagen: "/productos/vela.jpg"`).
> Para **quitarles el fondo** o mejorarles la luz, pídeselo a tu Claude Code.
> Tip de foto que vende: fondo limpio, buena luz, y el producto **en uso** o con algo
> al lado (una mano, una taza) para que se vea el tamaño real.

## Paso 3 · Publícalo gratis en internet (Vercel), desde cero
Vercel es una página que pone tu catálogo en internet **gratis**. Necesitas dos cuentas
gratuitas: **GitHub** (guarda tu proyecto) y **Vercel** (lo publica).

1. **Crea tu cuenta de GitHub** en `github.com` (es gratis). GitHub es como una nube
   donde vive tu proyecto.
2. **Sube este proyecto a GitHub.** La forma más fácil: pídele a tu Claude Code
   *"sube este proyecto a mi GitHub"*. (O usa GitHub Desktop: `desktop.github.com`.)
3. **Crea tu cuenta de Vercel** en `vercel.com` y entra con **"Continue with GitHub"**
   (así se conectan solas).
4. En Vercel da clic en **"Add New… → Project"**.
5. Te muestra tus proyectos de GitHub. Busca **catalogo-vivo** y dale **"Import"**.
6. No cambies nada. Da clic en **"Deploy"** y espera 1–2 minutos.
7. Cuando termine, Vercel te da tu **link** (algo como `tucatalogo.vercel.app`).
   **Ese es tu catálogo, ya vivo en internet.** 🎉

> ¿Quieres tu propio dominio (ej. `catalogo.tunegocio.com`)? En Vercel: **Settings →
> Domains**. Es opcional; el link `.vercel.app` ya funciona perfecto.

## Paso 4 · Compártelo
- **El link:** pégalo en tu bio de Instagram, tus estados y grupos de WhatsApp, tu firma
  de correo y en un **código QR** impreso.
- **PDF:** en tu catálogo, botón **"Descargar en PDF"** (o entra a `/imprimir`).
- **Tu equipo:** entra a `/vendedores`. Cada vendedor copia **su** liga (`?v=sunombre`) y
  su mensaje listo. Cuando un cliente da "Lo quiero", le escribe a esa persona.
- **Un empujón:** da un bono por comprar hoy (descuento, regalo, envío gratis).

---

## Cuando cambie tu catálogo
Edita `lib/productos.ts` (agrega, quita o cambia precios) y vuelve a subir a GitHub;
Vercel lo actualiza solo. Tu link es el mismo; los clientes siempre ven lo último.

## Preguntas frecuentes
- **¿Es gratis?** Sí, GitHub y Vercel tienen plan gratis suficiente para esto.
- **¿Necesito tarjeta?** No para publicar en Vercel gratis.
- **¿Y si no sé nada de esto?** Usa Claude Code: hace los pasos técnicos por ti.
- **¿Puedo vender servicios, no productos?** Sí, es igual: cada "producto" puede ser un
  servicio, un paquete o un taller.

---
Hecho con cariño para el **Club Sinergético** · Manuel de León.
