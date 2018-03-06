var express = require('express')
var router  = express.Router()
var config = require('../config.json')

// Handle POST request to '/start'
router.post(config.route.start, function (req, res) {

  return res.json({
    color: config.snake.color,
    head_url: config.snake.head_url,
    taunt: config.snake.taunt.start
  })
})

// Handle POST request to '/move'
router.post(config.route.move, function (req, res) {

  var directions = ["right", "down", "left", "up"]
  return res.json({
    move: directions[Math.floor(req.body.turn/2 % 4)],
    taunt: config.snake.taunt.move
  })
})

module.exports = router
