import sharp from "sharp";
import { readdirSync } from "node:fs";
const D = "C:/Users/Propietario/Desktop/ERP ELFCO/san-antonio/fotos-listas/";
const S = "C:/Users/PROPIE~1/AppData/Local/Temp/claude/C--Users-Propietario--claude/0b2ec765-a5cc-41ae-b075-0647959ed8f9/scratchpad/";
const a = readdirSync(D).filter(n=>n.endsWith(".jpg")).sort();
const W=560, H=420, COLS=2;
const p=[];
for(let i=0;i<a.length;i++){
  const x=(i%COLS)*W, y=Math.floor(i/COLS)*H;
  p.push({input: await sharp(D+a[i]).resize(W-8,H-8,{fit:"cover"}).png().toBuffer(), left:x+4, top:y+4});
}
await sharp({create:{width:COLS*W,height:Math.ceil(a.length/COLS)*H,channels:3,background:"#fff"}})
  .composite(p).png().toFile(S+"sa-listas.png");
console.log("ok");
