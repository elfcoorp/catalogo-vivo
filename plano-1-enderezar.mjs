/**
 * Endereza la foto del plano de CIU.
 *
 * El problema: la hoja se fotografió un poco de lado, así que sale como
 * trapecio — un lado más alto que el otro. Un simple giro NO lo arregla.
 * Lo que lo arregla es una "homografía": se hallan las cuatro esquinas del
 * marco del plano y se estiran hasta formar un rectángulo perfecto.
 *
 * ⚠️ Esto NO inventa nada. Solo mueve los pixeles que ya estaban. Los números
 * del plano quedan tal cual — nomás derechos.
 */
import sharp from "sharp";
const T="C:/Users/PROPIE~1/AppData/Local/Temp/claude/C--Users-Propietario--claude/911a6a12-46c4-4afd-9598-40551dbbb1fd/scratchpad/";

const {data,info}=await sharp(T+"derecho.png").removeAlpha().raw().toBuffer({resolveWithObject:true});
const W=info.width,H=info.height,C=info.channels;
const lum=(x,y)=>{const i=(y*W+x)*C;return (data[i]*299+data[i+1]*587+data[i+2]*114)/1000;};

/* ¿es raya? oscuro aquí y oscuro a los lados, en el sentido de la raya */
const rayaH=(x,y)=>lum(x,y)<125 && lum(x-4,y)<160 && lum(x+4,y)<160;
const rayaV=(x,y)=>lum(x,y)<125 && lum(x,y-4)<160 && lum(x,y+4)<160;

/* Se busca la raya del marco entrando desde la orilla. La condición de que
   ATRÁS haya papel blanco es la que descarta la mesa oscura y la hoja quemada. */
function borde(dir){
  const p=[];
  /* ⚠️ La clave: el marco es una RAYA DELGADA — papel blanco de los DOS
     lados. Pidiendo nomás blanco de un lado, la mesa oscura y la hoja quemada
     se cuelan y tuercen todo. */
  if(dir==="arriba") for(let x=150;x<1040;x+=4)
    for(let y=30;y<450;y++) if(rayaH(x,y)&&lum(x,y-7)>165&&lum(x,y+7)>150){p.push([x,y]);break;}
  if(dir==="abajo") for(let x=150;x<1040;x+=4)
    for(let y=H-2;y>520;y--) if(rayaH(x,y)&&lum(x,y+7)>165&&lum(x,y-7)>150){p.push([x,y]);break;}
  if(dir==="izq") for(let y=250;y<750;y+=4)
    for(let x=2;x<400;x++) if(rayaV(x,y)&&lum(x-7,y)>165&&lum(x+7,y)>150){p.push([y,x]);break;}
  if(dir==="der") for(let y=250;y<750;y+=4)
    for(let x=W-45;x>900;x--) if(rayaV(x,y)&&lum(x+7,y)>165&&lum(x-7,y)>150){p.push([y,x]);break;}
  return p;
}
/* recta v = m*u + b, tirando los puntos que se salen */
function recta(p){
  let q=p;
  for(let vuelta=0;vuelta<6;vuelta++){
    const n=q.length,su=q.reduce((a,r)=>a+r[0],0),sv=q.reduce((a,r)=>a+r[1],0);
    const suv=q.reduce((a,r)=>a+r[0]*r[1],0),suu=q.reduce((a,r)=>a+r[0]*r[0],0);
    const m=(n*suv-su*sv)/(n*suu-su*su), b=(sv-m*su)/n;
    const d=q.map(r=>Math.abs(r[1]-(m*r[0]+b)));
    const s=Math.sqrt(d.reduce((a,x)=>a+x*x,0)/n);
    if(vuelta===5) return {m,b,n,s};
    q=q.filter((r,i)=>d[i]<Math.max(2.5,s*1.4));
    if(q.length<20) return {m,b,n,s};
  }
}
const A=recta(borde("arriba")), B=recta(borde("abajo"));
const I=recta(borde("izq")),    D=recta(borde("der"));
for(const [n,r] of [["arriba",A],["abajo",B],["izq",I],["der",D]])
  console.log(n.padEnd(7)+" "+r.n+" puntos  ·  desviación "+r.s.toFixed(1)+" px  ·  "+(Math.atan(r.m)*180/Math.PI).toFixed(2)+"°");

/* esquinas: donde se cruzan. Las verticales vienen como x = m*y + b */
function cruce(hor,ver){ const y=(hor.m*ver.b+hor.b)/(1-hor.m*ver.m); return [ver.m*y+ver.b, y]; }
const TL=cruce(A,I), TR=cruce(A,D), BR=cruce(B,D), BL=cruce(B,I);
console.log("esquinas:  TL "+TL.map(Math.round)+"   TR "+TR.map(Math.round)+"   BR "+BR.map(Math.round)+"   BL "+BL.map(Math.round));
const dist=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1]);
const aw=(dist(TL,TR)+dist(BL,BR))/2, ah=(dist(TL,BL)+dist(TR,BR))/2;
console.log("hoja: "+Math.round(aw)+" x "+Math.round(ah)+"   proporción "+(aw/ah).toFixed(3)+"   (una hoja 11x17 da 1.545)");

/* --- homografía: 8 incógnitas, 8 ecuaciones --- */
const DW=1500, DH=Math.round(DW*ah/aw);
const dst=[[0,0],[DW-1,0],[DW-1,DH-1],[0,DH-1]], src=[TL,TR,BR,BL];
const M=[],V=[];
for(let i=0;i<4;i++){
  const [u,v]=dst[i], [x,y]=src[i];
  M.push([u,v,1,0,0,0,-u*x,-v*x]); V.push(x);
  M.push([0,0,0,u,v,1,-u*y,-v*y]); V.push(y);
}
for(let c=0;c<8;c++){
  let p=c; for(let r=c+1;r<8;r++) if(Math.abs(M[r][c])>Math.abs(M[p][c])) p=r;
  [M[c],M[p]]=[M[p],M[c]]; [V[c],V[p]]=[V[p],V[c]];
  for(let r=0;r<8;r++){ if(r===c) continue; const f=M[r][c]/M[c][c];
    for(let k=c;k<8;k++) M[r][k]-=f*M[c][k]; V[r]-=f*V[c]; }
}
const h=V.map((v,i)=>v/M[i][i]); h.push(1);

/* --- estirar, tomando el color de en medio de los 4 pixeles vecinos --- */
const out=Buffer.alloc(DW*DH*3,255);
for(let v=0;v<DH;v++) for(let u=0;u<DW;u++){
  const w=h[6]*u+h[7]*v+1;
  const x=(h[0]*u+h[1]*v+h[2])/w, y=(h[3]*u+h[4]*v+h[5])/w;
  if(x<0||y<0||x>=W-1||y>=H-1) continue;
  const x0=x|0,y0=y|0,fx=x-x0,fy=y-y0,o=(v*DW+u)*3;
  for(let c=0;c<3;c++){
    const p=(yy,xx)=>data[(yy*W+xx)*C+c];
    out[o+c]=Math.round(p(y0,x0)*(1-fx)*(1-fy)+p(y0,x0+1)*fx*(1-fy)+p(y0+1,x0)*(1-fx)*fy+p(y0+1,x0+1)*fx*fy);
  }
}
await sharp(out,{raw:{width:DW,height:DH,channels:3}}).png().toFile(T+"plano-plano.png");
console.log("enderezado: "+DW+" x "+DH);
