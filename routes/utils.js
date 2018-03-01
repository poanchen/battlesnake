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

function fillOtherSnakesInMultipleSteps() {
}

function testThreeStepsAheadRecursively() {
  // if dumb move found, we exculde that move at all to optimized in some situation
  // when the move has no food, make sure we also remove our own tail
}

function findNextLeastDangerousMove(grid, mySnake, snakes, foods) {
  Immutable.fromJS([3, 2, 1, 0]).map(i => {
    // fillOtherSnakesInMultipleSteps(i)
    // testThreeStepsAheadRecursively()
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
  findNextLeastDangerousMove : findNextLeastDangerousMove
}
