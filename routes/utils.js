const pf = require('pathfinding')

const RIGHT = 'right'
const LEFT = 'left'
const UP = 'up'
const DOWN = 'down'

const HUNGRY_AT_HEALTH_OF = 60

function findHead(mySnake, otherSnakes) {
  for (var i = 0; i < otherSnakes.length; i++) {
      if (otherSnakes[i].id == mySnake.id) {
        return otherSnakes[i].coords[0]
      }
  }
  return []
}

function findClosestFoodAndPath(snakeHead, food, grid) {
  const finder = new pf.AStarFinder()
  var originalGrid = grid.clone()
  var shortestPath, path
  var closestFood, closestFoodLength = 100000

  for (var i = 0; i < food.length; i++) {
    path = finder.findPath(
      snakeHead[0],
      snakeHead[1],
      food[i][0],
      food[i][1],
      grid
    );

    if (path.length < closestFoodLength && path.length != 0) {
      shortestPath = path
      closestFoodLength = path.length
      closestFood = food[i]
    }
    grid = originalGrid.clone()
  }

  return {
    shortestPath: shortestPath,
    closestFood: closestFood
  }
}

function getDirection(from, to) {
  var x = to[0] - from[0]
  var y = to[1] - from[1]

  if (x == 1) {
    return RIGHT
  } else if (x == -1) {
    return LEFT
  } else if (y == -1) {
    return UP
  } else if (y == 1) {
    return DOWN
  }
}

function initGrid(data) {
  // create a data.height x data.width empty array
  // for example,
  // 0 0 0 0 0 0 0 0
  // 0 0 0 0 0 0 0 0
  // 0 0 0 0 0 0 0 0
  // 0 0 0 0 0 0 0 0
  // 0 0 0 0 0 0 0 0
  // 0 0 0 0 0 0 0 0
  var grid = Array(data.height).fill(null).map(
              () => Array(data.width).fill(null).map(
                () => 0))
  var x, y

  // make sure each snake's coord should be 1
  // for example,
  // 0 0 0 0 0 0 0 0
  // 0 0 0 1 0 0 0 1
  // 0 0 0 1 1 0 0 1
  // 1 1 0 1 1 0 0 0
  // 0 1 0 0 0 0 1 1
  // 0 0 0 0 0 0 1 1
  for (var i = 0; i < data.snakes.length; i++) {
    for (var j = 0; j < data.snakes[i].coords.length; j++) {
      x = data.snakes[i].coords[j][1]
      y = data.snakes[i].coords[j][0]
      grid[x][y] = 1
    }
  }

  return grid
}

function getPossibleMove(data) {
  var possibleMoves = []
  const myHead = findHead(data.mySnake, data.otherSnakes)
  
  if (
    myHead[1] + 1 >= 0 &&
    myHead[1] + 1 < data.grid.height &&
    data.grid.nodes[myHead[1] + 1][myHead[0]].walkable
  ) {
    // check if down is possible
    // console.log("down is possible")
    // console.log("x", myHead[1] + 1)
    // console.log("y", myHead[0])
    possibleMoves.push([myHead[0], myHead[1] + 1])
  }

  if (
    myHead[0] + 1 >= 0 &&
    myHead[0] + 1 < data.grid.width &&
    data.grid.nodes[myHead[1]][myHead[0] + 1].walkable
  ) {
    // check if right is possible
    // console.log("right is possible")
    // console.log("x", myHead[1])
    // console.log("y", myHead[0] + 1)
    possibleMoves.push([myHead[0] + 1, myHead[1]])
  }

  if (
    myHead[1] - 1 >= 0 &&
    myHead[1] - 1 < data.grid.height &&
    data.grid.nodes[myHead[1] - 1][myHead[0]].walkable
  ) {
    // check if up is possible
    // console.log("up is possible")
    // console.log("x", myHead[1] - 1)
    // console.log("y", myHead[0])
    possibleMoves.push([myHead[0], myHead[1] - 1])
  }

  if (
    myHead[0] - 1 >= 0 &&
    myHead[0] - 1 < data.grid.width &&
    data.grid.nodes[myHead[1]][myHead[0] - 1].walkable
  ) {
    // check for left
    // console.log("left is possible")
    // console.log("x", myHead[1])
    // console.log("y", myHead[0] - 1)
    possibleMoves.push([myHead[0] - 1, myHead[1]])
  }

  return possibleMoves
}

function checkIfItIsOthersDangerousZone(data, pt) {
  var possibleMoves
  var tempSnakeLength
  var copiedOfData = data
  var lengthOfOtherSnake = 0
  var itIsOthersDangerousZone = false

  for (var i = 0; i < copiedOfData.otherSnakes.length; i++) {
    copiedOfData.mySnake.id = copiedOfData.otherSnakes[i].id
    possibleMoves = getPossibleMove(copiedOfData)
    for (var j = 0; j < possibleMoves.length; j++) {
      if (possibleMoves[j][0] == pt[0] && possibleMoves[j][1] == pt[1]) {
        itIsOthersDangerousZone = true
        tempSnakeLength = copiedOfData.otherSnakes[i].coords.length
        if (tempSnakeLength > lengthOfOtherSnake) {
          lengthOfOtherSnake = tempSnakeLength
        }
      }
    }
  }

  return {
    itIsOthersDangerousZone: itIsOthersDangerousZone,
    lengthOfOtherSnake: lengthOfOtherSnake
  }
}

function findNextMove(data) {
  // For example,
  // [1, 1, 1, 1, 1, 1, 1, 1],
  // [1, 0, 0, 0, 0, 0, 0, 1],
  // [1, 0, 0, 0, 0, 0, 0, 1],
  // [1, 0, M, T, G, G, 0, 1],
  // [1, F, M, F, H, T, 0, 1],
  // [1, 0, M, 0, 0, 0, 0, 1],
  // [1, 0, M, 0, 0, 0, 0, 1],
  // [1, 0, H, 0, 0, 0, 0, 1],
  // [1, 1, 1, 1, 1, 1, 1, 1],

  // get all the possible moves first
  var possibleMoves = getPossibleMove(data)

  // check if it is someone else dangerous zone
  for (var i = 0; i < possibleMoves.length; i++) {
    var isItDangerousResult = checkIfItIsOthersDangerousZone(data, possibleMoves[i])
    if (isItDangerousResult.itIsOthersDangerousZone &&
      isItDangerousResult.lengthOfOtherSnake > data.otherSnakes[0].coords.length) {
      // it is indeed dangerous because their length is longer than my snake
      // remove that move since it is not safe
      possibleMoves.splice(i, 1)
    }
  }

  // check if we only have two possible moves left
  // use flood fill algorithm
    // check if one move has greater count than the other one
      // if true
        // remove that path since it is not safe

  // check if there is closest food and path
  if (data.closestFood !== undefined && data.shortestPath !== undefined) {
    if (data.otherSnakes[0].health_points < HUNGRY_AT_HEALTH_OF) {
      // I think we are hungry and we should go ahead and eat some food
      return getDirection(data.shortestPath[0], data.shortestPath[1])
    }
    // instead of eating right now, I think we can wait for a bit more
    return getDirection(data.otherSnakes[0].coords[0], possibleMoves[0])
  }

  return getDirection(data.shortestPath[0], data.shortestPath[1])
}

module.exports = {
  findHead: findHead,
  findClosestFoodAndPath: findClosestFoodAndPath,
  getDirection: getDirection,
  initGrid: initGrid,
  checkIfItIsOthersDangerousZone: checkIfItIsOthersDangerousZone,
  getPossibleMove: getPossibleMove,
  findNextMove: findNextMove
}
