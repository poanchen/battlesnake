var pf = require('pathfinding')

//: D
// 1
function findHead(mySnake, otherSnakes) {

  for(var i=0;i<otherSnakes.length;i++){
      if(otherSnakes[i].id==mySnake.id){
        return otherSnakes[i].coords[0]
      }
  }
  return []
}

//: B,D
// 3
function findClosestFoodAndPath(snakeHead, food, grid) {
  var finder = new pf.AStarFinder();
  var originalGrid = grid.clone();
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

//: D
// 1
function getDirection(from, to) {
  // one of: ['up','down','left','right']
   var dirx = to[0] - from[0]
    var diry = to[1] - from[1]

    if (dirx == 1){
        return 'right'
      }
    else if( dirx == -1){
        return 'left'
      }
    else if (diry == -1){
        return 'up'
    }
    else if (diry == 1){
        return 'down'
      }
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
      x = data.snakes[i].coords[j][1]
      y = data.snakes[i].coords[j][0]
      grid[x][y] = 1

      if (data.myHead[0] == x && data.myHead[1] == y) {
        continue;
      } else {
        if (
          x < data.width &&
          y - 1 < data.height &&
          x >= 0 &&
          y - 1 >= 0) {
          grid[x][y-1] = 1
        }

        if (
          x < data.width &&
          y + 1 < data.height &&
          x >= 0 &&
          y + 1 >= 0) {
          grid[x][y+1] = 1
        }

        if (
          x + 1 < data.width &&
          y < data.height &&
          x + 1 >= 0 &&
          y >= 0) {
          grid[x+1][y] = 1
        }

        if (
          x - 1 < data.width &&
          y < data.height &&
          x - 1 >= 0 &&
          y >= 0) {
          grid[x-1][y] = 1
        }
      }
    }
  }

  return grid
}

//: B, D
//: 5
function findNextMove(data) {
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

  return getDirection(data.shortestPath[0], data.shortestPath[1])
}

module.exports = {
  findHead: findHead,
  findClosestFoodAndPath: findClosestFoodAndPath,
  getDirection: getDirection,
  initGrid: initGrid,
  findNextMove: findNextMove
}
