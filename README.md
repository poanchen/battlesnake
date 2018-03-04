## Rough strategist

We first go by filling each enemy's head by one step (all their possible move) and we recursively check its flood fill value three
times in default, and then we do it again by two steps for the enemy's head. Lastly, three steps. Once we done all that recursion.
We should get a list of flood fill values that will help us predict the best move at least three steps ahead. We then check if there
exist food that is closest to us and no one else can get to before us. Then, we check are we hungry or the closest food is too far
from where we are right now. If any of them are true, we will check the following. Are we very hungry? and not just hungry but
REALLY hungry. If we are and the move was one of the flood fill possible move, we simply go ahead. If we are not VERY hungry then we check if there exist a food that is closest to us. If there are, we simply make sure the move was one of our flood filled results.
Otherwise, we try to follow our own tail or others tail. (this is taking into account that when we eat some food, we make sure that
we do not remove the tail, otherwise, we remove the tail.) When following our own tail or others tail, we take into account that
our next move is the one of our best move according to the flood filled values. If no tail to follow at all, we simply pick the next
least dangerous move. (probably one with the largest flood fill values at least three steps ahead)

## Improvements
- We should also remove others tail when their next food is guaranteed to not be food. In contrast, we should not remove the tail if their next move could possibly be food.
- Initially, we fills each enemy's head by one step with all their possible moves and test out best direction recursively (3 steps
ahead). However, instead, we should probably just fill one step and check against recursively. And, instead of trying to find the
least dangerous move, we find the least dangerous route. Of course, for each enemy's step, we check all the possibles that we can
do recursively (3 steps ahead). So that at the end, we would maybe have a route that will work at least three steps ahead. (maybe
we want to do more than just 3 steps through?) But, it might takes a lot of computation. (might need to spin up more expensive server
instances.)
- If we are able to choke someone, we should simply do it.
- Try to get away (keep in distance) from other snake that is longer than us?
- When no tail to trace, we should try to do the longest route. At the same time, check if it is possible that one of our own tail or
others tail will show up and see if it is possible to get there when they do. If it is possible, then simply go that way. Otherwise,
go longest path to fill up the space as much as we can.
- Instead of always going for our own tail or others, we should maybe try to keep as much space as we can so that it is not possible
for other to trap us.
- For cases like head-on with 50/50 chances of survival, we should do some kind of heuristic technique to see if we can guess what
their move might be.
- For cases where we can potentially head-on with snake that is smaller in length. We should take it if safe.
- When one on one, other snake get very long comparing to itself. Maybe it is good idea to get at least the same length as well. Maybe?
So that when the potential-head-on situation happen, we will not get kill.
- Put in some agressive move when we can in order to finish the gamer quickly?

# battlesnake-node(js)

A simple [BattleSnake AI](http://battlesnake.io) written in Javascript for NodeJS.

To get started you'll need a working NodeJS development environment, and at least read the Heroku docs on [deploying a NodeJS app](https://devcenter.heroku.com/articles/getting-started-with-nodejs).

If you haven't setup a NodeJS development environment before, read [how to get started with NodeJS](http://nodejs.org/documentation/tutorials/). You'll also need [npm](https://www.npmjs.com/) for easy JS dependency management.

This client uses [Express4](http://expressjs.com/en/4x/api.html) for easy route management, read up on the docs to learn more about reading incoming JSON params, writing responses, etc.

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)


### Running the AI locally

Fork and clone this repo:

```
git clone git@github.com:sendwithus/battlesnake-node.git
cd battlesnake-node
```

Install the client dependencies:

```
npm install
```

Create an `.env` file in the root of the project and add your environment variables (optional).

Run the server:

```
nf start web
```

Test the client in your browser: [http://localhost:5000](http://localhost:5000)


### Deploying to Heroku

Click the Deploy to Heroku button at the top or use the command line commands below.

Create a new NodeJS Heroku app:

```
heroku create [APP_NAME]
```

Push code to Heroku servers:
```
git push heroku master
```

Open Heroku app in browser:
```
heroku open
```

Or go directly via http://APP_NAME.herokuapp.com

View/stream server logs:
```
heroku logs --tail
```
