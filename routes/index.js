var express = require('express')
var router  = express.Router()
var config = require('../config.json')
var pf = require('pathfinding')
var utils = require('./utils')
var Immutable = require('immutable')

// Handle POST request to '/start'
router.post(config.route.start, function (req, res) {
  return res.json(Immutable.Map({
    color : config.snake.color,
    secondary_color : config.snake.secondary_color,
    head_url : config.snake.head_url,
    taunt : config.snake.taunt.start
  }).toJSON())
})

// Handle POST request to '/move'
router.post(config.route.move, function (req, res) {
  var body = Immutable.fromJS(req.body)
  var mySnake = body.get('you')
  var snakes = body.getIn(['snakes', 'data'])
  var grid = utils.initGrid(body.get('width'), body.get('height'), snakes)
  var leastDangerousMove = utils.findNextLeastDangerousMove(grid, mySnake, snakes, body.getIn(['food', 'data']), body.get('turn'))
  return res.json(Immutable.Map({
    move : leastDangerousMove,
    taunt : config.snake.taunt.move + " Let's go " + leastDangerousMove + "!!!"
  }).toJSON())
})

// Handle POST request to '/end'
router.post(config.route.end, function (req, res) {
  res.status(200)
  res.end()
})

module.exports = router
