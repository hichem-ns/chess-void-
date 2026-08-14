import { Chess } from "https://cdn.jsdelivr.net/npm/chess.js@1.0.0/+esm";

const game = new Chess();
const board = document.querySelector("#board");
const movesEl = document.querySelector("#moves");
const evalEl = document.querySelector("#eval");
const evalFill = document.querySelector("#evalFill");
const turnEl = document.querySelector("#turn");
const moveCount = document.querySelector("#moveCount");
const gameState = document.querySelector("#gameState");
const materialEl = document.querySelector("#material");
const voidMoveEl = document.querySelector("#voidMove");
const voidTextEl = document.querySelector("#voidText");
const threatText = document.querySelector("#threatText");
const statusEl = document.querySelector("#status");
let selected = null, flipped = false;

const glyph = {wp:"♙",wn:"♘",wb:"♗",wr:"♖",wq:"♕",wk:"♔",bp:"♟",bn:"♞",bb:"♝",br:"♜",bq:"♛",bk:"♚"};
const files = ["a","b","c","d","e","f","g","h"];
const values = {p:1,n:3,b:3,r:5,q:9,k:0};

function squares(){
  const out=[]; const f=flipped?[...files].reverse():files;
  const ranks=flipped?[1,2,3,4,5,6,7,8]:[8,7,6,5,4,3,2,1];
  for(const r of ranks) for(const file of f) out.push(file+r);
  return out;
}
function render(){
  board.innerHTML="";
  const legal = selected ? game.moves({square:selected,verbose:true}) : [];
  const targets = new Set(legal.map(m=>m.to));
  for(const sq of squares()){
    const el=document.createElement("div");
    const rank=Number(sq[1]), fileIndex=files.indexOf(sq[0]);
    el.className=`square ${((rank+fileIndex)%2===0)?"light":"dark"}`;
    if(sq===selected) el.classList.add("selected");
    if(targets.has(sq)) el.classList.add(game.get(sq)?"capture":"target");
    const p=game.get(sq);
    if(p) el.textContent=glyph[p.color+p.type];
    if((flipped?fileIndex===7:fileIndex===0)) { const c=document.createElement("span");c.className="coord";c.textContent=rank;c.style.color=p?"inherit":"";el.append(c); }
    el.addEventListener("click",()=>clickSquare(sq));
    board.appendChild(el);
  }
  updateStats();
}
function clickSquare(sq){
  const piece=game.get(sq);
  if(selected){
    try{
      const move=game.move({from:selected,to:sq,promotion:"q"});
      if(move){ selected=null; render(); return; }
    }catch(e){}
    selected = piece && piece.color===game.turn() ? sq : null;
  } else if(piece && piece.color===game.turn()) selected=sq;
  render();
}
function updateStats(){
  const history=game.history({verbose:true});
  movesEl.innerHTML = history.length ? history.map((m,i)=>i%2===0
    ? `<div class="move"><span>${Math.floor(i/2)+1}.</span><b>${m.san}</b><span></span></div>`
    : `<div class="move"><span></span><b>${m.san}</b><span></span></div>`).join("")
    : `<div class="empty">No moves yet.<br>Break the silence.</div>`;
  turnEl.textContent=game.turn()==="w"?"WHITE":"BLACK";
  moveCount.textContent=String(history.length).padStart(2,"0")+" MOVES";
  if(game.isGameOver()){ gameState.textContent=game.isCheckmate()?"CHECKMATE":"POSITION CLOSED"; statusEl.textContent="CHAOS"; }
  else { gameState.textContent=game.inCheck()?"CHECK":"LIVE POSITION"; statusEl.textContent=game.inCheck()?"ALERT":"CALM"; }
  const score=materialScore();
  const display=Math.max(-9,Math.min(9,score));
  evalEl.textContent=(display>=0?"+":"")+display.toFixed(1);
  evalFill.style.width=(50+display/18*50)+"%";
  evalFill.style.background=display>=0?"#b9ff3d":"#ff3d8d";
  materialEl.textContent=(score>=0?"+":"")+score.toFixed(1);
  const last=history.at(-1);
  if(last){ voidMoveEl.textContent=last.san; voidTextEl.textContent=last.captured?"A capture changes the geometry.":"The position has shifted. Look again."; }
  threatText.textContent=game.inCheck()?"KING UNDER DIRECT THREAT.":"No immediate check. The danger is positional.";
}
function materialScore(){
  let s=0;
  for(const sq of squares()){const p=game.get(sq);if(p)s+=(p.color==="w"?1:-1)*values[p.type];}
  return s;
}
document.querySelector("#newGame").onclick=()=>{game.reset();selected=null;render();};
document.querySelector("#flip").onclick=()=>{flipped=!flipped;render();};
window.addEventListener("keydown",e=>{if(e.key.toLowerCase()==="r"){game.reset();selected=null;render();}});
render();
