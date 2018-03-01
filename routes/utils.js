const pf = require('pathfinding')
var Immutable = require('immutable')
var config = require('../config.json')

// Grid
const SNAKE_BODY = config.grid.snake_body

// Direction
const RIGHT = config.direction.right
const LEFT = config.direction.left
const UP = config.direction.up
const DOWN = config.direction.down

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
  if (snakes == null || snakes.size == 0) {
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
  var possibleMoves = getPossibleMoves(head, new pf.Grid(grid))
  if(possibleMoves.size == 0 || steps == 0) return;
  possibleMoves.map(eachMove => {
    grid[eachMove[1]][eachMove[0]] = SNAKE_BODY;
    fillOtherSnakesInMultipleSteps(steps - 1, Immutable.Map({x : eachMove[0], y : eachMove[1]}), grid)
  })
}

function testThreeStepsAheadRecursively(steps, head, grid) {
  // if dumb move found, we exculde that move at all to optimized in some situation
  // when the move has no food, make sure we also remove our own tail
  // var possibleMoves = getPossibleMoves(head, new pf.Grid(grid))
  // if(possibleMoves.size == 0 || steps == 0) return;
  // possibleMoves.map(eachMove => {
  //   grid[eachMove[1]][eachMove[0]] = SNAKE_BODY;
  //   fillOtherSnakesInMultipleSteps(steps - 1, Immutable.Map({x : eachMove[0], y : eachMove[1]}), grid)
  // })
}

function getNewHead(head, direction) {
  switch(direction) {
    case config.direction.left:
      head = head.set('x', head.get('x') - 1)
      break
    case config.direction.right:
      head = head.set('x', head.get('x') + 1)
      break
    case config.direction.up:
      head = head.set('y', head.get('y') - 1)
      break
    case config.direction.down:
      head = head.set('y', head.get('y') + 1)
      break
  }
  return head
}

function getPossibleMoves(head, grid) {
  var possibleMoves = Immutable.List()
  if (
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
  if (
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
  if (
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
  if (
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

function getAllEnemiesHead(snakes, mySnakeId) {
  var enemiesHead = Immutable.List()
  snakes.map(eachSnake => {
    // make sure we do not include our own head
    if (eachSnake.get('id') == mySnakeId) {
      return
    }
    enemiesHead = enemiesHead.push(eachSnake.getIn(['body', 'data', 0]))
  })
  return enemiesHead
}

function findNextLeastDangerousMove(grid, mySnake, snakes, foods) {
  enemiesHead = getAllEnemiesHead(snakes, mySnake.get('id'))
  Immutable.fromJS([3, 2, 1, 0]).map(i => {
    enemiesHead.map(eachEnemyHead =>{
      fillOtherSnakesInMultipleSteps(i, eachEnemyHead, grid)
    })
    testThreeStepsAheadRecursively(3, mySnake.getIn(['body', 'data', 0]), grid)
  })
  // Are we hungry?
    // go food route
    // if the food is closest to us
      // if shorest path to food told us to go right
      // but up > left > right (right is the most dangerous move)
      // we instead calculate a move to go from up to the food
        // simply go there if we are still the cloest to get to (return)
      // else simply go as safe (return)
    // return (longest route to food)
    // head over to food with the longest route and hope that there will be food spawed
  // We are not hungry.
    // based on above and go with the least dangerous direction
    // if no direction is the best (that means both equally dangerous or equally safe or same)
    // try shortest path to own tail
    // or try longest path to other tail (if one does not work, try others until everyone)
    // or fill up the remaining space as much as possible and wait for death
  return UP // for now
}

module.exports = {
  initGrid : initGrid,
  getDirection : getDirection,
  fillOtherSnakesInMultipleSteps : fillOtherSnakesInMultipleSteps,
  testThreeStepsAheadRecursively : testThreeStepsAheadRecursively,
  getNewHead : getNewHead,
  getPossibleMoves : getPossibleMoves,
  getAllEnemiesHead : getAllEnemiesHead,
  findNextLeastDangerousMove : findNextLeastDangerousMove
}
