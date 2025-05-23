var direction = 'RIGHT'
var isMoving = false
var gameInterval
var score = 0
var directionQueue = []
var gameSpeed = 100
var time = 0

const scoreDisplay = document.getElementById('currentScore')

var gameContainer = document.getElementById('game-container')
var gameContainerClone = gameContainer.cloneNode(true)
const gameStyle = window.getComputedStyle(gameContainer)
const gameWidth = parseInt(gameStyle.width)
const gameHeight = parseInt(gameStyle.height)

snakeBody = []

// document.addEventListener('keydown', function(event){
//     switch (event.key){
//         case 'ArrowUp':
//             setDirection('UP')
//             break
//         case 'ArrowDown':
//             setDirection('DOWN')
//             break
//         case 'ArrowLeft':
//             setDirection('LEFT')
//             break
//         case 'ArrowRight':
//             setDirection('RIGHT')
//             break
//     }
// })

function eatFood(newLeft, newTop){
    const food = document.getElementById('food')
    const foodStyle = window.getComputedStyle(food)
    var foodLeft = parseInt(foodStyle.left)
    var foodTop = parseInt(foodStyle.top)

    var distanse = Math.sqrt(
        Math.pow((newLeft - foodLeft),2) +
        Math.pow(newTop - foodTop, 2)
    )
    if(distanse < 17){
        var validPositionFound = false;

        while (!validPositionFound) {
            var x = Math.floor(Math.random() * (gameWidth / 25));
            var y = Math.floor(Math.random() * (gameHeight / 25));

            var newFoodLeft = x * 25;
            var newFoodTop = y * 25;

            if (
                (newFoodLeft !== parseInt(foodStyle.left) || newFoodTop !== parseInt(foodStyle.top)) && 
                !isCollesionGlobal({ LEFT: newFoodLeft, TOP: newFoodTop }) 
            ) {
                validPositionFound = true;
                foodLeft = newFoodLeft;
                foodTop = newFoodTop;
            }
        }
        food.style.left = foodLeft + 'px'
        food.style.top = foodTop + 'px'
        
        score += 10
        scoreDisplay.innerText = score

        var snakeTale = document.createElement('div')
        snakeTale.className = 'snake'
        gameContainer.appendChild(snakeTale)
        snakeBody.push(snakeTale)

    }

}

function isCollesionGlobal(position){
    return snakeBody.some(part => {
        var partStyle = window.getComputedStyle(part);
        return (
            parseInt(partStyle.left) === position['LEFT'] &&
            parseInt(partStyle.top) === position['TOP']
        );
    });
}

function isCollesion(position, body){

    return body.some(part => {
        return (
            part[0] === position['LEFT'] &&
            part[1] === position['TOP']
        );
    });
}

function generateSnakeBody(headPosition, body) {
    if (body.length === 0) return body;

    var originLeft = headPosition['LEFT']
    var originTop = headPosition['TOP']
    body.forEach(part => {
        const partLeft = part[0];
        const partTop = part[1];

        part[0] = originLeft;
        part[1] = originTop;

        originLeft = partLeft;
        originTop = partTop;
    });

    return body;
}

function copyOf(list){
    var res = []
    list.forEach(l => {
        res.push([l[0], l[1]])
    })
    return res
}

function findShortestPath(snakePosition, snakeBodyList){
    const gameGrid = new Array(gameWidth / 25).fill(new Array(gameHeight / 25).fill(-1))
    const food = document.getElementById('food')
    const foodStyle = window.getComputedStyle(food)
    const foodPosition = {'LEFT': parseInt(foodStyle.left), 'TOP': parseInt(foodStyle.top)}
    var moves = ''
    var queue = [[moves, snakePosition, snakeBodyList]]
    var visited = []

    while(queue.length > 0){
        var top = queue.shift()
        var topPosition = top[1]
        const positionKey = pos => `${pos.LEFT},${pos.TOP}`;
        if(visited.includes(positionKey(topPosition))) continue
        var topMoves = top[0]
        var topBody = top[2]
        visited.push(positionKey(topPosition))
        if(topPosition['LEFT'] === foodPosition['LEFT'] && topPosition['TOP'] === foodPosition['TOP']){
            moves = topMoves
            break
        }

        var newPositions = [
            [
                topMoves + 'RIGHT,',
                {
                    'LEFT': (topPosition['LEFT'] + 25) % gameWidth, 
                    'TOP': topPosition['TOP']
                }
            ],
            [
                topMoves + 'LEFT,',
                {
                    'LEFT': (gameWidth + (topPosition['LEFT'] - 25)) % gameWidth,
                    'TOP': topPosition['TOP']
                }
            ],
            [
                topMoves + 'DOWN,',
                {
                    'LEFT': topPosition['LEFT'], 
                    'TOP': (topPosition['TOP'] + 25) % gameHeight
                }
            ],
            [
                topMoves + 'UP,',
                {
                    'LEFT': topPosition['LEFT'], 
                    'TOP': (gameHeight + (topPosition['TOP'] - 25)) % gameHeight
                }
            ]
        ]
        newPositions.forEach(pos => {
            pos.push(generateSnakeBody(topPosition, copyOf(topBody)))
        })

        newPositions.forEach(pos => {
            if(!isCollesion(pos[1], pos[2])){
                queue.push(pos)
            }
        })
    }
    console.clear()
    console.log(moves)
    return moves.split(',').filter(m => m !== '');
}

function BodyPositions(){
    var res = []
    snakeBody.forEach(part =>{
        const partStyle = window.getComputedStyle(part)
        res.push([parseInt(partStyle.left), parseInt(partStyle.top)])
    })
    return res
}

function Move(){
    
        time += gameSpeed
        const timer = document.getElementById('currentTime')
        timer.textContent = (time / 1000) + "Sec"

        const snake = document.getElementById('snake')
        const snakeStyle = window.getComputedStyle(snake)
        var snakeLeft = parseInt(snakeStyle.left)
        var snakeTop = parseInt(snakeStyle.top)

        if(directionQueue.length === 0){
            directionQueue = findShortestPath({'LEFT': snakeLeft, 'TOP': snakeTop}, BodyPositions())
        }

        var newDirection = directionQueue.shift()
        
        direction = getUpdatedDirection(direction, newDirection)
        rotate(direction)
    


    
        var newLeft = snakeLeft
        var newTop = snakeTop
        switch(direction){
            case 'RIGHT':
                newLeft = (snakeLeft + 25) % gameWidth
                break
            case 'LEFT':
                newLeft = (gameWidth + (snakeLeft - 25)) % gameWidth
                break
            case 'UP':
                newTop = (gameHeight + (snakeTop - 25)) % gameHeight
                break
            case 'DOWN':
                newTop = (snakeTop + 25) % gameHeight
                break
        }

        eatFood(newLeft, newTop);

        snake.style.left = newLeft + 'px'
        snake.style.top = newTop + 'px'
        
        if(snakeLeft !== newLeft || snakeTop !== newTop){
            var oldLeft = snakeLeft
            var oldTop = snakeTop
            snakeBody.forEach(part => {
                const partStyle = window.getComputedStyle(part)
                snakeLeft = parseInt(partStyle.left)
                snakeTop = parseInt(partStyle.top)
                part.style.left = oldLeft + 'px'
                part.style.top = oldTop + 'px'
                oldLeft = snakeLeft
                oldTop = snakeTop
            });
        }
        
        if(isCollesionGlobal({'LEFT': newLeft, 'TOP': newTop})){
            gameContainer.parentNode.replaceChild(gameContainerClone, gameContainer)
            gameContainer = document.getElementById('game-container')
            gameContainerClone = gameContainer.cloneNode(true)
            isMoving = false
            snakeBody = []
            score = 0
            direction = 'RIGHT'
            gameSpeed = 100
            time = 0
            return
        }
}

function getUpdatedDirection(currentDirection, newDirection) {
    const opposites = {
      'LEFT': 'RIGHT',
      'RIGHT': 'LEFT',
      'UP': 'DOWN',
      'DOWN': 'UP'
    };
  
    if (opposites[currentDirection] === newDirection){ return currentDirection; }
    return newDirection;
}

function rotate(direct){
    const snake = document.getElementById('snake')
    var degree = 0
    switch(direct){
        case 'LEFT':
            degree = 180
            break
        case 'RIGHT':
            degree = 0
            break
        case 'UP':
            degree = -90
            break
        case 'DOWN':
            degree = 90
            break
    }
    snake.style.transform = "rotate(" + degree + "deg)"
}

async function runInterval() {
    if(!isMoving) return
  await Move();
  setTimeout(runInterval, gameSpeed); 
}

function setDirection(newDirection){
    
    directionQueue.push(newDirection)

    if(!isMoving){
        isMoving = true
        const startLabel = document.getElementById('start-label')
        startLabel.remove()
        const gameSpeedSelect = document.getElementById('speedSelect')
        gameSpeed = 100 / gameSpeedSelect.value
        runInterval()
    }
}

