const pf = require('pathfinding')
var Immutable = require('immutable')
var config = require('../config.json')

// Grid
const SNAKE_BODY = config.grid.snake_body
const FLOOD_FILL_NEW_VAL = config.grid.flood_fill_new_value

// Direction
const RIGHT = config.direction.right
const LEFT = config.direction.left
const UP = config.direction.up
const DOWN = config.direction.down

const STEPSAHEAD = config.steps_ahead

const ORIGINAL_CALL = 3

// Hungriness
const HUNGRY_POINT = config.hungry_point

function initGrid(width, height, snakes) {
  // Create a h * w 2D array (filled with zero)
  // 0 0 0 0 0 0 0 0
  // 0 0 0 0 0 0 0 0
  // 0 0 0 0 0 0 0 0
  // 0 0 0 0 0 0 0 0
  // 0 0 0 0 0 0 0 0
  // 0 0 0 0 0 0 0 0
  // The above example are for grid with height of 6 and width of 8.
  var grid = Array(height).fill(null).map(
    () => Array(width).fill(null).map(
      () => 0))

  // simply return the empty h * w grid when the snakes is null
  if(snakes == null || snakes.size == 0) {
    return grid
  }

  // Make sure each snake's body position should be SNAKE_BODY 
  // For example,
  // 0 1 0 0 0 0 1 0
  // 0 0 0 0 0 0 0 0
  // 0 0 0 0 0 0 0 0
  // 0 0 0 0 0 0 0 0
  // 0 0 0 0 0 0 0 0
  // 0 1 0 0 0 0 1 0
  snakes.map(eachSnake => {
    eachSnake.getIn(['body', 'data']).map(eachSnakeBody => {
      grid[eachSnakeBody.get('y')][eachSnakeBody.get('x')] = SNAKE_BODY;
    })
  })
  return grid
}

function getDirection(from, to) {
  const x = to[0] - from[0]
  const y = to[1] - from[1]
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

function fillOtherSnakesInMultipleSteps(steps, head, grid) {
  // ignore shorter snake probably
  var possibleMoves = getPossibleMoves(head, new pf.Grid(grid))
  if(possibleMoves.size == 0 || steps == 0) return;
  possibleMoves.map(eachMove => {
    grid[eachMove[1]][eachMove[0]] = SNAKE_BODY;
    fillOtherSnakesInMultipleSteps(steps - 1, Immutable.Map({x : eachMove[0], y : eachMove[1]}), grid)
  })
}

function testMultipleStepsAheadRecursively(steps, head, grid, results, sum, flag, index) {
  // if dumb move found, we exculde that move at all to optimized in some situation
  // when the move has no food, make sure we also remove our own tail
  var possibleMoves = getPossibleMoves(head, new pf.Grid(grid))
  console.log(Immutable.List(possibleMoves))
  if(possibleMoves.size == 0 || steps < 0) {
    // mark the head as 0
    grid[head.get('y')][head.get('x')] = 0
    console.log(head)
    // console.log(grid)
    console.log('come back')
    return
  }
  possibleMoves = possibleMoves.toJS()
  var i = 0
  // results = [{left: 0, up: 0}, {left: 0, up: 0}, {left: 0, up: 0}, {left: 0, up: 0}]
  // possibleMoves = [*[19, 16]*, [20, 17]]
  while(i < possibleMoves.length) {
    // depends on food, you might also need to remove the tail
    floodFill(grid, possibleMoves[i][1], possibleMoves[i][0], 0, FLOOD_FILL_NEW_VAL)
    console.log([possibleMoves[i][0], possibleMoves[i][1]])
    grid[possibleMoves[i][1]][possibleMoves[i][0]] = 1
    if(flag == ORIGINAL_CALL) {
      // console.log(grid)
      // console.log(index)
    }
    var count = countSafeSpot(grid, FLOOD_FILL_NEW_VAL)
    sum += count
    // if(direction in results[steps]) {
    //   results[steps][direction] += safeCounts
    // } else {
    //   results[steps][direction] = safeCounts
    // }
    // console.log("At i:" + i)
    // console.log("At steps:" + steps)
    grid = revertBackFromFloodFill(grid)
    testMultipleStepsAheadRecursively(steps - 1, Immutable.Map({x : possibleMoves[i][0], y : possibleMoves[i++][1]}), grid, results, sum, 0)
    if(flag == ORIGINAL_CALL) {
      var direction = getDirection([head.get('x'), head.get('y')], possibleMoves[i - 1])
      results[index][direction] = sum
      console.log("=====================")
      // console.log(direction)
      // console.log(possibleMoves[i])
      // console.log(sum)
      // console.log(index)
      sum = 0
    }
  }
  // mark the head to zero as well
  grid[head.get('y')][head.get('x')] = 0
  console.log(head)
  console.log('done the while loop here')
}

// author name: MrPolywhirl
// author url: https://jsfiddle.net/user/MrPolywhirl/
// source code url: https://jsfiddle.net/MrPolywhirl/eWxNE/
function floodFill(mapData, x, y, oldVal, newVal) {
  const mapWidth = mapData.length,
    mapHeight = mapData[0].length
  if(oldVal == null) {
    oldVal = mapData[x][y]
  }
  if(mapData[x][y] !== oldVal) {
    return true
  }
  mapData[x][y] = newVal
  if(x > 0) {
    // left
    floodFill(mapData, x - 1, y, oldVal, newVal)
  }
  if(y > 0) {
    // up
    floodFill(mapData, x, y - 1, oldVal, newVal)
  }
  if(x < mapWidth - 1) {
    // right
    floodFill(mapData, x + 1, y, oldVal, newVal)
  }
  if(y < mapHeight - 1) {
    // down
    floodFill(mapData, x, y + 1, oldVal, newVal)
  }
}

function countSafeSpot(grid, newVal) {
  return Immutable.List(grid).map(eachRow =>
    eachRow.filter(eachIndex => eachIndex == newVal)
      .reduce((a, b) => a + b, 0)).reduce((a, b) => a + b, 0) / newVal
}

function getNewHead(head, direction) {
  switch(direction) {
    case LEFT:
      head = head.set('x', head.get('x') - 1)
      break
    case RIGHT:
      head = head.set('x', head.get('x') + 1)
      break
    case UP:
      head = head.set('y', head.get('y') - 1)
      break
    case DOWN:
      head = head.set('y', head.get('y') + 1)
      break
  }
  return head
}

function getPossibleMoves(head, grid) {
  var possibleMoves = Immutable.List()
  if(
    head.get('y') + 1 >= 0 &&
    head.get('y') + 1 < grid.height &&
    grid.nodes[head.get('y') + 1][head.get('x')].walkable
  ) {
    // check if down is possible
    // console.log("down is possible")
    // console.log("x", head.get('y') + 1)
    // console.log("y", head.get('x'))
    possibleMoves = possibleMoves.push([head.get('x'), head.get('y') + 1])
  }
  if(
    head.get('x') + 1 >= 0 &&
    head.get('x') + 1 < grid.width &&
    grid.nodes[head.get('y')][head.get('x') + 1].walkable
  ) {
    // check if right is possible
    // console.log("right is possible")
    // console.log("x", head.get('y'))
    // console.log("y", head.get('x') + 1)
    possibleMoves = possibleMoves.push([head.get('x') + 1, head.get('y')])
  }
  if(
    head.get('y') - 1 >= 0 &&
    head.get('y') - 1 < grid.height &&
    grid.nodes[head.get('y') - 1][head.get('x')].walkable
  ) {
    // check if up is possible
    // console.log("up is possible")
    // console.log("x", head.get('y') - 1)
    // console.log("y", head.get('x'))
    possibleMoves = possibleMoves.push([head.get('x'), head.get('y') - 1])
  }
  if(
    head.get('x') - 1 >= 0 &&
    head.get('x') - 1 < grid.width &&
    grid.nodes[head.get('y')][head.get('x') - 1].walkable
  ) {
    // check for left
    // console.log("left is possible")
    // console.log("x", head.get('y'))
    // console.log("y", head.get('x') - 1)
    possibleMoves = possibleMoves.push([head.get('x') - 1, head.get('y')])
  }
  return possibleMoves
}

function getAllLongerEnemiesHead(snakes, mySnake) {
  var enemiesHead = Immutable.List()
  snakes.map(eachSnake => {
    // make sure we do not include our own head
    if(eachSnake.get('id') == mySnake.get('id')) return
    // make sure we do not care about snake that is shorter than us as well
    if(eachSnake.getIn(['body', 'data']).size < mySnake.getIn(['body', 'data'])) return
    enemiesHead = enemiesHead.push(eachSnake.getIn(['body', 'data', 0]))
  })
  return enemiesHead
}

function revertBackFromFloodFill(grid) {
  var originalCopyOfGrid = grid
  Immutable.List(grid).map((eachRow, i) => {
    eachRow.map((eachCol, j) => {
      if(eachCol == FLOOD_FILL_NEW_VAL) originalCopyOfGrid[i][j] = 0
    })
  })
  return originalCopyOfGrid
}

function getShortestPathIfAny(fromX, fromY, toX, toY, grid) {
  const finder = new pf.AStarFinder()
  var pfGrid = new pf.Grid(grid)
  return Immutable.List(finder.findPath(
    fromX,
    fromY,
    toX,
    toY,
    pfGrid
  ))
}

function rankFoodClosenessFromHead(head, foods, grid) {
  const finder = new pf.AStarFinder()
  // var pfGrid = new pf.Grid(grid)
  // var originalGrid = pfGrid.clone()
  var rankedClosenessFoodList = Immutable.List([]), path
  foods.map(eachFood => {
    var path = getShortestPathIfAny(
      head.get('x'),
      head.get('y'),
      eachFood.get('x'),
      eachFood.get('y'),
      grid
    )
    if(path.size > 0) {
      rankedClosenessFoodList = rankedClosenessFoodList.push(path)
    }
    // pfGrid = originalGrid.clone()
  })
  return rankedClosenessFoodList.sortBy(eachPath => eachPath.size)
}

function canOtherSnakeGetToFoodBeforeUs(shortestPathBySnake, shortestPathByOtherSnake) {
  if(shortestPathByOtherSnake.length == 0) return false
  var closestFoodFromSnake = shortestPathBySnake[shortestPathBySnake.length - 1]
  var closestFoodFromOtherSnake = shortestPathByOtherSnake[shortestPathByOtherSnake.length - 1]
  return closestFoodFromSnake[0] != closestFoodFromOtherSnake[0] ||
    closestFoodFromSnake[1] != closestFoodFromOtherSnake[1] ? 
      false : shortestPathBySnake.length >= shortestPathByOtherSnake.length
}

function findFoodThatIsClosestToUs(enemiesHead, closestFoodListFromOurHead, grid, foods) {
  var closestFoodListFromEnemiesHead = Immutable.List([])
  enemiesHead.map(eachEnemyHead => {
    closestFoodListFromEnemiesHead = closestFoodListFromEnemiesHead
      .push(rankFoodClosenessFromHead(eachEnemyHead, foods, grid))
  })
  closestFoodListFromOurHead = closestFoodListFromOurHead.toJS()
  closestFoodListFromEnemiesHead = closestFoodListFromEnemiesHead.toJS()
  var i = 0, j = 0
  while(i < closestFoodListFromOurHead.length) {
    var canOtherSnakesGetToFoodBeforeUs = false
    j = 0
    // basically checking if the food that we are going to are also others first choice
    while(j < closestFoodListFromEnemiesHead.length) {
      canOtherSnakesGetToFoodBeforeUs = canOtherSnakeGetToFoodBeforeUs(
        closestFoodListFromOurHead[i], closestFoodListFromEnemiesHead[j][0])
      if(canOtherSnakesGetToFoodBeforeUs == true) break
      j++
    }
    if(canOtherSnakesGetToFoodBeforeUs == false) break
    i++
  }
  return i < closestFoodListFromOurHead.length ? closestFoodListFromOurHead[i] : undefined
}

function tryToGetToOurOwnTailIfNotPossibleThenOthers(snakes, mySnake, grid) {
  // try longest path to other tail (if one does not work, try others until everyone) ?
  // for debugging imagine snake
  // snakes = snakes.setIn([snakes.size], {
  //       "body": {
  //         "data": [
  //           {
  //             "object": "point",
  //             "x": 1,
  //             "y": 9
  //           },
  //           {
  //             "object": "point",
  //             "x": 1,
  //             "y": 8
  //           },
  //           {
  //             "object": "point",
  //             "x": 1,
  //             "y": 7
  //           }
  //         ],
  //         "object": "list"
  //       },
  //       "health": 100,
  //       "id": "58a0142f-4cd7-4d35-9b17-815ec8ff8e70",
  //       "length": 3,
  //       "name": "Sonic Snake",
  //       "object": "snake",
  //       "taunt": "Gotta go fast"
  //     })
  var shortestPathToTail, tail
  snakes = snakes.toJS()
  var i = 0
  while(i < snakes.length) {
    tail = snakes[i].body.data[snakes[i].body.data.length - 1]
    shortestPathToTail = getShortestPathIfAny(
      mySnake.getIn(['body', 'data', 0]).get('x'),
      mySnake.getIn(['body', 'data', 0]).get('y'),
      tail.x,
      tail.y,
      grid
    )
    // check if there exist shortest path to the tail
    if(shortestPathToTail.size > 0) break
    i++
  }
  if(shortestPathToTail.size > 0) {
    console.log('trying the shortest path to the tail [' + [tail.x, tail.y] + ']')
    return getDirection([mySnake.getIn(['body', 'data', 0]).get('x'), mySnake.getIn(['body', 'data', 0]).get('y')],
        shortestPathToTail.get(1))
  }
  return undefined
}

function getLeastDangerousMove(floodFillResults) {
  i = STEPSAHEAD
  while(i >= 0) {
    if(Immutable.fromJS(floodFillResults[i]).size > 1) {
      var sortedfloodFillResults = Immutable.fromJS(floodFillResults[i]).sort((a, b) => a < b)
      return sortedfloodFillResults.keySeq().first()
    } else if(Immutable.fromJS(floodFillResults[i]).size == 1) {
      return Immutable.fromJS(floodFillResults[i]).keySeq().first()
    }
    i--
  }
  return undefined
}

function findNextLeastDangerousMove(grid, mySnake, snakes, foods) {
  var floodFillResults = [{}, {}, {}, {}]
  var originalGrid = JSON.parse(JSON.stringify(grid))
  enemiesHead = getAllLongerEnemiesHead(snakes, mySnake)
  var i = STEPSAHEAD
  while(i >= 0) {
    enemiesHead.map(eachEnemyHead => {
      fillOtherSnakesInMultipleSteps(i, eachEnemyHead, grid)
    })
    testMultipleStepsAheadRecursively(STEPSAHEAD, mySnake.getIn(['body', 'data', 0]), grid, floodFillResults, 0, ORIGINAL_CALL, i--)
    grid = JSON.parse(JSON.stringify(originalGrid))
  }
  console.log(floodFillResults)
  // Are we hungry?
  if(mySnake.get('health') < HUNGRY_POINT) {
    // go food route
    var closestFoodListFromOurHead = rankFoodClosenessFromHead(mySnake.getIn(['body', 'data', 0]), foods, grid)
    var closestFoodPath = findFoodThatIsClosestToUs(enemiesHead, closestFoodListFromOurHead, grid, foods)
    // if there exist food that is closest to us
    if(closestFoodPath != undefined) {
      var bestDirectionFromFoodPath = getDirection(
        [mySnake.getIn(['body', 'data', 0]).get('x'), mySnake.getIn(['body', 'data', 0]).get('y')],
        closestFoodPath[1])
      // not good idae to return right away
      // should check if it is safe
      console.log(bestDirectionFromFoodPath)
      return bestDirectionFromFoodPath
      // if shorest path to food told us to go right
      // but up > left > right (right is the most dangerous move)
      // we instead calculate a move to go from up to the food
        // simply go there if we are still the cloest to get to (return)
      // else simply go as safe (return)
    } else {
      console.log('we are hungry but no route to the food that is closest to us')
      // can we get to any food at all?
      if(closestFoodListFromOurHead.size > 0) {
        // yes we can
        // head over to food with the longest route and hope that there will be food spawed (return)
        console.log('let head over to that food with longest route')
        return
      }
    }
  }
  // if no direction is the best (that means both equally dangerous or equally safe or same)
  // or no food at all to our route (we are trapped)
  // try shortest path to own tail or others if we can
  var nextDirectionToTail = tryToGetToOurOwnTailIfNotPossibleThenOthers(snakes, mySnake, grid)
  if(nextDirectionToTail != undefined) {
    return nextDirectionToTail
  }
  // or fill up the remaining space as much as possible and wait for death
  // for now
  var leastDangerousMove = getLeastDangerousMove(floodFillResults)
  if(leastDangerousMove != undefined) {
    return leastDangerousMove
  }
  return DOWN // for now
}

module.exports = {
  initGrid : initGrid,
  getDirection : getDirection,
  getNewHead : getNewHead,
  findNextLeastDangerousMove : findNextLeastDangerousMove
}
