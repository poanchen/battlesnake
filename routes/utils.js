const pf = require('pathfinding')

const RIGHT = 'right'
const LEFT = 'left'
const UP = 'up'
const DOWN = 'down'

const HUNGRY_AT_HEALTH_OF = 80

function findHead(mySnake, otherSnakes) {
  for (var i = 0; i < otherSnakes.length; i++) {
      if (otherSnakes[i].id == mySnake.id) {
        return otherSnakes[i].coords[0]
      }
  }

  return []
}

function getAllEnemiesHead(mySnake, otherSnakes) {
  var enemiesHead = []

  for (var i = 1; i < otherSnakes.length; i++) {
      enemiesHead.push(otherSnakes[i].coords[0])
  }

  return enemiesHead
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
    )

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
  var copiedOfData = Object.assign({}, data);
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

function useFloodFillAlgToDecideWhichWayIsBetter(data, possibleMoves) {
  var mapData = initGrid({
    width: data.grid.width,
    height: data.grid.height,
    snakes: data.otherSnakes
  }), countForFirstMove, countForSecondMove
  // find the closest enemy
  var closestEnemyHead = findClosestFoodAndPath(
                            data.otherSnakes[0].coords[0],
                            getAllEnemiesHead(data.mySnake, data.otherSnakes),
                            data.grid)

  // try to see if they could trap us
  if (closestEnemyHead.closestFood === undefined && closestEnemyHead.shortestPath === undefined) {
    // it seems like we are already trap?
    // try to find the best way to go
    floodFill(mapData, possibleMoves[0][1], possibleMoves[0][0], 0, 2)
    countForFirstMove = countSafeSpot(mapData, 2)

    mapData = initGrid({
      width: data.grid.width,
      height: data.grid.height,
      snakes: data.otherSnakes
    })

    floodFill(mapData, possibleMoves[1][1], possibleMoves[1][0], 0, 2)
    countForSecondMove = countSafeSpot(mapData, 2)
  } else {
    // could they potentially trap us?
    // let's find out
    // let's see if their next move would block us and eventually kill us
    // make sure we are we (maybe this is a bug?)
    data.mySnake.id = data.otherSnakes[0].id

    // this should probably be another functions?
    for (var i = 0; i < data.otherSnakes.length; i++) {
      if (
        data.otherSnakes[i].coords[0][0] == closestEnemyHead[0] &&
        data.otherSnakes[i].coords[0][1] == closestEnemyHead[1]
      ) {
        data.mySnake.id = data.otherSnakes[i].id
      }
    }

    var possibleMovesFromEnemy = getPossibleMove(data)
    var resultFromThePossibleMoves = [], c1, c2

    // find the worst case scenario and
    // and try to avoid that one
    for (var i = 0; i < possibleMovesFromEnemy.length; i++) {
      mapData = initGrid({
        width: data.grid.width,
        height: data.grid.height,
        snakes: data.otherSnakes
      })
      mapData[possibleMovesFromEnemy[i][1]][possibleMovesFromEnemy[i][0]] = 1

      // console.log(possibleMovesFromEnemy[i])
      floodFill(mapData, possibleMoves[0][1], possibleMoves[0][0], 0, 2)
      c1 = countSafeSpot(mapData, 2)
      // console.log(possibleMoves[0])
      // console.log(c1)
      floodFill(mapData, possibleMoves[1][1], possibleMoves[1][0], 0, 2)
      c2 = countSafeSpot(mapData, 2)
      // console.log(possibleMoves[1])
      // console.log(c2)

      resultFromThePossibleMoves.push({
        c1: c1,
        c2: c2
      })
    }

    var sumForC1 = 0, sumForC2 = 0

    for (var i = 0; i < resultFromThePossibleMoves.length; i++) {
      sumForC1 += resultFromThePossibleMoves[i].c1
      sumForC2 += resultFromThePossibleMoves[i].c2
    }

    var averForC1 = sumForC1 / resultFromThePossibleMoves.length
    var averForC2 = sumForC2 / resultFromThePossibleMoves.length

    var possibleTrapFromEnemy = {
      itIsPossible: false
    }

    for (var i = 0; i < resultFromThePossibleMoves.length; i++) {
      if (resultFromThePossibleMoves[i].c1*2 < averForC1) {
        possibleTrapFromEnemy.itIsPossible = true
        possibleTrapFromEnemy.index = i
      } else if (resultFromThePossibleMoves[i].c1 > averForC1*2) {
        possibleTrapFromEnemy.itIsPossible = true
        possibleTrapFromEnemy.index = i
      }

      if (resultFromThePossibleMoves[i].c2*2 < averForC2) {
        possibleTrapFromEnemy.itIsPossible = true
        possibleTrapFromEnemy.index = i
      } else if (resultFromThePossibleMoves[i].c2 > averForC2*2) {
        possibleTrapFromEnemy.itIsPossible = true
        possibleTrapFromEnemy.index = i
      }
    }

    if (possibleTrapFromEnemy.itIsPossible) {
      // it is possible to get trap from the enemy
      c1 = resultFromThePossibleMoves[possibleTrapFromEnemy.index].c1
      c2 = resultFromThePossibleMoves[possibleTrapFromEnemy.index].c2

      if (c1 > c2) {
        countForFirstMove = 100
        countForSecondMove = 0
      } else {
        countForFirstMove = 0
        countForSecondMove = 100
      }
    } else {
      // duplicate (should be merged)
      // not possible to trap
      // fall back to choose whichever has the
      // greatest count
      mapData = initGrid({
        width: data.grid.width,
        height: data.grid.height,
        snakes: data.otherSnakes
      })

      floodFill(mapData, possibleMoves[0][1], possibleMoves[0][0], 0, 2)
      countForFirstMove = countSafeSpot(mapData, 2)

      mapData = initGrid({
        width: data.grid.width,
        height: data.grid.height,
        snakes: data.otherSnakes
      })

      floodFill(mapData, possibleMoves[1][1], possibleMoves[1][0], 0, 2)
      countForSecondMove = countSafeSpot(mapData, 2)
    }
  }

  return [countForFirstMove, countForSecondMove]
}

// author name: MrPolywhirl
// author url: https://jsfiddle.net/user/MrPolywhirl/
// source code url: https://jsfiddle.net/MrPolywhirl/eWxNE/
function floodFill(mapData, x, y, oldVal, newVal) {
  const mapWidth = mapData.length,
    mapHeight = mapData[0].length
    
  if (oldVal == null) {
    oldVal = mapData[x][y]
  }
  
  if (mapData[x][y] !== oldVal) {
    return true
  }

  mapData[x][y] = newVal

  if (x > 0) {
    // left
    floodFill(mapData, x-1, y, oldVal, newVal)
  }

  if (y > 0) {
    // up
    floodFill(mapData, x, y-1, oldVal, newVal)
  }
  
  if (x < mapWidth-1) {
    // right
    floodFill(mapData, x+1, y, oldVal, newVal)
  }

  if (y < mapHeight-1) {
    // down
    floodFill(mapData, x, y+1, oldVal, newVal)
  }
}

function countSafeSpot(mapData, newVal) {
  var sum = 0
  const mapWidth = mapData.length,
    mapHeight = mapData[0].length

  for (var i = 0; i < mapHeight; i++) {
    for (var j = 0; j < mapWidth; j++) {
      if (mapData[i][j] == newVal) {
        sum++
      }
    }
  }

  return sum
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

  console.log("possible moves: " + possibleMoves)

  // check if it is someone else dangerous zone
  for (var i = 0; i < possibleMoves.length; i++) {
    var isItDangerousResult = checkIfItIsOthersDangerousZone(data, possibleMoves[i])
    if (isItDangerousResult.itIsOthersDangerousZone &&
      isItDangerousResult.lengthOfOtherSnake > data.otherSnakes[0].coords.length) {
      // it is indeed dangerous because their length is longer than my snake
      // remove that move since it is not safe
      possibleMoves.splice(i, 1)
      console.log("The move: " + possibleMoves[i] + "is dangerous!!!!!!!!!!")
    } else {
      console.log("The move: " + possibleMoves[i] + "is safe.")
    }
  }

  // check if we only have two possible moves left
  // if (possibleMoves.length == 2) {
  //   var ptForEachMoves = useFloodFillAlgToDecideWhichWayIsBetter(data, possibleMoves)
  //   // check if one move has greater count than the other one
  //   if (ptForEachMoves[0] < ptForEachMoves[1]) {
  //     // remove that path since it is not safe
  //     possibleMoves.splice(0, 1)
  //   } else {
  //     // remove that path since it is not safe
  //     possibleMoves.splice(1, 1)
  //   }
  // }

  // check if there is closest food and path
  if (data.closestFood !== undefined && data.shortestPath !== undefined) {
    if (data.otherSnakes[0].health_points < HUNGRY_AT_HEALTH_OF) {
      // I think we are hungry and we should go ahead and eat some food
      // but before we go ahead, let's see if it is safe to do so
      for (var i = 0; i < possibleMoves.length; i++) {
        if (possibleMoves[i][0] == data.shortestPath[0] &&
          possibleMoves[i][1] == data.shortestPath[1]) {
          // I think it is safe to eat
          console.log("The move: " + possibleMoves[i] + "is safe for eating.")
          return getDirection(data.shortestPath[0], data.shortestPath[1])
        }
        // seems like it will be too dangerous to eat the food
        // let's not do that
        console.log("The move: " + possibleMoves[i] + "is too dangerous, lets eat later.")
      }    
    } else {
      // instead of eating right now, I think we can wait for a bit more
      console.log("we are not hungry " + data.otherSnakes[0].health_points + " for now")
    }
  } else {
    console.log("No route to food has been found")
  }

  console.log("possibleMoves:" + possibleMoves)

  return getDirection(data.otherSnakes[0].coords[0], possibleMoves[0])
}

module.exports = {
  findHead: findHead,
  getAllEnemiesHead: getAllEnemiesHead,
  findClosestFoodAndPath: findClosestFoodAndPath,
  getDirection: getDirection,
  initGrid: initGrid,
  checkIfItIsOthersDangerousZone: checkIfItIsOthersDangerousZone,
  useFloodFillAlgToDecideWhichWayIsBetter: useFloodFillAlgToDecideWhichWayIsBetter,
  getPossibleMove: getPossibleMove,
  findNextMove: findNextMove
}
