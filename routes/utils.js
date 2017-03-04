//: D
// 1
function findHead(mySnake, otherSnakes) {
	return [1, 1]
}

//: B,D
// 3
function findClosestFood(snakeHead, food) {
  // we need to use A* to find it
  // for food in food
    // A* each food
  return [1, 9]
}

//: D
// 1
function getDirection(from, to) {
  // one of: ['up','down','left','right']
  return [1, 9]
}

//: B
// 2
function initGrid(argument) {
  // body...
}

//: B
// 1
function printGrid(argument) {
  // body...
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
  printGrid: printGrid,
  findNextMove: findNextMove
}
