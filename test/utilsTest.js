var pf = require('pathfinding')
var Immutable =require('immutable')
const assert = require('assert')
const utils = require('../routes/utils')

// example of array index
// url: http://www.homeandlearn.co.uk/NET/images/multi_arrays.gif
// F H 0 0 0 0 0 F 0 0 0 0 0 0 0 0 0 0 0 F
// 0 A 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
// 0 A 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
// 0 T 0 0 0 0 0 0 0 T 0 0 0 0 0 0 0 0 0 0
// 0 0 0 0 0 0 0 0 0 B 0 0 0 0 0 0 0 0 0 0
// 0 0 0 0 0 0 0 0 0 B 0 0 0 0 0 0 0 0 0 0
// 0 0 0 0 0 T M H 0 H 0 0 0 0 0 0 0 0 0 0
// 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
// 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
// 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
// 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
// 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
// 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
// 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
// 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
// 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
// 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
// 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
// 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
// F 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 F
const otherSnakes = Immutable.fromJS([
  {
    "taunt": "git gud",
    "name": "M",
    "id": "2c4d4d70-8cca-48e0-ac9d-03ecafca0c98",
    "health_points": 93,
    "coords": [
      [
        6,
        7
      ],
      [
        6,
        6
      ],
      [
        6,
        5
      ]
    ]
  },
  {
    "taunt": "gotta go fast",
    "name": "A",
    "id": "c35dcf26-7f48-492c-b7b5-94ae78fbc713",
    "health_points": 50,
    "coords": [
      [
        0,
        1
      ],
      [
        1,
        1
      ],
      [
        2,
        1
      ],
      [
        3,
        1
      ]
    ]
  },
  {
    "taunt": "gotta go fast",
    "name": "B",
    "id": "c35pcf26-7f48-492c-b7b5-94ae78fbc71a",
    "health_points": 35,
    "coords": [
      [
        6,
        9
      ],
      [
        5,
        9
      ],
      [
        4,
        9
      ],
      [
        3,
        9
      ]
    ]
  }
])
const food = Immutable.fromJS([
  [
    0,
    7
  ],
  [
    0,
    19
  ],
  [
    19,
    19
  ],
  [
    19,
    0
  ],
  [
    0,
    0
  ]
])

describe('Testing the functions in utils', function() {
  describe('#findClosestFoodAndPath()', function() {
    it("should return the closest food around my own snake's head", function() {
      var snakeHead;
      const grid = new pf.Grid(
        utils.initGrid(Immutable.Map({
          width: 20,
          height: 20,
          snakes: otherSnakes
        }))
      )

      snakeHead = Immutable.List([0, 15])
      assert.equal(utils.findClosestFoodAndPath(snakeHead, food, grid).getIn(['closestFood', 0]), 0)
      assert.equal(utils.findClosestFoodAndPath(snakeHead, food, grid).getIn(['closestFood', 1]), 19)

      snakeHead = Immutable.List([15, 15])
      assert.equal(utils.findClosestFoodAndPath(snakeHead, food, grid).getIn(['closestFood', 0]), 19)
      assert.equal(utils.findClosestFoodAndPath(snakeHead, food, grid).getIn(['closestFood', 1]), 19)

      snakeHead = Immutable.List([14, 0])
      assert.equal(utils.findClosestFoodAndPath(snakeHead, food, grid).getIn(['closestFood', 0]), 19)
      assert.equal(utils.findClosestFoodAndPath(snakeHead, food, grid).getIn(['closestFood', 1]), 0)
    })
  })
  describe('#getDirection()', function() {
    it("should return up, down, right or left given the starting and ending points", function() {
      var from;
      var to;

      from = [5, 5]
      to = [5, 6]
      assert.equal(utils.getDirection(from, to), 'down')

      from = [5, 5]
      to = [6, 5]
      assert.equal(utils.getDirection(from, to), 'right')

      from = [5, 5]
      to = [5, 4]
      assert.equal(utils.getDirection(from, to), 'up')

      from = [5, 5]
      to = [4, 5]
      assert.equal(utils.getDirection(from, to), 'left')
    })
  })
  describe('#initGrid()', function() {
    it("should return a 2D array where it mark snake's body as 1 and other coord as 0", function() {
      const grid = utils.initGrid(Immutable.Map({
        width: 20,
        height: 20,
        snakes: otherSnakes
      }))

      otherSnakes.map((snake, i) => {
        snake.get('coords').map((pos, j) => {
          assert.equal(grid[pos.get(1)][pos.get(0)], 1)
        })
      })
    })
  })
  describe('#getPossibleMove()', function() {
    it("should only return possible move based on the position of the head", function() {
      var grid = new pf.Grid(utils.initGrid(Immutable.Map({
        width: 20,
        height: 20,
        snakes: otherSnakes
      })))
      var data = Immutable.Map({
        myHead: otherSnakes.getIn([0, 'coords', 0]),
        grid: grid
      })
      var possibleMoves, snakes

      // when our snake is at the middle
      possibleMoves = utils.getPossibleMove(data)

      assert.equal(possibleMoves.size, 3)
      assert.equal(possibleMoves.get(0)[0], 6)
      assert.equal(possibleMoves.get(0)[1], 8)
      assert.equal(possibleMoves.get(1)[0], 7)
      assert.equal(possibleMoves.get(1)[1], 7)
      assert.equal(possibleMoves.get(2)[0], 5)
      assert.equal(possibleMoves.get(2)[1], 7)

      // when our snake is at the top left side
      snakes = otherSnakes.setIn([0, 'coords'], Immutable.fromJS([
        [0, 0],
        [0, 1],
        [0, 2]
      ]))
      grid = new pf.Grid(utils.initGrid(Immutable.Map({
        width: 20,
        height: 20,
        snakes: snakes
      })))
      data = Immutable.Map({
        myHead: Immutable.List([0, 0]),
        grid: grid
      })
      possibleMoves = utils.getPossibleMove(data)

      assert.equal(possibleMoves.size, 1)
      assert.equal(possibleMoves.get(0)[0], 1)
      assert.equal(possibleMoves.get(0)[1], 0)

      // when our snake is at the bottom left side
      snakes = otherSnakes.setIn([0, 'coords'], Immutable.fromJS([
        [0, 17],
        [0, 18],
        [0, 19]
      ]))
      grid = new pf.Grid(utils.initGrid(Immutable.Map({
        width: 20,
        height: 20,
        snakes: snakes
      })))
      data = Immutable.Map({
        myHead: Immutable.List([0, 17]),
        grid: grid
      })
      possibleMoves = utils.getPossibleMove(data)

      assert.equal(possibleMoves.size, 2)
      assert.equal(possibleMoves.get(0)[0], 1)
      assert.equal(possibleMoves.get(0)[1], 17)
      assert.equal(possibleMoves.get(1)[0], 0)
      assert.equal(possibleMoves.get(1)[1], 16)

      // when our snake is at the top right side
      snakes = otherSnakes.setIn([0, 'coords'], Immutable.fromJS([
        [19, 0],
        [19, 1],
        [19, 2]
      ]))
      grid = new pf.Grid(utils.initGrid(Immutable.Map({
        width: 20,
        height: 20,
        snakes: snakes
      })))
      data = Immutable.Map({
        myHead: Immutable.List([19, 0]),
        grid: grid
      })
      possibleMoves = utils.getPossibleMove(data)

      assert.equal(possibleMoves.size, 1)
      assert.equal(possibleMoves.get(0)[0], 18)
      assert.equal(possibleMoves.get(0)[1], 0)

      // when our snake is at the bottom right side
      snakes = otherSnakes.setIn([0, 'coords'], Immutable.fromJS([
        [19, 17],
        [19, 18],
        [19, 19]
      ]))
      grid = new pf.Grid(utils.initGrid(Immutable.Map({
        width: 20,
        height: 20,
        snakes: snakes
      })))
      data = Immutable.Map({
        myHead: Immutable.List([19, 17]),
        grid: grid
      })
      possibleMoves = utils.getPossibleMove(data)

      assert.equal(possibleMoves.size, 2)
      assert.equal(possibleMoves.get(0)[0], 19)
      assert.equal(possibleMoves.get(0)[1], 16)
      assert.equal(possibleMoves.get(1)[0], 18)
      assert.equal(possibleMoves.get(1)[1], 17)

      // when our snake is at the middle left side
      snakes = otherSnakes.setIn([0, 'coords'], Immutable.fromJS([
        [0, 10],
        [0, 11],
        [0, 12]
      ]))
      grid = new pf.Grid(utils.initGrid(Immutable.Map({
        width: 20,
        height: 20,
        snakes: snakes
      })))
      data = Immutable.Map({
        myHead: Immutable.List([0, 10]),
        grid: grid
      })
      possibleMoves = utils.getPossibleMove(data)

      assert.equal(possibleMoves.size, 2)
      assert.equal(possibleMoves.get(0)[0], 1)
      assert.equal(possibleMoves.get(0)[1], 10)
      assert.equal(possibleMoves.get(1)[0], 0)
      assert.equal(possibleMoves.get(1)[1], 9)

      // when our snake is at the middle right side
      snakes = otherSnakes.setIn([0, 'coords'], Immutable.fromJS([
        [19, 10],
        [19, 11],
        [19, 12]
      ]))
      grid = new pf.Grid(utils.initGrid(Immutable.Map({
        width: 20,
        height: 20,
        snakes: snakes
      })))
      data = Immutable.Map({
        myHead: Immutable.List([19, 10]),
        grid: grid
      })
      possibleMoves = utils.getPossibleMove(data)

      assert.equal(possibleMoves.size, 2)
      assert.equal(possibleMoves.get(0)[0], 19)
      assert.equal(possibleMoves.get(0)[1], 9)
      assert.equal(possibleMoves.get(1)[0], 18)
      assert.equal(possibleMoves.get(1)[1], 10)

      // when our snake is at the top middle side
      snakes = otherSnakes.setIn([0, 'coords'], Immutable.fromJS([
        [10, 0],
        [10, 1],
        [10, 2]
      ]))
      grid = new pf.Grid(utils.initGrid(Immutable.Map({
        width: 20,
        height: 20,
        snakes: snakes
      })))
      data = Immutable.Map({
        myHead: Immutable.List([10, 0]),
        grid: grid
      })
      possibleMoves = utils.getPossibleMove(data)

      assert.equal(possibleMoves.size, 2)
      assert.equal(possibleMoves.get(0)[0], 11)
      assert.equal(possibleMoves.get(0)[1], 0)
      assert.equal(possibleMoves.get(1)[0], 9)
      assert.equal(possibleMoves.get(1)[1], 0)

      // when our snake is at the bottom middle side
      snakes = otherSnakes.setIn([0, 'coords'], Immutable.fromJS([
        [10, 17],
        [10, 18],
        [10, 19]
      ]))
      grid = new pf.Grid(utils.initGrid(Immutable.Map({
        width: 20,
        height: 20,
        snakes: snakes
      })))
      data = Immutable.Map({
        myHead: Immutable.List([10, 17]),
        grid: grid
      })
      possibleMoves = utils.getPossibleMove(data)

      assert.equal(possibleMoves.size, 3)
      assert.equal(possibleMoves.get(0)[0], 11)
      assert.equal(possibleMoves.get(0)[1], 17)
      assert.equal(possibleMoves.get(1)[0], 10)
      assert.equal(possibleMoves.get(1)[1], 16)
      assert.equal(possibleMoves.get(2)[0], 9)
      assert.equal(possibleMoves.get(2)[1], 17)
    })
  })
  describe('#checkIfItIsOthersDangerousZone()', function() {
    it("should return true if it is some other snakes' dangerous zone and their length", function() {
      var data = Immutable.Map({
                  otherSnakes: otherSnakes,
                  myHead: otherSnakes.getIn([0, 'coords', 0]),
                  grid: new pf.Grid(utils.initGrid(Immutable.Map({
                    width: 20,
                    height: 20,
                    snakes: otherSnakes
                  })))
                 })

      data = data.set('nextPossibleMoveFromUs', [6, 8])
      var ifItIsOthersDangerousZone = utils.checkIfItIsOthersDangerousZone(data)
      assert.equal(ifItIsOthersDangerousZone.get('itIsOthersDangerousZone'), true)
      assert.equal(ifItIsOthersDangerousZone.get('lengthOfOtherSnake'), 4)

      data = data.set('nextPossibleMoveFromUs', [0, 0])
      ifItIsOthersDangerousZone = utils.checkIfItIsOthersDangerousZone(data)
      assert.equal(ifItIsOthersDangerousZone.get('itIsOthersDangerousZone'), true)
      assert.equal(ifItIsOthersDangerousZone.get('lengthOfOtherSnake'), 4)

      data = data.set('nextPossibleMoveFromUs', [15, 15])
      ifItIsOthersDangerousZone = utils.checkIfItIsOthersDangerousZone(data)
      assert.equal(ifItIsOthersDangerousZone.get('itIsOthersDangerousZone'), false)
      assert.equal(ifItIsOthersDangerousZone.get('lengthOfOtherSnake'), 0)
    })
  })
})
