import sharp from "sharp";
const f = "C:/Users/Propietario/Downloads/Tomate Cepillos Catalogp .jpeg";
const m = await sharp(f).metadata();
console.log(m.width, "x", m.height);
await sharp(f).extract({left:840,top:640,width:181,height:200}).resize({width:543}).toFile("C:/Users/PROPIE~1/AppData/Local/Temp/claude/C--Users-Propietario--claude/0b2ec765-a5cc-41ae-b075-0647959ed8f9/scratchpad/zoom.png");
console.log("ok");
