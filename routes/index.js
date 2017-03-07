var express = require('express')
var router  = express.Router()
var config = require('../config.json')
var pf = require('pathfinding')
var utils = require('./utils')

// Handle POST request to '/start'
router.post(config.route.start, function (req, res) {

  return res.json({
    color: config.snake.color,
    name: config.snake.name,
    head_url: config.snake.head_url,
    head_type: config.snake.head_type,
    tail_type: config.snake.tail_type,
    taunt: config.snake.taunt.start
  })
})

// Handle POST request to '/move'
router.post(config.route.move, function (req, res) {
  var body = req.body
  var mySnake = {
    id: body.you
  }
  var otherSnakes = body.snakes
  var food = body.food
  var nextMove = 'up'
  var grid = new pf.Grid(utils.initGrid({
    width: body.width,
    height: body.height,
    snakes: otherSnakes
  }))
  var resultFromFindClosestFood = utils.findClosestFoodAndPath(
    utils.findHead(mySnake, otherSnakes), food, grid)

  console.log(utils.initGrid({
    width: body.width,
    height: body.height,
    snakes: otherSnakes
  }))

  nextMove = utils.findNextMove({
    grid: grid,
    mySnake: mySnake,
    otherSnakes: otherSnakes,
    closestFood: resultFromFindClosestFood.closestFood,
    shortestPath: resultFromFindClosestFood.shortestPath
  })

  return res.json({
    move: nextMove,
    taunt: config.snake.taunt.move
  })
})

module.exports = router
