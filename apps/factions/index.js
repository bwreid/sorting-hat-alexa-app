const App = require('alexa-app').app
const Speech = require('ssml-builder')
const shuffle = require('lodash/shuffle')
const sampleSize = require('lodash/sampleSize')
const phrases = require('./phrases')

// Allow this module to be reloaded by hotswap when changed
module.change_code = 1

// Define an alexa-app
const app = new App('factions')
app.id = require('./package').alexa.factions.id

app.launch((req, res) => {
  const prompt = 'Loading Galvanize Factions.'
  const reprompt = 'What should I do?'
  res.say(prompt).reprompt(reprompt).shouldEndSession(false)
})

const LIST_OF_FACTIONS = [
  {
    name: 'von neumann velociraptors',
    options: [
      'von neumann velociraptors',
      'von neumann',
      'neumann',
      'velociraptors',
      'raptors'
    ]
  },
  {
    name: 'lovelace lemurs',
    options: [
      'lovelace lemurs',
      'lovelace',
      'lemurs'
    ]
  },
  {
    name: 'hopper hawks',
    options: [
      'hopper hawks',
      'hopper',
      'hawks'
    ]
  },
  {
    name: 'turing tiger sharks',
    options: [
      'turing tiger sharks',
      'turing',
      'tiger sharks',
      'sharks'
    ]
  }
]

const factionOptions = LIST_OF_FACTIONS.reduce((acc, faction) => acc.concat(faction.options), [])

app.customSlot('LIST_OF_FACTIONS', factionOptions)

app.intent('AMAZON.HelpIntent', {
  slots: {},
  utterances: []
}, (req, res) => {
  const helpOutput = `You can say 'give 10 points to lovelace'. You can also say stop or exit to quit.`
  const reprompt = `What would you like to do?`

  res.say(helpOutput).reprompt(reprompt).shouldEndSession(false)
})

app.intent('AMAZON.StopIntent', {
  slots: {},
  utterances: []
}, (req, res) => {
  const stopOutput = `Later.`
  res.say(stopOutput)
})

app.intent('AMAZON.CancelIntent', {
  slots: {},
  utterances: []
}, (req, res) => {
  const cancelOutput = 'No problem. Request cancelled.'
  res.say(cancelOutput)
})

app.intent('SortingHat', {
  slots: { NAME: 'NAMES' },
  utterances: [
    `sort {NAME}`,
    `sort {NAME} into a faction`
  ]
}, (req, res) => {
  let name = req.slot('NAME')

  if (name) {
    name = name.toLowerCase()
    const speech = new Speech()
    const response = sampleSize(shuffle(phrases), 3)
    // API request needed
    const factions = LIST_OF_FACTIONS.map(faction => faction.name)
    res.say(`Searching for ${name}...`).shouldEndSession(false)

    // API request needed
    const selected = sampleSize(shuffle(factions), 1)
    speech.say(`Found ${name}. Analyzing.`).pause('1s')
      .say(response[0]).pause('1s')
      .say(response[1]).pause('1s')
      .say(response[2]).pause('1s')
      .say(`Complete. ${name}, welcome to the ${selected}.`)

    const ssml = speech.ssml(true)
    res.say(ssml).shouldEndSession(false)
  }

  res.reprompt(`Sorry, I didn't get that. Please say the name clearly.`).shouldEndSession(false)
})

app.intent('ScorePoint', {
  'slots': { FACTION: 'LIST_OF_FACTIONS', POINTS: 'NUMBER' },
  'utterances': [
    `{give|score} {-|POINTS} points {to|to the|for|for the} {-|FACTION}`,
    `{-|POINTS} points {to|to the|for|for the} {-|FACTION}`,
    `{-|POINTS} {to|to the|for|for the} {-|FACTION}`
  ]
}, (req, res) => {
  const name = req.slot('FACTION') ? req.slot('FACTION').toLowerCase() : null
  const points = req.slot('POINTS')
  const isFaction = name ? factionOptions.includes(name) : false

  if (isFaction && points) {
    const faction = LIST_OF_FACTIONS.find(faction => faction.options.includes(name))
    if (faction && faction.name) {
      const fullName = faction.name
      res.say(`${points} points added to the ${fullName}.`).shouldEndSession(false)
    }
  }

  res.reprompt(`Sorry, I didn't get that.`).shouldEndSession(false)
})

module.exports = app
