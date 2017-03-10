var express = require('express')
var router  = express.Router()
var config = require('../config.json')
var pf = require('pathfinding')
var utils = require('./utils')
var Immutable = require('immutable')

// Handle POST request to '/start'
router.post(config.route.start, function (req, res) {
  return res.json(Immutable.Map({
    color: config.snake.color,
    name: config.snake.name
    // head_url: config.snake.head_url,
    // head_type: config.snake.head_type,
    // tail_type: config.snake.tail_type,
    // taunt: config.snake.taunt.start
  }).toJSON())
})

// Handle POST request to '/move'
router.post(config.route.move, function (req, res) {
  var body = Immutable.fromJS(req.body)
  var mySnake = Immutable.Map({
    id: body.get('you')
  })
  var otherSnakes = body.get('snakes')
  var food = body.get('food')
  var grid = new pf.Grid(utils.initGrid(Immutable.Map({
    width: body.get('width'),
    height: body.get('height'),
    snakes: otherSnakes
  })))

  var resultFromFindClosestFood = utils.findClosestFoodAndPath(
    otherSnakes.getIn([0, 'coords', 0]), food, grid)

  // console.log(utils.initGrid(Immutable.Map({
  //   width: body.get('width'),
  //   height: body.get('height'),
  //   snakes: otherSnakes
  // })))

  return res.json(Immutable.Map({
    move: utils.findNextMove(Immutable.Map({
      grid: grid,
      mySnake: mySnake,
      otherSnakes: otherSnakes,
      closestFood: resultFromFindClosestFood.get('closestFood'),
      shortestPath: resultFromFindClosestFood.get('shortestPath')
    })),
    taunt: config.snake.taunt.move
  }).toJSON())
})

module.exports = router
