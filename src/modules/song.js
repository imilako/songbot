import request from 'request-promise'
import moment from 'moment'
import Promise from 'bluebird'
import Module from '../module.js'
import creds from '../../creds'

export default class Song extends Module {
  constructor (bot, chatMonitor) {
    super(bot, chatMonitor)

    let alias = ['song', 'songname', 'nowplaying', 'currentsong']

    this.registerCommand({
      command: this.song,
      alias: alias,
      cooldown: 45
    })

    this.maxCheckLength = 60000 * 6

    this.hypem = {
      uri: `https://api.hypem.com/v2/users/${creds.hypemUser}/history?key=swagger`,
      method: 'GET',
      json: true
    }

    this.lastfm = {
      uri: 'http://ws.audioscrobbler.com/2.0',
      method: 'GET',
      json: true,
      qs: {
        api_key: `${creds.lastfmKey}`,
        method: 'user.getRecentTracks',
        format: 'json',
        limit: 2,
        user: `${creds.lastfmUser}`
      }
    }
  }

  song (user, args, self, isPhrase) {
    let username = user['display-name'] || user.username
    this.bot.logger.log('--> Checking...')
    Promise.join(request(this.hypem), request(this.lastfm), (rawHypem, rawLastFm) => {
      let songHypem = rawHypem[0]
      let songLastfm = rawLastFm.recenttracks.track[0]

      let elapsedHypem = moment().diff(moment.unix(songHypem.ts_played))
      let nowScrobbling = songLastfm['@attr']
      let elapsedLastfm = nowScrobbling
        ? false
        : moment().diff(moment.unix(songLastfm.date.uts))

      let song = ''
      if (elapsedHypem < this.maxCheckLength) {
        song = `${songHypem.artist} - ${songHypem.title}`
      } else if (nowScrobbling) {
        song = `${songLastfm.artist['#text']} - ${songLastfm.name}`
      } else if (elapsedLastfm < this.maxCheckLength) {
        song = `${songLastfm.artist['#text']} - ${songLastfm.name}`
      } else {
        self.resetCooldown()
        let humanReadable = moment.duration(this.maxCheckLength, 'milliseconds').humanize()
        return this.bot.logger.log(`--> No song detected in the last ${humanReadable}!`)
      }

      /* only whisper when phrase detected
      let sent = isPhrase
        ? false
        : this.bot.say(song) */
      let sent = this.bot.say(song)
      if (!sent) this.bot.whisper(username, song)
      this.bot.logger.log(`--> ${song}`)
    })
    .catch(e => this.bot.logger.log(`--> Error fetching song info: ${e}`))
  }
}
