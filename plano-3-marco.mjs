import sharp from "sharp";
const T="C:/Users/PROPIE~1/AppData/Local/Temp/claude/C--Users-Propietario--claude/911a6a12-46c4-4afd-9598-40551dbbb1fd/scratchpad/";
const VERDE={r:27,g:94,b:32}, HEX="#1b5e32", ANCHO=1600;

/* del limpio se toma solo donde hay dibujo: abajo quedó hueco al quitar el sello */
const RX=20, RY=20, RW=1436, RH=718;
const ESC=1536/RW, dw=Math.round(RW*ESC), dh=Math.round(RH*ESC);
const dib = await sharp(T+"limpio.png").extract({left:RX,top:RY,width:RW,height:RH})
  .resize(dw,dh,{kernel:"lanczos3"}).toBuffer();

const pad=14, cardX=(ANCHO-(dw+pad*2))/2|0, cardY=98, oX=cardX+pad, oY=cardY+pad;
const px=(x)=>Math.round((x-RX)*ESC+oX), py=(y)=>Math.round((y-RY)*ESC+oY);

/** Las cotas del plano de CIU, en el mismo lugar, nomás en metros.
 *  El plano dice "ACOTACIÓN: en mm", así que 18078.939 mm = 18.08 m. */
const COTAS=[
  { mm:18078.939, x:800,  y:361, grande:true },
  { mm: 6209.270, x:277,  y:280, gira:true, grande:true },
  { mm:33889.389, x:668,  y:107 },
  { mm:26370.000, x:196,  y:419 },
  { mm: 7826.581, x:185,  y:308 },
  { mm: 5062.150, x:1188, y:213 },
  { mm: 7063.085, x:1085, y:232, gira:true },
  { mm: 2696.869, x:1172, y:285, gira:true },
  { mm: 1200.000, x:352,  y:337, gira:true },
  { mm: 4547.990, x:1231, y:406 },
  { mm: 1559.528, x:1320, y:414 },
  { mm: 2954.834, x:1408, y:400 },
];
let sv="";
for(const c of COTAS){
  const t=(c.mm/1000).toFixed(2)+" m", X=px(c.x), Y=py(c.y);
  const fs=c.grande?30:17;
  /* ⚠️ el recuadro tiene que ser MÁS ANCHO que el número viejo del plano,
     si no se le asoma un pedazo por la orilla y se ve mugroso. */
  const w=Math.max(t.length*fs*0.60+(c.grande?24:12), c.grande?0:126), h=fs+(c.grande?16:8);
  sv+=`<g ${c.gira?`transform="rotate(-90 ${X} ${Y})"`:""}>
    <rect x="${X-w/2}" y="${Y-h/2}" width="${w}" height="${h}" rx="${c.grande?6:3}"
      fill="${c.grande?HEX:"#ffffff"}" stroke="${c.grande?HEX:"#9aa79c"}" stroke-width="1.2"/>
    <text x="${X}" y="${Y+fs*0.35}" font-family="Arial,Helvetica,sans-serif" font-size="${fs}"
      font-weight="bold" fill="${c.grande?"#ffffff":HEX}" text-anchor="middle">${t}</text></g>`;
}

/* --- tira de cotas principales --- */
const TIRA=[["LARGO DE LA CLASIFICADORA","18.08 m","59\u2032 4\u2033"],
            ["ANCHO","6.21 m","20\u2032 4\u2033"],
            /* ⚠️ NO es "largo total de la línea". Se midieron las puntas de
               cada raya de cota contra la escala del dibujo —que sale sola,
               contando cada cuántos pixeles se repiten las salidas de 27"— y
               salió que TODAS arrancan del MURO:
                  7826.581 = del muro a donde EMPIEZA la clasificadora
                 26370.000 = del muro a donde ACABA la clasificadora
                 18078.939 = la clasificadora sola (26.37-7.83 = 18.5 ≈ 18.08)
                 33889.389 = del muro al final de TODA la línea
               O sea: 7.83 m de pasillo MÁS la línea. Eduardo lo cachó. */
            ["DEL MURO AL FINAL DE LA LÍNEA","33.89 m","111\u2032 2\u2033"],
            ["SEPARACIÓN ENTRE SALIDAS","27\u2033","0.69 m"]];
const tiraH=106, cardH=dh+pad*2, tiraY=cardY+cardH+14, cw=(dw+pad*2)/TIRA.length;
let st=`<rect x="${cardX}" y="0" width="${dw+pad*2}" height="${tiraH}" fill="#ffffff"/>`;
TIRA.forEach((c,i)=>{
  const cx=cardX+cw*i+cw/2;
  if(i) st+=`<line x1="${cardX+cw*i}" y1="16" x2="${cardX+cw*i}" y2="${tiraH-16}" stroke="#d5ddd6" stroke-width="1.2"/>`;
  st+=`<text x="${cx}" y="31" font-family="Arial,Helvetica,sans-serif" font-size="13.5" font-weight="bold"
        fill="#5d6b60" letter-spacing="0.7" text-anchor="middle">${c[0]}</text>
       <text x="${cx}" y="73" font-family="Arial,Helvetica,sans-serif" font-size="36" font-weight="bold"
        fill="${HEX}" text-anchor="middle">${c[1]}</text>
       <text x="${cx}" y="93" font-family="Arial,Helvetica,sans-serif" font-size="14"
        fill="#7a8a7d" text-anchor="middle">${c[2]}</text>`;
});

/* --- marco de ELFCO, dibujado (el de antes venía de otra imagen de 1400) --- */
const ALTO=tiraY+tiraH+16+46;
const marco=`
 <rect x="0" y="0" width="${ANCHO}" height="80" fill="${HEX}"/>
 <text x="34" y="52" font-family="Arial,Helvetica,sans-serif" font-size="30" font-weight="bold"
   fill="#ffffff" letter-spacing="1.5">ELFCO</text>
 <text x="163" y="51" font-family="Arial,Helvetica,sans-serif" font-size="14" font-weight="bold"
   fill="#a9ccae" letter-spacing="2.4">TECNOLOGÍA POSCOSECHA</text>
 <text x="${ANCHO-34}" y="51" font-family="Arial,Helvetica,sans-serif" font-size="15" font-weight="bold"
   fill="#ffffff" text-anchor="end">Línea de empaque · clasificadora 4 líneas x 12 salidas por peso</text>
 <text x="34" y="${ALTO-17}" font-family="Arial,Helvetica,sans-serif" font-size="13" fill="#b9d3bd">
   Plano de referencia · uso exclusivo ELFCO · no apto para fabricación · escala original 1:100 · acotación original en mm</text>`;

await sharp({create:{width:ANCHO,height:ALTO,channels:3,background:VERDE}})
  .composite([
    { input:await sharp({create:{width:dw+pad*2,height:cardH,channels:3,background:{r:255,g:255,b:255}}}).png().toBuffer(), left:cardX, top:cardY },
    { input:dib, left:oX, top:oY },
    { input:Buffer.from(`<svg width="${ANCHO}" height="${ALTO}">${sv}</svg>`), left:0, top:0 },
    { input:Buffer.from(`<svg width="${ANCHO}" height="${tiraH}">${st}</svg>`), left:0, top:tiraY },
    { input:Buffer.from(`<svg width="${ANCHO}" height="${ALTO}">${marco}</svg>`), left:0, top:0 },
  ]).png().toFile(T+"PLANO-FINAL.png");
console.log("listo: "+ANCHO+" x "+ALTO);
