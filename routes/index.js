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
    secondary_color: config.snake.secondary_color,
    head_url: config.snake.head_url,
    taunt: config.snake.taunt.start
  }).toJSON())
})

// Handle POST request to '/move'
router.post(config.route.move, function (req, res) {
  var body = Immutable.fromJS(req.body)
  var grid = new pf.Grid(
    utils.initGrid(
      body.get('width'),
      body.get('height'),
      body.getIn(['snakes', 'data']),
      body.getIn(['food', 'data'])
    )
  )
  var closestFoodAndPath = utils.findClosestFoodAndPath(
    body.getIn(['you', 'body', 'data', 0]), body.getIn(['food', 'data']), grid)
  return res.json(Immutable.Map({
    move: utils.findNextLeastDangerousMove(Immutable.Map({
      grid: grid,
      turn: body.get('turn'),
      mySnake: body,
      otherSnakes: body.get('snakes'),
      closestFood: closestFoodAndPath.get('closestFood'),
      shortestPath: closestFoodAndPath.get('shortestPath')
    }))
  }).toJSON())
})

module.exports = router
