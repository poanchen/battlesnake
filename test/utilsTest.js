const pf = require('pathfinding')
var Immutable = require('immutable')
const assert = require('assert')
const utils = require('../routes/utils')
var config = require('../config.json')

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
const snakes = Immutable.fromJS([
  {
    "taunt" : "git gud",
    "name" : "M",
    "id" : "2c4d4d70-8cca-48e0-ac9d-03ecafca0c98",
    "health" : 93,
    "body" : {
      "data" : [
        {
          "object" : "point",
          "x": 6,
          "y": 7
        },
        {
          "object" : "point",
          "x": 6,
          "y": 6
        },
        {
          "object" : "point",
          "x": 6,
          "y": 5
        }
      ]
    }
  },
  {
    "taunt" : "gotta go fast",
    "name" : "A",
    "id" : "c35dcf26-7f48-492c-b7b5-94ae78fbc713",
    "health" : 50,
    "body" : {
      "data" : [
        {
          "object" : "point",
          "x": 0,
          "y": 1
        },
        {
          "object" : "point",
          "x": 1,
          "y": 1
        },
        {
          "object" : "point",
          "x": 2,
          "y": 1
        },
        {
          "object" : "point",
          "x": 3,
          "y": 1
        }
      ]
    }
  },
  {
    "taunt" : "gotta go fast",
    "name" : "B",
    "id" : "c35pcf26-7f48-492c-b7b5-94ae78fbc71a",
    "health" : 35,
    "body" : {
      "data" : [
        {
          "object" : "point",
          "x": 6,
          "y": 9
        },
        {
          "object" : "point",
          "x": 5,
          "y": 9
        },
        {
          "object" : "point",
          "x": 4,
          "y": 9
        },
        {
          "object" : "point",
          "x": 3,
          "y": 9
        }
      ]
    }
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
  describe('#initGrid()', function() {
    it("should return a 2D array where it mark snake's body as 1 and other position as 0", function() {
      const grid = utils.initGrid(20, 20, snakes)
      // Make sure all the one in the grid should be there
      snakes.map((eachSnake, i) => {
        eachSnake.getIn(['body', 'data']).map(eachSnakeBody => {
          assert.equal(grid[eachSnakeBody.get('y')][eachSnakeBody.get('x')], 1)
        })
      })
      // Make sure the grid does not contain number other than zero and one
      assert.equal(
        Immutable.fromJS(grid)
          .flatten(true)
          .filter(eachIndex => eachIndex != 1 && eachIndex != 0).size,
        0)
      // Make sure the count of ones in the grid is exactly the same as what we expected
      var sumOfOnes = snakes.map(eachSnake => eachSnake.getIn(['body', 'data']).size)
        .reduce((a, b) => a + b, 0)
      assert.equal(
        Immutable.fromJS(grid)
          .flatten(true)
          .filter(eachIndex => eachIndex == 1).size,
        sumOfOnes)
    })
  }),
  describe('#getDirection()', function() {
    it("should return up, down, right or left given the starting and ending points", function() {
      assert.equal(utils.getDirection([5, 5], [5, 6]), config.direction.down)
      assert.equal(utils.getDirection([5, 5], [6, 5]), config.direction.right)
      assert.equal(utils.getDirection([5, 5], [5, 4]), config.direction.up)
      assert.equal(utils.getDirection([5, 5], [4, 5]), config.direction.left)
    })
  }),
  describe('#getNewHead()', function() {
    it("should return a new position given head, direction", function() {
      assert.deepEqual(utils.getNewHead([6, 9], config.direction.left), [5,9])
      assert.deepEqual(utils.getNewHead([6, 9], config.direction.right), [7,9])
      assert.deepEqual(utils.getNewHead([6, 9], config.direction.down), [6,10])
      assert.deepEqual(utils.getNewHead([6, 9], config.direction.up), [6,8])
    })
  })
})
