var express = require('express')
var router  = express.Router()
var config = require('../config.json')
var pf = require('pathfinding')

// Handle POST request to '/start'
router.post(config.route.start, function (req, res) {
  // NOTE: Do something here to start the game

  // Response data
  var data = {
    color: config.snake.color,
    name: config.snake.name,
    head_url: config.snake.head_url,
    taunt: config.snake.taunt.start
  }

  return res.json(data)
})

// Handle POST request to '/move'
router.post(config.route.move, function (req, res) {
  // NOTE: Do something here to generate your move

  var body = req.body
  // console.dir(body, {
  //   depth: null,
  //   colors: true
  // })
  var mySnake = {
    id: body.you
  }
  var grid = new pf.Grid(body.width, body.height)
  var otherSnakes = body.snakes
  var game = {
    id: body.game_id
  }
  var food = body.food
  var nextMove = 'up'

  // check if there is food around and you can get to there before anyone else
  if (true) {

  } else {
    // otherwise, try to move and use as much space as possible
  }

  // Response data
  var data = {
    move: nextMove, // one of: ['up','down','left','right']
    taunt: config.snake.taunt.move
  }

  return res.json(data)
})

module.exports = router
