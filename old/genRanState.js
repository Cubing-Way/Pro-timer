function generateRandomState() {
    const moves1 = ['U', 'D'];
    const moves2 = ['R', 'L']
    const moves3 = ['F', 'B']
    const moves = [moves1, moves2, moves3];
    const modifiers = ["'", '2', ''];
    
    let scramble = '';
    let lastMove;
    let moveGroup;
    let lastMoveGroup;
    let secondLastMoveGroup;

    for (let i = 0; i < 20 + Math.floor(Math.random() * 3); i++) {
        let move;
        let modifier;
        do {
            moveGroup = moves[Math.floor(Math.random() * moves.length)];
            move = moveGroup[Math.floor(Math.random() * moveGroup.length)];
        } while (move === lastMove || (moveGroup === lastMoveGroup && moveGroup === secondLastMoveGroup));  

        modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
        scramble += `${move}${modifier} `;

        secondLastMoveGroup = lastMoveGroup;
        lastMove = move;
        lastMoveGroup = moveGroup;
    }
    document.getElementById('scramble').textContent = scramble;
}

generateRandomState()