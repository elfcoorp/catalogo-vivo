import sharp from "sharp";
const T="C:/Users/PROPIE~1/AppData/Local/Temp/claude/C--Users-Propietario--claude/911a6a12-46c4-4afd-9598-40551dbbb1fd/scratchpad/";
const B={r:255,g:255,b:255};
/* se recorta POR DENTRO del marco negro: el marco lo pone ELFCO */
const dentro = await sharp(T+"plano-plano.png").extract({left:12,top:12,width:1476,height:951})
  /* el papel venía en 199 de tono. Se sube hasta blanco de verdad: así el
     parche donde iba la hoja quemada no se nota, y las cotas resaltan. */
  .linear(1.62,-70).toBuffer();

const tapa=(w,h)=>sharp({create:{width:w,height:h,channels:3,background:B}}).png().toBuffer();

const limpio = await sharp(dentro).composite([
  /* la hoja quemada de la esquina — abajo de ella solo hay papel en blanco */
  { input: await tapa(150,215), left:1326, top:0 },
  /* ⚠️ el sello de CIU: logo, dirección, teléfono, y el nombre del cliente
     (SAN ANTONIO HORTÍCOLA). Nada de eso se publica. */
  { input: await tapa(880,175), left:596, top:776 },
]).png().toBuffer();

await sharp(limpio).toFile(T+"limpio.png");
const m=await sharp(limpio).metadata();
/* rejilla para ubicar las cotas */
const W=m.width,H=m.height; let g="";
for(let x=0;x<=W;x+=50) g+=`<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${x%200?'#00bfff':'#ff0000'}" stroke-width="${x%200?0.7:1.4}" opacity="0.8"/>`;
for(let y=0;y<=H;y+=50) g+=`<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${y%200?'#00bfff':'#ff0000'}" stroke-width="${y%200?0.7:1.4}" opacity="0.8"/>`;
for(let x=0;x<=W;x+=200) for(let y=0;y<=H;y+=100)
  g+=`<text x="${x+3}" y="${y+14}" font-family="Arial" font-size="14" fill="#d00000" font-weight="bold">${x},${y}</text>`;
await sharp(limpio).composite([{input:Buffer.from(`<svg width="${W}" height="${H}">${g}</svg>`),top:0,left:0}]).png().toFile(T+"limpio-rejilla.png");
console.log("limpio: "+W+" x "+H);
