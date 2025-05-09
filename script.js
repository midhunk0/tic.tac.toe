// @ts-nocheck
let index=0, gameOver=false;
const state=Array(9).fill(null);
const wins=[
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8], 
    [0, 4, 8], [2, 4, 6]
];

function add(id){
    if(gameOver) return;

    const box=document.getElementById(`box${id}`);
    const symbol=index%2==0 ? "o" : "x";

    const image=document.createElement("img");
    image.src=`./${symbol}.png`;
    image.alt=symbol;
    image.className="img";
    box.appendChild(image);
    box.style.backgroundColor=symbol==="o" ? "#F44336" : "#009688";

    state[id-1]=symbol; 
    box.removeAttribute("onclick");
    index++;

    if(isWin()){
        gameOver=true;
        document.querySelectorAll(".box").forEach(box=>{
            box.style.cursor="default";
        })
        setTimeout(()=>{
            const result=document.createElement("div");
            result.id="result";
            result.innerHTML=`<div class="img-small"><img src="./${symbol}.png"/></div><h1> wins!</h1>`;
            const img=result.querySelector(".img-small");
            img.style.backgroundColor=symbol==="o" ? "#F44336" : "#009688"; 
            document.body.appendChild(result);
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
            });
        }, 100);
    } 
    else if(isDraw(state)){
        gameOver=true;
        setTimeout(()=>{
            const result=document.createElement("div");
            result.id="result";
            result.innerHTML="<h1>its a draw!</h1>";
            document.body.appendChild(result);
        }, 100);
    }
}

function isDraw(state){
    if(isWin(state)) return false;

    for(let [a, b, c] of wins){
        const line=[state[a], state[b], state[c]];
        const players=new Set(line.filter(cell=>cell!==null));
        
        if(players.size<=1 && line.includes(null)){
            return false; 
        }
    }

    return true;
}

function isWin(){
    return wins.some(([a, b, c])=>{
        return state[a] && state[a] === state[b] && state[a] === state[c];
    });
}

function reset(){
    index=0;
    gameOver=false;
    state.fill(null);

    document.querySelectorAll(".box").forEach((box, i)=>{
        box.innerHTML="";
        box.style.backgroundColor="#faebd7";
        box.style.cursor="pointer";
        box.setAttribute("onclick", `add(${i+1})`);
    })
    
    const result=document.getElementById("result");
    if(result) result.remove();
}