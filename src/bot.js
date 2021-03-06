import tmijs from 'tmi.js'
import moment from 'moment'
import creds from '../creds'
import config from '../config'
import Logger from './logger'

const options = {
  options: {
    debug: config.tmiDebug
  },
  connection: {
    cluster: 'aws',
    reconnect: true
  },
  identity: {
    username: creds.username,
    password: creds.oauth
  }
}

export default class Bot {
  constructor () {
    const Tmi = tmijs.client
    this.channel = creds.channel
    this.client = new Tmi(options)

    this.client.on('connected', () => {
      this.client.join(this.channel)
      this.logger.log(`Jonied ${this.channel}`)
    })

    this.client.on('whisper', (user, message) => {
      this.logger.log(`${user}: ${message}`)
    })

    this.client.on('serverchange', (channel) => {
      throw new Error('Channel is not in this cluster! Exiting...')
    })

    this.client.connect()
    this.lastSpoke = moment().subtract(config.messageTimeout, 's')

    this.logger = new Logger()
  }

  say (message) {
    if (config.silent) return false
    if (moment().diff(this.lastSpoke, 'seconds') < config.messageTimeout) return false
    this.lastSpoke = moment()
    this.client.say(this.channel, message)
    return true
  }

  whisper (user, message) {
    if (config.silent || config.disableWhispers) return false
    this.client.whisper(user, message)
  }
}
