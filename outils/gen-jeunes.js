// Génère les fichiers calendrier des jeûnes recommandés (dossier jeunes/).
// Usage : node outils/gen-jeunes.js   (à relancer une fois par an)
// Les règles sont lues directement dans index.html (FASTS, NOFAST, HM) : une seule source.
const fs=require("fs"),path=require("path");
const root=path.join(__dirname,".."),html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const cut=(a,b)=>html.slice(html.indexOf(a),html.indexOf(b));
const S={hadj:0},pad=n=>String(n).padStart(2,"0"),addDays=(d,n)=>new Date(d.getFullYear(),d.getMonth(),d.getDate()+n);
const R=(()=>eval(cut("const HM=","let HFMT")+cut("let HFMT","function hevents")+cut("const FASTS=","function nextFast")+";({HM,hparts,FASTS,NOFAST})"))();const{HM,FASTS,NOFAST}=R,hparts=R.hparts;
const slug=x=>x.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const YEARS=3,t0=new Date(),from=new Date(t0.getFullYear(),t0.getMonth(),t0.getDate()+1);
const loc=d=>d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate()),esc=x=>x.replace(/[\\,;]/g,m=>"\\"+m);
const stamp=new Date().toISOString().replace(/[-:]/g,"").slice(0,15)+"Z";
const fold=l=>{const b=Buffer.from(l,"utf8");if(b.length<=74)return l;const out=[];let cur="";for(const ch of l){if(Buffer.byteLength(cur+ch)>73){out.push(cur);cur=" "+ch}else cur+=ch}out.push(cur);return out.join("\r\n")};
function build(rules,name){const L=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Rahim//FR","CALSCALE:GREGORIAN","METHOD:PUBLISH",
  "X-WR-CALNAME:"+esc(name),"X-WR-TIMEZONE:Europe/Paris","REFRESH-INTERVAL;VALUE=DURATION:P7D","X-PUBLISHED-TTL:P7D"];let n=0;
  for(let i=0;i<365*YEARS;i++){const d=addDays(from,i),h=hparts(d);if(NOFAST(h))continue;const hit=rules.filter(f=>f[2](d,h)).map(f=>f[0]);if(!hit.length)continue;n++;
    const eve=addDays(d,-1),sum="Demain : jeûne recommandé ("+hit.join(", ")+")",
      desc=new Intl.DateTimeFormat("fr-FR",{weekday:"long",day:"numeric",month:"long"}).format(d)+" · "+h.d+" "+HM[h.m-1]+" "+h.y+". Pensez à l'intention et au suhoor.";
    L.push("BEGIN:VEVENT","UID:jeune-"+loc(d)+"@rahim","DTSTAMP:"+stamp,"DTSTART;TZID=Europe/Paris:"+loc(eve)+"T200000","DURATION:PT15M",
      "SUMMARY:"+esc(sum),"DESCRIPTION:"+esc(desc),"URL:https://imadmechri-ux.github.io/AppPriere/#calendrier",
      "BEGIN:VALARM","ACTION:DISPLAY","DESCRIPTION:"+esc(sum),"TRIGGER:PT0S","END:VALARM","END:VEVENT")}
  L.push("END:VCALENDAR");return{txt:L.map(fold).join("\r\n")+"\r\n",n}}
const out=path.join(root,"jeunes");fs.mkdirSync(out,{recursive:true});
const rules=FASTS.filter(f=>f[2]);
for(const f of rules){const r=build([f],"Rahim · "+f[0]);fs.writeFileSync(path.join(out,slug(f[0])+".ics"),r.txt);console.log(slug(f[0]),r.n)}
const r=build(rules.filter(f=>!/^Mois de/.test(f[0])),"Rahim · Jeûnes de la Sunna");fs.writeFileSync(path.join(out,"tous.ics"),r.txt);console.log("tous",r.n);
