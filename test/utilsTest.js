var pf = require('pathfinding')
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
const otherSnakes = [
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
]
const food = [
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
]

describe('Testing the functions in utils', function() {
  describe('#findHead()', function() {
    it("should return the head of my own snake", function() {
      const mySnake = {}

      mySnake.id = "2c4d4d70-8cca-48e0-ac9d-03ecafca0c98"
      assert.equal(utils.findHead(mySnake, otherSnakes)[0], 6)
      assert.equal(utils.findHead(mySnake, otherSnakes)[1], 7)

      mySnake.id = "c35dcf26-7f48-492c-b7b5-94ae78fbc713"
      assert.equal(utils.findHead(mySnake, otherSnakes)[0], 0)
      assert.equal(utils.findHead(mySnake, otherSnakes)[1], 1)

      mySnake.id = "c35pcf26-7f48-492c-b7b5-94ae78fbc71a"
      assert.equal(utils.findHead(mySnake, otherSnakes)[0], 6)
      assert.equal(utils.findHead(mySnake, otherSnakes)[1], 9)
    })
  })
  describe('#findClosestFoodAndPath()', function() {
    it("should return the closest food around my own snake's head", function() {
      var snakeHead;
      const grid = new pf.Grid(
        utils.initGrid({
          width: 20,
          height: 20,
          snakes: otherSnakes
        })
      )

      snakeHead = [0, 15]
      assert.equal(utils.findClosestFoodAndPath(snakeHead, food, grid).closestFood[0], 0)
      assert.equal(utils.findClosestFoodAndPath(snakeHead, food, grid).closestFood[1], 19)

      snakeHead = [15, 15]
      assert.equal(utils.findClosestFoodAndPath(snakeHead, food, grid).closestFood[0], 19)
      assert.equal(utils.findClosestFoodAndPath(snakeHead, food, grid).closestFood[1], 19)

      snakeHead = [14, 0]
      assert.equal(utils.findClosestFoodAndPath(snakeHead, food, grid).closestFood[0], 19)
      assert.equal(utils.findClosestFoodAndPath(snakeHead, food, grid).closestFood[1], 0)
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
      const data = {
        width: 20,
        height: 20,
        snakes: otherSnakes
      }
      const grid = utils.initGrid(data)
      var i

      // make sure each snake's coord are 1 in the grid
      var x, y
      for (var i = 0; i < data.snakes.length; i++) {
        for (var j = 0; j < data.snakes[i].coords.length; j++) {
          x = data.snakes[i].coords[j][1]
          y = data.snakes[i].coords[j][0]
          assert.equal(grid[x][y], 1)
        }
      }
    })
  })
  describe('#getPossibleMove()', function() {
    it("should only return possible move based on the position of the head", function() {
      var mySnake = {
        id: "2c4d4d70-8cca-48e0-ac9d-03ecafca0c98"
      }
      var snakes = otherSnakes
      var grid = new pf.Grid(utils.initGrid({
        width: 20,
        height: 20,
        snakes: snakes
      }))
      var data = {
        mySnake: mySnake,
        otherSnakes: snakes,
        grid: grid
      }

      // when our snake is at the middle
      assert.equal(utils.getPossibleMove(data).length, 3)
      assert.equal(utils.getPossibleMove(data)[0][0], 6)
      assert.equal(utils.getPossibleMove(data)[0][1], 8)
      assert.equal(utils.getPossibleMove(data)[1][0], 7)
      assert.equal(utils.getPossibleMove(data)[1][1], 7)
      assert.equal(utils.getPossibleMove(data)[2][0], 5)
      assert.equal(utils.getPossibleMove(data)[2][1], 7)

      // when our snake is at the top left side
      snakes[0].coords = [
        [0, 0],
        [0, 1],
        [0, 2]
      ]
      grid = new pf.Grid(utils.initGrid({
        width: 20,
        height: 20,
        snakes: snakes
      }))
      data = {
        mySnake: mySnake,
        otherSnakes: snakes,
        grid: grid
      }

      assert.equal(utils.getPossibleMove(data).length, 1)
      assert.equal(utils.getPossibleMove(data)[0][0], 1)
      assert.equal(utils.getPossibleMove(data)[0][1], 0)

      // when our snake is at the bottom left side
      snakes[0].coords = [
        [0, 17],
        [0, 18],
        [0, 19]
      ]
      grid = new pf.Grid(utils.initGrid({
        width: 20,
        height: 20,
        snakes: snakes
      }))
      data = {
        mySnake: mySnake,
        otherSnakes: snakes,
        grid: grid
      }

      assert.equal(utils.getPossibleMove(data).length, 2)
      assert.equal(utils.getPossibleMove(data)[0][0], 1)
      assert.equal(utils.getPossibleMove(data)[0][1], 17)
      assert.equal(utils.getPossibleMove(data)[1][0], 0)
      assert.equal(utils.getPossibleMove(data)[1][1], 16)

      // when our snake is at the top right side
      snakes[0].coords = [
        [19, 17],
        [19, 18],
        [19, 19]
      ]
      grid = new pf.Grid(utils.initGrid({
        width: 20,
        height: 20,
        snakes: snakes
      }))
      data = {
        mySnake: mySnake,
        otherSnakes: snakes,
        grid: grid
      }

      assert.equal(utils.getPossibleMove(data).length, 2)
      assert.equal(utils.getPossibleMove(data)[0][0], 19)
      assert.equal(utils.getPossibleMove(data)[0][1], 16)
      assert.equal(utils.getPossibleMove(data)[1][0], 18)
      assert.equal(utils.getPossibleMove(data)[1][1], 17)

      // when our snake is at the bottom right side
      snakes[0].coords = [
        [19, 17],
        [19, 18],
        [19, 19]
      ]
      grid = new pf.Grid(utils.initGrid({
        width: 20,
        height: 20,
        snakes: snakes
      }))
      data = {
        mySnake: mySnake,
        otherSnakes: snakes,
        grid: grid
      }

      assert.equal(utils.getPossibleMove(data).length, 2)
      assert.equal(utils.getPossibleMove(data)[0][0], 19)
      assert.equal(utils.getPossibleMove(data)[0][1], 16)
      assert.equal(utils.getPossibleMove(data)[1][0], 18)
      assert.equal(utils.getPossibleMove(data)[1][1], 17)

      // when our snake is at the middle left side
      snakes[0].coords = [
        [19, 17],
        [19, 18],
        [19, 19]
      ]
      grid = new pf.Grid(utils.initGrid({
        width: 20,
        height: 20,
        snakes: snakes
      }))
      data = {
        mySnake: mySnake,
        otherSnakes: snakes,
        grid: grid
      }

      assert.equal(utils.getPossibleMove(data).length, 2)
      assert.equal(utils.getPossibleMove(data)[0][0], 19)
      assert.equal(utils.getPossibleMove(data)[0][1], 16)
      assert.equal(utils.getPossibleMove(data)[1][0], 18)
      assert.equal(utils.getPossibleMove(data)[1][1], 17)

      // when our snake is at the middle right side
      snakes[0].coords = [
        [19, 10],
        [19, 11],
        [19, 12]
      ]
      grid = new pf.Grid(utils.initGrid({
        width: 20,
        height: 20,
        snakes: snakes
      }))
      data = {
        mySnake: mySnake,
        otherSnakes: snakes,
        grid: grid
      }

      assert.equal(utils.getPossibleMove(data).length, 2)
      assert.equal(utils.getPossibleMove(data)[0][0], 19)
      assert.equal(utils.getPossibleMove(data)[0][1], 9)
      assert.equal(utils.getPossibleMove(data)[1][0], 18)
      assert.equal(utils.getPossibleMove(data)[1][1], 10)

      // when our snake is at the top middle side
      snakes[0].coords = [
        [10, 0],
        [10, 1],
        [10, 2]
      ]
      grid = new pf.Grid(utils.initGrid({
        width: 20,
        height: 20,
        snakes: snakes
      }))
      data = {
        mySnake: mySnake,
        otherSnakes: snakes,
        grid: grid
      }

      assert.equal(utils.getPossibleMove(data).length, 2)
      assert.equal(utils.getPossibleMove(data)[0][0], 11)
      assert.equal(utils.getPossibleMove(data)[0][1], 0)
      assert.equal(utils.getPossibleMove(data)[1][0], 9)
      assert.equal(utils.getPossibleMove(data)[1][1], 0)

      // when our snake is at the bottom middle side
      snakes[0].coords = [
        [10, 17],
        [10, 18],
        [10, 19]
      ]
      grid = new pf.Grid(utils.initGrid({
        width: 20,
        height: 20,
        snakes: snakes
      }))
      data = {
        mySnake: mySnake,
        otherSnakes: snakes,
        grid: grid
      }

      assert.equal(utils.getPossibleMove(data).length, 3)
      assert.equal(utils.getPossibleMove(data)[0][0], 11)
      assert.equal(utils.getPossibleMove(data)[0][1], 17)
      assert.equal(utils.getPossibleMove(data)[1][0], 10)
      assert.equal(utils.getPossibleMove(data)[1][1], 16)
      assert.equal(utils.getPossibleMove(data)[2][0], 9)
      assert.equal(utils.getPossibleMove(data)[2][1], 17)
    })
  })
  describe('#checkIfItIsOthersDangerousZone()', function() {
    it("should return true if it is some other snakes' dangerous zone and their length", function() {
      var data = {
        mySnake: {
          id: "2c4d4d70-8cca-48e0-ac9d-03ecafca0c98"
        },
        otherSnakes: otherSnakes,
        grid: new pf.Grid(utils.initGrid({
          width: 20,
          height: 20,
          snakes: otherSnakes
        }))
      }

      var pt = [6, 8]
      var ifItIsOthersDangerousZone = utils.checkIfItIsOthersDangerousZone(data, pt)
      assert.equal(ifItIsOthersDangerousZone.itIsOthersDangerousZone, true)
      assert.equal(ifItIsOthersDangerousZone.lengthOfOtherSnake, 4)

      pt = [0, 0]
      ifItIsOthersDangerousZone = utils.checkIfItIsOthersDangerousZone(data, pt)
      assert.equal(ifItIsOthersDangerousZone.itIsOthersDangerousZone, true)
      assert.equal(ifItIsOthersDangerousZone.lengthOfOtherSnake, 4)

      pt = [15, 15]
      ifItIsOthersDangerousZone = utils.checkIfItIsOthersDangerousZone(data, pt)
      assert.equal(ifItIsOthersDangerousZone.itIsOthersDangerousZone, false)
      assert.equal(ifItIsOthersDangerousZone.lengthOfOtherSnake, 0)
    })
  })
})
