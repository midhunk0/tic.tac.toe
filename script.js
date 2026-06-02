// @ts-nocheck
let index=0;
let gameOver=false;
let gameMode="twoPlayer";
let computerThinking=false;
let computerMoveTimer=null;

// This array stores the current board. null means empty, "o" means O, and "x" means X.
const state=Array(9).fill(null);

// These are all possible winning lines on the board.
const wins=[
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

// Runs when a player clicks a box.
function add(id){
    if(gameOver || computerThinking) return;
    if(gameMode==="computer" && index%2!==0) return;
    if(state[id-1] !== null) return;

    // Decide whose symbol should be placed for this turn.
    const symbol=index%2===0 ? "o" : "x";
    placeMove(id, symbol);
    index++;

    // Stop here if this move ended the game.
    if(finishTurn(symbol)) return;

    updateTurnCard();

    // In computer mode, the computer always plays after O.
    if(gameMode==="computer" && symbol==="o"){
        computerThinking=true;
        computerMoveTimer=setTimeout(computerMove, 400);
    }
}

// Places the image in the selected box and saves the move in the state array.
function placeMove(id, symbol){
    const box=document.getElementById(`box${id}`);
    const image=document.createElement("img");

    image.src=`./${symbol}.png`;
    image.alt=symbol;
    image.className="img";

    box.appendChild(image);
    box.style.backgroundColor=symbol==="o" ? "#F44336" : "#009688";
    box.removeAttribute("onclick");
    state[id-1]=symbol;
}

// Checks whether the latest move caused a win or draw.
function finishTurn(symbol){
    if(isWin()){
        gameOver=true;
        stopBoard(symbol);
        showWin(symbol);
        return true;
    }

    if(isDraw()){
        gameOver=true;
        stopBoard("draw");
        showDraw();
        return true;
    }

    return false;
}

// Disables the board after the game is finished.
function stopBoard(result){
    updateTurnCard(result);

    document.querySelectorAll(".box").forEach(box=>{
        box.style.cursor="default";
        box.removeAttribute("onclick");
    });
}

// Shows the winner card below the board.
function showWin(symbol){
    setTimeout(()=>{
        const result=document.createElement("div");
        result.id="result";
        result.className=`status-card result-card ${symbol}-win`;
        result.innerHTML=`
            <span>Great game!</span>
            <strong>Player ${symbol.toUpperCase()} Wins!</strong>
        `;

        document.querySelector(".box0").insertAdjacentElement("afterend", result);

        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
        });
    }, 100);
}

// Shows the draw card below the board.
function showDraw(){
    setTimeout(()=>{
        const result=document.createElement("div");
        result.id="result";
        result.className="status-card result-card draw-result";
        result.innerHTML="<span>No winner this time</span><strong>Draw Game!</strong>";
        document.querySelector(".box0").insertAdjacentElement("afterend", result);
    }, 100);
}

// Makes the computer play as X.
function computerMove(){
    computerThinking=false;
    computerMoveTimer=null;

    if(gameOver) return;

    const move=getComputerMove();
    if(move===null) return;

    placeMove(move+1, "x");
    index++;

    if(finishTurn("x")) return;

    updateTurnCard();
}

// Picks the computer move: win, block, center, corner, then any empty box.
function getComputerMove(){
    const emptyPositions=state
        .map((cell, position)=>cell===null ? position : null)
        .filter(position=>position!==null);

    return findBestLineMove("x")
        ?? findBestLineMove("o")
        ?? (state[4]===null ? 4 : null)
        ?? [0, 2, 6, 8].find(position=>state[position]===null)
        ?? emptyPositions[0]
        ?? null;
}

// Finds a line where the selected symbol can win or must be blocked.
function findBestLineMove(symbol){
    for(const [a, b, c] of wins){
        const positions=[a, b, c];
        const line=positions.map(position=>state[position]);

        if(line.filter(cell=>cell===symbol).length===2 && line.includes(null)){
            return positions[line.indexOf(null)];
        }
    }

    return null;
}

// Returns true when any winning line has three matching symbols.
function isWin(){
    return wins.some(([a, b, c])=>{
        return state[a] && state[a]===state[b] && state[a]===state[c];
    });
}

// Early draw: true when no winning line is still possible for either player.
function isDraw(){
    if(isWin()) return false;

    return !wins.some(([a, b, c])=>{
        const line=[state[a], state[b], state[c]];
        return !line.includes("o") || !line.includes("x");
    });
}

// Updates the top card to show the current turn or the game-over message.
function updateTurnCard(result){
    const card=document.getElementById("turnCard");
    if(!card) return;

    if(gameOver){
        card.classList.remove("o-turn", "x-turn", "draw-turn");

        if(result==="o"){
            card.classList.add("x-turn");
        }
        else if(result==="x"){
            card.classList.add("o-turn");
        }
        else{
            card.classList.add("draw-turn");
        }

        card.innerHTML=`<span>Game Over</span><strong>New Game?</strong>`;
        return;
    }

    const nextSymbol=index%2===0 ? "o" : "x";
    card.classList.remove("draw-turn");
    card.classList.toggle("o-turn", nextSymbol==="o");
    card.classList.toggle("x-turn", nextSymbol==="x");
    card.innerHTML=`<span>Current Turn</span><strong>Player ${nextSymbol.toUpperCase()}</strong>`;
}

// Changes between two-player mode and computer mode, then starts a fresh game.
function setMode(mode){
    gameMode=mode;
    document.getElementById("twoPlayerMode").classList.toggle("active", mode==="twoPlayer");
    document.getElementById("computerMode").classList.toggle("active", mode==="computer");
    reset();
}

// Clears the board and starts again.
function reset(){
    index=0;
    gameOver=false;
    computerThinking=false;
    clearTimeout(computerMoveTimer);
    computerMoveTimer=null;
    state.fill(null);

    document.querySelectorAll(".box").forEach((box, i)=>{
        box.innerHTML="";
        box.style.backgroundColor="#faebd7";
        box.style.cursor="pointer";
        box.setAttribute("onclick", `add(${i+1})`);
    });

    const result=document.getElementById("result");
    if(result) result.remove();

    updateTurnCard();
}
