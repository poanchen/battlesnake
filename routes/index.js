var express = require('express')
var router  = express.Router()
var config = require('../config.json')
var pf = require('pathfinding')
var utils = require('./utils')

// Handle POST request to '/start'
router.post(config.route.start, function (req, res) {
  // NOTE: Do something here to start the game

  // Response data
  var data = {
    color: config.snake.color,
    name: config.snake.name,
    head_url: config.snake.head_url,
    head_type: config.snake.head_type,
    tail_type: config.snake.tail_type,
    taunt: config.snake.taunt.start
  }

  return res.json(data)
})

// Handle POST request to '/move'
router.post(config.route.move, function (req, res) {
  // NOTE: Do something here to generate your move

  var body = req.body
  var mySnake = {
    id: body.you
  }
  var otherSnakes = body.snakes
  var game = {
    id: body.game_id
  }
  var food = body.food
  var nextMove = 'up'

  // console.dir(utils.findHead(mySnake, otherSnakes), {
  //   depth: null,
  //   colors: true
  // })

  // console.log(utils.initGrid({
  //   width: body.width,
  //   height: body.height,
  //   snakes: otherSnakes
  // }))

  var closestFood = utils.findClosestFood([15, 15], food,
    new pf.Grid(
      utils.initGrid({
        width: body.width,
        height: body.height,
        snakes: otherSnakes
      })
    ))

  // console.log(closestFood)

  // var closestFood = utils.findClosestFood(utils.findHead(mySnake, otherSnakes), food)

  // try to get to the clostest food
  // nextMove = utils.findNextMove(mySnake, otherSnakes, closestFood)

  // console.log(utils.initGrid({
  //   width: body.width,
  //   height: body.height,
  //   snakes: otherSnakes
  // }))

  // Response data
  var data = {
    move: nextMove, // one of: ['up','down','left','right']
    taunt: config.snake.taunt.move
  }

  return res.json(data)
})

module.exports = router
