var pf = require('pathfinding')

//: D
// 1
function findHead(mySnake, otherSnakes) {
	return [1, 1]
}

//: B,D
// 3
function findClosestFood(snakeHead, food, grid) {
  var finder = new pf.AStarFinder();
  var originalGrid = grid.clone();
  var path
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
      closestFoodLength = path.length
      closestFood = food[i]
    }
    grid = originalGrid.clone()
  }

  return closestFood
}

//: D
// 1
function getDirection(from, to) {
  // one of: ['up','down','left','right']
  return [1, 9]
}

//: B
// 2
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
      x = data.snakes[i].coords[j][0]
      y = data.snakes[i].coords[j][1]
      grid[x][y] = 1
    }
  }

  return grid
}

//: B, D
//: 5
function findNextMove(mySnake, otherSnakes, closestFood) {
  // using A* to find the shorest path to the closest food
  // the path could look something like this [ [ 1, 2 ], [ 1, 1 ], [ 2, 1 ], [ 3, 1 ], [ 3, 2 ], [ 4, 2 ] ]
  // c: [5 ,5] -> [5, 6]
  // up
  // c: [5 ,5] -> [6, 5]
  // right
  // c: [5 ,5] -> [5, 4]
  // down
  // c: [5 ,5] -> [4, 5]
  // left

  //    X
  //   XSXOBBB
  //    B
  //    B
  //    B
  //    B
  // S is our head
  // B is our body
  // X is the only possible move
  // O is other snake

  // 6x7
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

  return 'right'
}

module.exports = {
	findHead: findHead,
  findClosestFood: findClosestFood,
  getDirection: getDirection,
  initGrid: initGrid,
  findNextMove: findNextMove
}
