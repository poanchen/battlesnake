const pf = require('pathfinding')
var Immutable = require('immutable')

const RIGHT = 'right'
const LEFT = 'left'
const UP = 'up'
const DOWN = 'down'

const HUNGRY_AT_HEALTH_OF = 50
// const LONG_GAME = 1000
const SAFTY_NET = 20

function getAllEnemiesHead(otherSnakes, mySnakeId) {
  var enemiesHead = Immutable.List()

  otherSnakes.get('data').map((eachSnake, index) => {
    // make sure we do not include our own head
    if (eachSnake.get('id') == mySnakeId) {
      return
    }
    enemiesHead = enemiesHead.push(eachSnake.getIn(['body', 'data', 0]))
  })

  return Immutable.Map({
    data: enemiesHead
  })
}

function findClosestFoodAndPath(myHead, food, grid) {
  const finder = new pf.AStarFinder()
  var originalGrid = grid.clone()
  var shortestPath, path
  var closestFood, closestFoodLength = 100000

  food.get('data').map(eachFood => {
    path = finder.findPath(
      myHead.get('x'),
      myHead.get('y'),
      eachFood.get('x'),
      eachFood.get('y'),
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

  // simply return the empty width X height grid
  // when the snakes is null
  if (data.getIn(['snakes', 'data']) == null) {
    return grid
  }

  // make sure each snake's coord should be 1
  // for example,
  // 0 0 0 0 0 0 0 0
  // 0 0 0 1 0 0 0 1
  // 0 0 0 1 1 0 0 1
  // 1 1 0 1 1 0 0 0
  // 0 1 0 0 0 0 1 1
  // 0 0 0 0 0 0 1 1
  for (var i = 0; i < data.getIn(['snakes', 'data']).size; i++) {
    for (var j = 0; j < data.getIn(['snakes', 'data', i, 'body', 'data']).size; j++) {
      grid = Immutable.fromJS(grid).setIn([
          data.getIn(['snakes', 'data', i, 'body', 'data', j, 'y']),
          data.getIn(['snakes', 'data', i, 'body', 'data', j, 'x'])], 1)
    }
  }

  return grid.toJS()
}

function getPossibleMove(data) {
  var possibleMoves = Immutable.List()
  var myHead = data.get('myHead')
  var grid = data.get('grid')

  if (
    myHead.get('y') + 1 >= 0 &&
    myHead.get('y') + 1 < grid.height &&
    grid.nodes[myHead.get('y') + 1][myHead.get('x')].walkable
  ) {
    // check if down is possible
    // console.log("down is possible")
    // console.log("x", myHead.get('y') + 1)
    // console.log("y", myHead.get('x'))
    possibleMoves = possibleMoves.push([myHead.get('x'), myHead.get('y') + 1])
  }

  if (
    myHead.get('x') + 1 >= 0 &&
    myHead.get('x') + 1 < grid.width &&
    grid.nodes[myHead.get('y')][myHead.get('x') + 1].walkable
  ) {
    // check if right is possible
    // console.log("right is possible")
    // console.log("x", myHead.get('y'))
    // console.log("y", myHead.get('x') + 1)
    possibleMoves = possibleMoves.push([myHead.get('x') + 1, myHead.get('y')])
  }

  if (
    myHead.get('y') - 1 >= 0 &&
    myHead.get('y') - 1 < grid.height &&
    grid.nodes[myHead.get('y') - 1][myHead.get('x')].walkable
  ) {
    // check if up is possible
    // console.log("up is possible")
    // console.log("x", myHead.get('y') - 1)
    // console.log("y", myHead.get('x'))
    possibleMoves = possibleMoves.push([myHead.get('x'), myHead.get('y') - 1])
  }

  if (
    myHead.get('x') - 1 >= 0 &&
    myHead.get('x') - 1 < grid.width &&
    grid.nodes[myHead.get('y')][myHead.get('x') - 1].walkable
  ) {
    // check for left
    // console.log("left is possible")
    // console.log("x", myHead.get('y'))
    // console.log("y", myHead.get('x') - 1)
    possibleMoves = possibleMoves.push([myHead.get('x') - 1, myHead.get('y')])
  }

  return possibleMoves
}

function checkIfItIsOthersDangerousZone(data) {
  var possibleMovesFromEnemy
  var lengthOfOtherSnake = 0
  var itIsOthersDangerousZone = false

  data.getIn(['otherSnakes', 'data']).map(eachSnake => {
    possibleMovesFromEnemy = getPossibleMove(Immutable.Map({
                                myHead: data.get('myHead'),
                                grid: data.get('grid')
                             }))
    possibleMovesFromEnemy.map(eachPossibleMoveFromEnemy => {
      if (eachPossibleMoveFromEnemy[0] == data.get('nextPossibleMoveFromUs')[0] &&
          eachPossibleMoveFromEnemy[1] == data.get('nextPossibleMoveFromUs')[1]) {
        itIsOthersDangerousZone = true
        if (eachSnake.getIn(['body', 'data']).size > lengthOfOtherSnake) {
          lengthOfOtherSnake = eachSnake.getIn(['body', 'data']).size
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
  })), countForFirstMove, countForSecondMove, countForThirdMove
  var emptyGrid = new pf.Grid(initGrid(Immutable.Map({
    width: data.get('grid').width,
    height: data.get('grid').height,
    snakes: null
  })))

  // find the closest enemy first
  // assume that there is only one enemy that
  // is closest to us (it is also possible that you are the only one left)
  // To-do: find the closest enemy to the furtherest enemy and
  // put them into a List, try to see anyone of them could potentially
  // trap us then pick the best move based on that?
  // still not sure if that is good idea
  // this is assuming that everyone is aggressive
  // but probably would be safer?
  var closestEnemyHead = findClosestFoodAndPath(
                            data.get('myHead'),
                            getAllEnemiesHead(data.get('otherSnakes'), data.get('mySnakeId')),
                            emptyGrid).get('closestFood')

  var possibleMovesFromEnemy = getPossibleMove(Immutable.Map({
    myHead: closestEnemyHead,
    grid: data.get('grid')
  }))
  var safeSpotCounts = Immutable.List()

  // first assume no other snakes can trap us and lets see which
  // way is better to go with
  mapData = initGrid(Immutable.Map({
    width: data.get('grid').width,
    height: data.get('grid').height,
    snakes: data.get('otherSnakes')
  }))

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

  // when there are 3 possible moves, we should check as well using flood fill alg
  if (data.getIn(['nextPossibleMovesFromUs']).size == 3) {
    mapData = initGrid(Immutable.Map({
      width: data.get('grid').width,
      height: data.get('grid').height,
      snakes: data.get('otherSnakes')
    }))

    floodFill(mapData, data.getIn(['nextPossibleMovesFromUs', 2])[1], data.getIn(['nextPossibleMovesFromUs', 2])[0], 0, 2)
    countForThirdMove = countSafeSpot(Immutable.Map({
                          mapData: Immutable.List(mapData),
                          newVal: 2
                        }))

    safeSpotCounts = safeSpotCounts.push([countForFirstMove, countForSecondMove, countForThirdMove])
  } else {
    safeSpotCounts = safeSpotCounts.push([countForFirstMove, countForSecondMove])
  }

  console.log('safeSpotCounts ' + safeSpotCounts)

  var safeSpotCountsFromEnemies = Immutable.List()

  // think one step ahead of ourself by filling each
  // enemies's possible move and count the safe spot
  // based on our possible move
  // To-do: calculate the straight line distance between their head
  // to our head or body and check that many steps
  // and see if they can potentially trap us?
  // if they can trap us, try to run away as far as I can
  // or pick the way that will give us more space
  // maybe make this as another function
  possibleMovesFromEnemy.map(eachPossibleMoveFromEnemy => {
    mapData = initGrid(Immutable.Map({
      width: data.get('grid').width,
      height: data.get('grid').height,
      snakes: data.get('otherSnakes')
    }))
    // fill the enemy's next potential move
    mapData[eachPossibleMoveFromEnemy[1]][eachPossibleMoveFromEnemy[0]] = 1
    
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
    // fill the enemy's next potential move
    mapData[eachPossibleMoveFromEnemy[1]][eachPossibleMoveFromEnemy[0]] = 1

    floodFill(mapData, data.getIn(['nextPossibleMovesFromUs', 1])[1], data.getIn(['nextPossibleMovesFromUs', 1])[0], 0, 2)
    countForSecondMove = countSafeSpot(Immutable.Map({
                          mapData: Immutable.List(mapData),
                          newVal: 2
                        }))

    // when there are 3 possible moves, we should check as well using flood fill alg
    if (data.getIn(['nextPossibleMovesFromUs']).size == 3) {
      mapData = initGrid(Immutable.Map({
        width: data.get('grid').width,
        height: data.get('grid').height,
        snakes: data.get('otherSnakes')
      }))
      // fill the enemy's next potential move
      mapData[eachPossibleMoveFromEnemy[1]][eachPossibleMoveFromEnemy[0]] = 1

      floodFill(mapData, data.getIn(['nextPossibleMovesFromUs', 2])[1], data.getIn(['nextPossibleMovesFromUs', 2])[0], 0, 2)
      countForThirdMove = countSafeSpot(Immutable.Map({
                            mapData: Immutable.List(mapData),
                            newVal: 2
                          }))

      safeSpotCountsFromEnemies = safeSpotCountsFromEnemies.push([countForFirstMove, countForSecondMove, countForThirdMove])
    } else {
      safeSpotCountsFromEnemies = safeSpotCountsFromEnemies.push([countForFirstMove, countForSecondMove])
    }
  })

  console.log('safeSpotCountsFromEnemies ' + safeSpotCountsFromEnemies)

  var trappable = false, biggestSafeSpotCountDiff = 0, moveDiff = 0,
      biggestSafeSpotCountIndex = 0
  
  // try to see if others could potentially trap us
  // by checking if the count for safe spot is the
  // same regardless of their next move
  safeSpotCountsFromEnemies.map((eachMove, indexI) => {
    safeSpotCounts.toJS()[0].map((eachSpot, indexJ) => {
      moveDiff = Math.abs(eachMove[indexJ] - eachSpot)
      // console.log(eachMove[indexJ]+' - '+eachSpot)
      // console.log(moveDiff)
      if (moveDiff <= 1) {
        // if each of their move does not effect our
        // count for safe spot, then I think it is
        // safe to assume that they would not potentially
        // trap us (at least one step ahead)
      } else {
        // since their next move does effect our count
        // for safe spot, as a result, there is a potential
        // that they could trap us
        trappable = true
        if (moveDiff > biggestSafeSpotCountDiff) {
          // making sure to save the worest case scenario
          biggestSafeSpotCountIndex = indexI
          biggestSafeSpotCountDiff = moveDiff
          // console.log(moveDiff+' has been diff')
          // console.log(indexI+' has been indexed')
        }
      }
    })
  })

  console.log('can other snake trap us? ' + trappable)

  if (trappable) {
    // they could trap us, lets see which way is better move
    console.log('worest safeSpotCounts ' + safeSpotCountsFromEnemies.get(biggestSafeSpotCountIndex))
    countForFirstMove = safeSpotCountsFromEnemies.get(biggestSafeSpotCountIndex)[0]
    countForSecondMove = safeSpotCountsFromEnemies.get(biggestSafeSpotCountIndex)[1]
    if (safeSpotCountsFromEnemies.get(biggestSafeSpotCountIndex).length == 3) {
      countForThirdMove = safeSpotCountsFromEnemies.get(biggestSafeSpotCountIndex)[2]
    }
  } else {
    // they would not be able to trap us (at least one step ahead)
    // To-do: think more than one step ahead?
    console.log('safeSpotCounts ' + safeSpotCounts)
    countForFirstMove = safeSpotCounts.get(0)[0]
    countForSecondMove = safeSpotCounts.get(0)[1]
    if (safeSpotCounts.get(0).length == 3) {
      countForThirdMove = safeSpotCounts.get(0)[2]
    }
  }

  // To-do: find a place where it is less snake and more spaces?

  if (data.getIn(['nextPossibleMovesFromUs']).size == 3) {
    return Immutable.Map({
      countForFirstMove: countForFirstMove,
      countForSecondMove: countForSecondMove,
      countForThirdMove: countForThirdMove
    })
  }

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

  // get all the possible moves first
  var possibleMoves = getPossibleMove(Immutable.Map({
    myHead: data.getIn(['mySnake', 'you', 'body', 'data', 0]),
    grid: data.get('grid')
  }))
  var safeMoves = Immutable.List()

  console.log("possibleMoves moves: " + possibleMoves)

  // check if it is someone else dangerous zone
  possibleMoves.map(eachPossibleMove => {
    var isItDangerous = checkIfItIsOthersDangerousZone(Immutable.Map({
                          otherSnakes: data.get('otherSnakes'),
                          nextPossibleMoveFromUs: eachPossibleMove,
                          myHead: data.getIn(['mySnake', 'you', 'body', 'data', 0]),
                          grid: data.get('grid')
                        }))

    if (isItDangerous.get('itIsOthersDangerousZone') &&
        isItDangerous.get('lengthOfOtherSnake') > data.getIn(['mySnake', 'you', 'body', 'data']).size) {
      // it is indeed dangerous because their length is longer than my snake
      // To-do: when their snake length is same with us, that is dangerous too
      //        should try to avoid if possible
      console.log("The move: " + eachPossibleMove + " is dangerous!!!!!!!!!!")
    } else {
      // add that move since it is safe
      safeMoves = safeMoves.push(eachPossibleMove)
      console.log("The move: " + eachPossibleMove + " is safe.")
    }
  })

  console.log("deletion after checking dangerous zone: " + safeMoves)

  // Always use flood fill alg when we have
  // more than 2 possible moves left
  if (safeMoves.size >= 2) {
    var ptForEachMoves = useFloodFillAlgToDecideWhichWayIsBetter(Immutable.Map({
                          otherSnakes: data.get('otherSnakes'),
                          nextPossibleMovesFromUs: safeMoves,
                          myHead: data.getIn(['mySnake', 'you', 'body', 'data', 0]),
                          mySnakeId: data.getIn(['mySnake', 'you', 'id']),
                          grid: data.get('grid')
                        }))

    // now the least number will be on the first element of List
    ptForEachMoves = ptForEachMoves.sort()

    // make sure we remove the one with the smallest one (relatively dangerous move)
    if (ptForEachMoves.get(ptForEachMoves.keySeq().get(0)) < ptForEachMoves.get(ptForEachMoves.keySeq().get(1))) {
      if (safeMoves.size == 3) {
        // it is possible that first and second move are pretty bad but they are not the same
        // then we need to make sure that we went with the biggest one
        if (ptForEachMoves.get(ptForEachMoves.keySeq().get(1)) < ptForEachMoves.get(ptForEachMoves.keySeq().get(2))) {
          switch(ptForEachMoves.keySeq().get(2)) {
            case 'countForFirstMove':
              safeMoves = safeMoves.get(0)
              break
            case 'countForSecondMove':
              safeMoves = safeMoves.get(1)
              break
            case 'countForThirdMove':
              safeMoves = safeMoves.get(2)
              break
            default:
              // do nothing here
              // should never come here at all
              break
          }

          safeMoves = Immutable.List([safeMoves])
        } else {
          // there should be a better way to do this?
          // this happens when your count is 1, 50, 50
          switch(ptForEachMoves.keySeq().get(0)) {
            case 'countForFirstMove':
              safeMoves = safeMoves.delete(0)
              break
            case 'countForSecondMove':
              safeMoves = safeMoves.delete(1)
              break
            case 'countForThirdMove':
              safeMoves = safeMoves.delete(2)
              break
            default:
              // do nothing here
              // should never come here at all
              break
          }
        }
      } else {
        switch(ptForEachMoves.keySeq().get(0)) {
          case 'countForFirstMove':
            safeMoves = safeMoves.delete(0)
            break
          case 'countForSecondMove':
            safeMoves = safeMoves.delete(1)
            break
          case 'countForThirdMove':
            safeMoves = safeMoves.delete(2)
            break
          default:
            // do nothing here
            // should never come here at all
            break
        }
      }
    } else {
      if (safeMoves.size == 3) {
        // there is a possibilities that the first and second move are both pretty bad
        // let's check that
        if (ptForEachMoves.get(ptForEachMoves.keySeq().get(1)) < ptForEachMoves.get(ptForEachMoves.keySeq().get(2))) {
          // so first and second move are the same
          // and second move is smaller than third move
          // that means both first and second move are pretty bad
          // let's remove them
          // but instead of removing the first and second
          // Even better, we can simply keep the third one and that's it
          switch(ptForEachMoves.keySeq().get(2)) {
            case 'countForFirstMove':
              safeMoves = safeMoves.get(0)
              break
            case 'countForSecondMove':
              safeMoves = safeMoves.get(1)
              break
            case 'countForThirdMove':
              safeMoves = safeMoves.get(2)
              break
            default:
              // do nothing here
              // should never come here at all
              break
          }

          safeMoves = Immutable.List([safeMoves])
        } else {
          // we do not remove this move since the count for move is the same with the third one
          // that means there is not much differences between those two
        }
      } else {
        // we do not remove this move since the count for move is the same with the second one
        // that means there is not much differences between those two
      }
    }

    console.log('we just did a flood fill alg')
    console.log('result: ' + safeMoves)
  }

  // check if there is closest food and path
  if (data.get('closestFood') !== undefined && data.get('shortestPath') !== undefined) {
    if ((data.getIn(['mySnake', 'you', 'health']) < HUNGRY_AT_HEALTH_OF) ||
      // when the game became long game, we need to make sure that we can get to the food before starving
      // so we always make sure that we can get to the food until we ran out of healths
      // this covers the use case that 
      // when the closest food is longer than 50 turns, then we should go ahead and eat that instead of
      // waiting till our health reaches 50, and we will likely be died before reaching the food
      // maybe even do this, when it isn't a long game?
      (data.getIn(['mySnake', 'you', 'health']) - SAFTY_NET <= data.get('shortestPath').size)) {
      // ((data.get('turn') > LONG_GAME) && (data.getIn(['mySnake', 'you', 'health']) - SAFTY_NET <= data.get('shortestPath').size))) {
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
      console.log("we are not hungry " + data.getIn(['mySnake', 'you', 'health']) + " for now")
    }
  } else {
    console.log("No route to food has been found")
  }

  console.log("possibleMoves: " + safeMoves)

  var nextDirection = getDirection([data.getIn(['mySnake', 'you', 'body', 'data', 0, 'x']),
                      data.getIn(['mySnake', 'you', 'body', 'data', 0, 'y'])]
                      , safeMoves.get(0))

  console.log("nextDirection: " + nextDirection)

  return nextDirection
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
