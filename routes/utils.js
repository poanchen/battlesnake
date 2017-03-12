const pf = require('pathfinding')
var Immutable = require('immutable')

const RIGHT = 'right'
const LEFT = 'left'
const UP = 'up'
const DOWN = 'down'

const HUNGRY_AT_HEALTH_OF = 50

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

  food.map(eachFood => {
    path = finder.findPath(
      snakeHead.get(0),
      snakeHead.get(1),
      eachFood.get(0),
      eachFood.get(1),
      grid
    )

    if (path.length < closestFoodLength && path.length != 0) {
      shortestPath = path
      closestFoodLength = path.length
      closestFood = eachFood
    }
    grid = originalGrid.clone()
  })

  return Immutable.Map({
    shortestPath: Immutable.List(shortestPath),
    closestFood: closestFood
  })
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
  // create a height x width empty array
  // for example,
  // 0 0 0 0 0 0 0 0
  // 0 0 0 0 0 0 0 0
  // 0 0 0 0 0 0 0 0
  // 0 0 0 0 0 0 0 0
  // 0 0 0 0 0 0 0 0
  // 0 0 0 0 0 0 0 0
  var grid = Immutable.List(Array(data.get('height')).fill(null).map(
              () => Array(data.get('width')).fill(null).map(
                () => 0))).toJS()

  // make sure each snake's coord should be 1
  // for example,
  // 0 0 0 0 0 0 0 0
  // 0 0 0 1 0 0 0 1
  // 0 0 0 1 1 0 0 1
  // 1 1 0 1 1 0 0 0
  // 0 1 0 0 0 0 1 1
  // 0 0 0 0 0 0 1 1
  for (var i = 0; i < data.get('snakes').size; i++) {
    for (var j = 0; j < data.getIn(['snakes', i, 'coords']).size; j++) {
      grid = Immutable.fromJS(grid).setIn([
          data.getIn(['snakes', i, 'coords', j, 1]),
          data.getIn(['snakes', i, 'coords', j, 0])], 1)
    }
  }

  return grid.toJS()
}

function getPossibleMove(data) {
  var possibleMoves = Immutable.List()
  var myHead = data.get('myHead')
  var grid = data.get('grid')

  if (
    myHead.get(1) + 1 >= 0 &&
    myHead.get(1) + 1 < grid.height &&
    grid.nodes[myHead.get(1) + 1][myHead.get(0)].walkable
  ) {
    // check if down is possible
    // console.log("down is possible")
    // console.log("x", myHead.get(1) + 1)
    // console.log("y", myHead.get(0))
    possibleMoves = possibleMoves.push([myHead.get(0), myHead.get(1) + 1])
  }

  if (
    myHead.get(0) + 1 >= 0 &&
    myHead.get(0) + 1 < grid.width &&
    grid.nodes[myHead.get(1)][myHead.get(0) + 1].walkable
  ) {
    // check if right is possible
    // console.log("right is possible")
    // console.log("x", myHead.get(1))
    // console.log("y", myHead.get(0) + 1)
    possibleMoves = possibleMoves.push([myHead.get(0) + 1, myHead.get(1)])
  }

  if (
    myHead.get(1) - 1 >= 0 &&
    myHead.get(1) - 1 < grid.height &&
    grid.nodes[myHead.get(1) - 1][myHead.get(0)].walkable
  ) {
    // check if up is possible
    // console.log("up is possible")
    // console.log("x", myHead.get(1) - 1)
    // console.log("y", myHead.get(0))
    possibleMoves = possibleMoves.push([myHead.get(0), myHead.get(1) - 1])
  }

  if (
    myHead.get(0) - 1 >= 0 &&
    myHead.get(0) - 1 < grid.width &&
    grid.nodes[myHead.get(1)][myHead.get(0) - 1].walkable
  ) {
    // check for left
    // console.log("left is possible")
    // console.log("x", myHead.get(1))
    // console.log("y", myHead.get(0) - 1)
    possibleMoves = possibleMoves.push([myHead.get(0) - 1, myHead.get(1)])
  }

  return possibleMoves
}

function checkIfItIsOthersDangerousZone(data) {
  var possibleMovesFromEnemy
  var lengthOfOtherSnake = 0
  var itIsOthersDangerousZone = false

  data.get('otherSnakes').map(eachSnake => {
    possibleMovesFromEnemy = getPossibleMove(Immutable.Map({
                                myHead: eachSnake.getIn(['coords', 0]),
                                grid: data.get('grid')
                             }))
    possibleMovesFromEnemy.map(eachPossibleMoveFromEnemy => {
      if (eachPossibleMoveFromEnemy[0] == data.get('nextPossibleMoveFromUs')[0] &&
          eachPossibleMoveFromEnemy[1] == data.get('nextPossibleMoveFromUs')[1]) {
        itIsOthersDangerousZone = true
        if (eachSnake.get('coords').size > lengthOfOtherSnake) {
          lengthOfOtherSnake = eachSnake.get('coords').size
        }
      }
    })
  })

  return Immutable.Map({
    itIsOthersDangerousZone: itIsOthersDangerousZone,
    lengthOfOtherSnake: lengthOfOtherSnake
  })
}

function useFloodFillAlgToDecideWhichWayIsBetter(data) {
  var mapData = initGrid(Immutable.Map({
    width: data.get('grid').width,
    height: data.get('grid').height,
    snakes: data.get('otherSnakes')
  })), countForFirstMove, countForSecondMove

  // find a place where it is less snake and more spaces
  // find the closest enemy
  // var closestEnemyHead = findClosestFoodAndPath(
  //                           data.otherSnakes[0].coords[0],
  //                           getAllEnemiesHead(data.mySnake, data.otherSnakes),
  //                           data.grid)

  // try to see if they could trap us
  // if (closestEnemyHead.closestFood === undefined && closestEnemyHead.shortestPath === undefined) {
    // it seems like we are already trap?
    // try to find the best way to go
    floodFill(mapData, data.getIn(['nextPossibleMovesFromUs', 0])[1], data.getIn(['nextPossibleMovesFromUs', 0])[0], 0, 2)
    countForFirstMove = countSafeSpot(Immutable.Map({
                          mapData: Immutable.List(mapData),
                          newVal: 2
                        }))

    mapData = initGrid(Immutable.Map({
      width: data.get('grid').width,
      height: data.get('grid').height,
      snakes: data.get('otherSnakes')
    }))

    floodFill(mapData, data.getIn(['nextPossibleMovesFromUs', 1])[1], data.getIn(['nextPossibleMovesFromUs', 1])[0], 0, 2)
    countForSecondMove = countSafeSpot(Immutable.Map({
                          mapData: Immutable.List(mapData),
                          newVal: 2
                        }))
  // } else {
    // could they potentially trap us?
    // let's find out
    // let's see if their next move would block us and eventually kill us
    // make sure we are we (maybe this is a bug?)
    // data.mySnake.id = data.otherSnakes[0].id

    // this should probably be another functions?
    // for (var i = 0; i < data.otherSnakes.length; i++) {
    //   if (
    //     data.otherSnakes[i].coords[0][0] == closestEnemyHead[0] &&
    //     data.otherSnakes[i].coords[0][1] == closestEnemyHead[1]
    //   ) {
    //     data.mySnake.id = data.otherSnakes[i].id
    //   }
    // }

    // var possibleMovesFromEnemy = getPossibleMove(data)
    // var resultFromThePossibleMoves = [], c1, c2

    // find the worst case scenario and
    // and try to avoid that one
    // for (var i = 0; i < possibleMovesFromEnemy.length; i++) {
    //   mapData = initGrid({
    //     width: data.grid.width,
    //     height: data.grid.height,
    //     snakes: data.otherSnakes
    //   })
    //   mapData[possibleMovesFromEnemy[i][1]][possibleMovesFromEnemy[i][0]] = 1

    //   // console.log(possibleMovesFromEnemy[i])
    //   floodFill(mapData, possibleMoves[0][1], possibleMoves[0][0], 0, 2)
    //   c1 = countSafeSpot(mapData, 2)
    //   // console.log(possibleMoves[0])
    //   // console.log(c1)
    //   floodFill(mapData, possibleMoves[1][1], possibleMoves[1][0], 0, 2)
    //   c2 = countSafeSpot(mapData, 2)
    //   // console.log(possibleMoves[1])
    //   // console.log(c2)

    //   resultFromThePossibleMoves.push({
    //     c1: c1,
    //     c2: c2
    //   })
    // }

    // var sumForC1 = 0, sumForC2 = 0

    // for (var i = 0; i < resultFromThePossibleMoves.length; i++) {
    //   sumForC1 += resultFromThePossibleMoves[i].c1
    //   sumForC2 += resultFromThePossibleMoves[i].c2
    // }

    // var averForC1 = sumForC1 / resultFromThePossibleMoves.length
    // var averForC2 = sumForC2 / resultFromThePossibleMoves.length

    // var possibleTrapFromEnemy = {
    //   itIsPossible: false
    // }

    // for (var i = 0; i < resultFromThePossibleMoves.length; i++) {
    //   if (resultFromThePossibleMoves[i].c1*2 < averForC1) {
    //     possibleTrapFromEnemy.itIsPossible = true
    //     possibleTrapFromEnemy.index = i
    //   } else if (resultFromThePossibleMoves[i].c1 > averForC1*2) {
    //     possibleTrapFromEnemy.itIsPossible = true
    //     possibleTrapFromEnemy.index = i
    //   }

    //   if (resultFromThePossibleMoves[i].c2*2 < averForC2) {
    //     possibleTrapFromEnemy.itIsPossible = true
    //     possibleTrapFromEnemy.index = i
    //   } else if (resultFromThePossibleMoves[i].c2 > averForC2*2) {
    //     possibleTrapFromEnemy.itIsPossible = true
    //     possibleTrapFromEnemy.index = i
    //   }
    // }

    // if (possibleTrapFromEnemy.itIsPossible) {
    //   // it is possible to get trap from the enemy
    //   c1 = resultFromThePossibleMoves[possibleTrapFromEnemy.index].c1
    //   c2 = resultFromThePossibleMoves[possibleTrapFromEnemy.index].c2

    //   if (c1 > c2) {
    //     countForFirstMove = 100
    //     countForSecondMove = 0
    //   } else {
    //     countForFirstMove = 0
    //     countForSecondMove = 100
    //   }
    // } else {
    //   // duplicate (should be merged)
    //   // not possible to trap
    //   // fall back to choose whichever has the
    //   // greatest count
    //   mapData = initGrid({
    //     width: data.grid.width,
    //     height: data.grid.height,
    //     snakes: data.otherSnakes
    //   })

    //   floodFill(mapData, possibleMoves[0][1], possibleMoves[0][0], 0, 2)
    //   countForFirstMove = countSafeSpot(mapData, 2)

    //   mapData = initGrid({
    //     width: data.grid.width,
    //     height: data.grid.height,
    //     snakes: data.otherSnakes
    //   })

    //   floodFill(mapData, possibleMoves[1][1], possibleMoves[1][0], 0, 2)
    //   countForSecondMove = countSafeSpot(mapData, 2)
    // }
  // }

  return Immutable.Map({
    countForFirstMove: countForFirstMove,
    countForSecondMove: countForSecondMove
  })
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

function countSafeSpot(data) {
  var sum = 0
  const mapWidth = data.get('mapData').size,
    mapHeight = data.getIn(['mapData', 0]).length

  data.get('mapData').map(eachRow => {
    for (var j = 0; j < mapWidth; j++) {
      if (eachRow[j] == data.get('newVal')) {
        sum++
      }
    }
  })

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
  var possibleMoves = getPossibleMove(Immutable.Map({
    myHead: data.getIn(['otherSnakes', 0, 'coords', 0]),
    grid: data.get('grid')
  }))
  var safeMoves = Immutable.List()

  console.log("possibleMoves moves: " + possibleMoves)

  // check if it is someone else dangerous zone
  possibleMoves.map(eachPossibleMove => {
    var isItDangerous = checkIfItIsOthersDangerousZone(Immutable.Map({
                          otherSnakes: data.get('otherSnakes'),
                          nextPossibleMoveFromUs: eachPossibleMove,
                          myHead: data.getIn(['otherSnakes', 0, 'coords', 0]),
                          grid: data.get('grid')
                        }))

    if (isItDangerous.get('itIsOthersDangerousZone') &&
        isItDangerous.get('lengthOfOtherSnake') > data.getIn(['otherSnakes', 0, 'coords']).size) {
      // it is indeed dangerous because their length is longer than my snake
      console.log("The move: " + eachPossibleMove + " is dangerous!!!!!!!!!!")
    } else {
      // add that move since it is safe
      safeMoves = safeMoves.push(eachPossibleMove)
      console.log("The move: " + eachPossibleMove + " is safe.")
    }
  })

  console.log("after delete " + safeMoves)

  // check if we only have two possible moves left
  if (safeMoves.size == 2) {
    var ptForEachMoves = useFloodFillAlgToDecideWhichWayIsBetter(Immutable.Map({
                          otherSnakes: data.get('otherSnakes'),
                          nextPossibleMovesFromUs: safeMoves,
                          grid: data.get('grid')
                        }))

    // check if one move has greater count than the other one
    if (ptForEachMoves.get('countForFirstMove') < ptForEachMoves.get('countForSecondMove')) {
      // remove that path since it is not safe
      safeMoves = safeMoves.delete(0)
    } else if (ptForEachMoves.get('countForFirstMove') > ptForEachMoves.get('countForSecondMove')) {
      // remove that path since it is not safe
      safeMoves = safeMoves.delete(1)
    }
  }

  // check if there is closest food and path
  if (data.get('closestFood') !== undefined && data.get('shortestPath') !== undefined) {
    if (data.getIn(['otherSnakes', 0, 'health_points']) < HUNGRY_AT_HEALTH_OF) {
      // I think we are hungry and we should go ahead and eat some food
      // but before we go ahead, let's see if it is safe to do so
      for (var i = 0; i < safeMoves.size; i++) {
        console.log("data.shortestPath " + data.get('shortestPath'))
        if (safeMoves.get(i)[0] == data.getIn(['shortestPath', 1])[0] &&
          safeMoves.get(i)[1] == data.getIn(['shortestPath', 1])[1]) {
          // I think it is safe to eat
          console.log("The move: " + safeMoves.get(i) + " is safe for eating.")
          return getDirection(data.getIn(['shortestPath', 0]), data.getIn(['shortestPath', 1]))
        }
        // seems like it will be too dangerous to eat the food
        // let's not do that
        console.log("The move: " + safeMoves.get(i) + " is too dangerous, lets eat later.")
      }
    } else {
      // instead of eating right now, I think we can wait for a bit more
      console.log("we are not hungry " + data.getIn(['otherSnakes', 0, 'health_points']) + " for now")
    }
  } else {
    console.log("No route to food has been found")
  }

  console.log("possibleMoves: " + safeMoves)

  return getDirection(data.getIn(['otherSnakes', 0, 'coords', 0]).toJS(), safeMoves.get(0))
}

module.exports = {
  getAllEnemiesHead: getAllEnemiesHead,
  findClosestFoodAndPath: findClosestFoodAndPath,
  getDirection: getDirection,
  initGrid: initGrid,
  checkIfItIsOthersDangerousZone: checkIfItIsOthersDangerousZone,
  useFloodFillAlgToDecideWhichWayIsBetter: useFloodFillAlgToDecideWhichWayIsBetter,
  getPossibleMove: getPossibleMove,
  findNextMove: findNextMove
}
