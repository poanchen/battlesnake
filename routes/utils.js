var pf = require('pathfinding')

function findHead(mySnake, otherSnakes) {
  for (var i = 0; i < otherSnakes.length; i++) {
      if (otherSnakes[i].id == mySnake.id) {
        return otherSnakes[i].coords[0]
      }
  }
  return []
}

function findClosestFoodAndPath(snakeHead, food, grid) {
  var finder = new pf.AStarFinder()
  var originalGrid = grid.clone()
  var path
  var shortestPath
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
    return 'right'
  } else if (x == -1) {
    return 'left'
  } else if (y == -1) {
    return 'up'
  } else if (y == 1) {
    return 'down'
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

function findNextMove(data) {
  // [1, 1, 1, 1, 1, 1, 1, 1],
  // [1, 0, 0, 0, 0, 0, 0, 1],
  // [1, 0, 0, 0, 0, 0, 0, 1],
  // [1, 0, M, T, G, G, 0, 1],
  // [1, F, M, F, H, T, 0, 1],
  // [1, 0, M, 0, 0, 0, 0, 1],
  // [1, 0, M, 0, 0, 0, 0, 1],
  // [1, 0, H, 0, 0, 0, 0, 1],
  // [1, 1, 1, 1, 1, 1, 1, 1],

  // if attack mode
  // try to trap someone
    // force them to do a longest path alg
  // try to head on someone
    // get to dangerous zone
    // predict the highest possiblibty for other snake's next move

  // don't get trap
    // 

  // check if it is other snake's dangerous zone

  // console.log(findHead())

  // if true
    // check their length
    // if we are longer than him/her
      // go ahead
    // if we are not longer than him/her
      // give up the food when other snake is closer **
      // ?
  // else
    // don't trap yourself *****
    // slow down once at certain length
    // go ahead
  // there is either no food or not possible to get to any food at this moment
  if (data.closestFood === undefined || data.shortestPath === undefined) {
    console.log(data)
  }

  return getDirection(data.shortestPath[0], data.shortestPath[1])
}

module.exports = {
  findHead: findHead,
  findClosestFoodAndPath: findClosestFoodAndPath,
  getDirection: getDirection,
  initGrid: initGrid,
  findNextMove: findNextMove
}
