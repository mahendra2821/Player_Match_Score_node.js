const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const databasePath = path.join(__dirname, 'cricketMatchDetails.db')
const app = express()
app.use(express.json())

let database = null

const initializationDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server running at http://localhost:3000/')
    })
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}
initializationDbAndServer()

const convertPlayerTableDBObjectToResponse = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  }
}

const converMatchDetailsobjecttoResponseObject = dbObject => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  }
}

const converPlayerScoreobjecttoResponseObject = dbObject => {
  return {
    playerMatchId: dbObject.player_match_id,
    playerId: dbObject.player_id,
    matchId: dbObject.match_id,
    score: dbObject.score,
    fours: dbObject.fours,
    sixes: dbObject.sixes,
  }
}

//,mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm

app.get('/players/', async (request, response) => {
  const getPlayerquery = `
  select player_id as playerId,
  player_name as playerName from player_details;`
  const playerArray = await database.all(getPlayerquery)
  response.send(playerArray)
})

//mbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerquery = `
  select player_id as playerId,
  player_name as playerName from player_details where player_id = ${playerId};`
  const playerArray = await database.get(getPlayerquery)
  response.send(playerArray)
})

//mbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const {playerName} = request.body

  const getPlayerquery = `
  update player_details set
  player_name = '${playerName}' 
  where player_id = ${playerId};`

  await database.run(getPlayerquery)
  response.send('Player Details Updated')
})

//mbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb

app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const getPlayerquery = `
  select * from match_details where
  match_id = ${matchId};`
  const playerArray = await database.get(getPlayerquery)
  response.send(converMatchDetailsobjecttoResponseObject(playerArray))
})

//mbbbbbbbbbbbbbbbbbb

app.get('/players/:playerId/matches', async (request, response) => {
  const {playerId} = request.params
  const getMatchPlayerquery = `
  select * from player_match_score natural join match_details where player_id = ${playerId};`
  const playerMatchArray = await database.all(getMatchPlayerquery)
  response.send(
    playerMatchArray.map(eachPlayer =>
      converMatchDetailsobjecttoResponseObject(eachPlayer),
    ),
  )
})

//mbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
app.get('/matches/:matchId/players', async (request, response) => {
  const {matchId} = request.params
  const getMatchPlayerquery = `
  select player_match_score.player_id as playerId,
  player_name as playerName from player_details inner join player_match_score on player_details.player_id = player_match_score.player_id  where match_id = ${matchId};`
  const playerMatchArray = await database.all(getMatchPlayerquery)
  response.send(playerMatchArray)
})

//mbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb

app.get('/players/:playerId/playerScores', async (request, response) => {
  const {playerId} = request.params
  const getMatchPlayerquery = `
  select player_id as playerId,
  player_name as playerName,
  sum(score) as totalScore,
  sum(fours) as totalFours,
  sum(sixes) as totalSixes from player_match_score natural join player_details where player_id = ${playerId};`
  const playerMatchArray = await database.get(getMatchPlayerquery)
  response.send(playerMatchArray)
})

module.exports = app
