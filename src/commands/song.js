import request from 'request-promise'
import moment from 'moment'
import Promise from 'bluebird'
import creds from '../../creds'

export default class Song {
  constructor (bot, chatMonitor) {
    this.bot = bot;
    chatMonitor.registerCommand(this, this.song);
  }

  song (user, args) {
    let name = user['display-name'] || user.username;

    let hypem = {
      uri: `https://api.hypem.com/v2/users/${creds.hypemUser}/history?key=swagger`,
      method: 'GET',
      json: true
    }
    let lastfm = {
      uri: 'http://ws.audioscrobbler.com/2.0',
      method: 'GET',
      json: true,
      qs: {
        api_key: `${creds.lastfmKey}`,
        method: 'user.getRecentTracks',
        format: 'json',
        limit: 2,
        user: `${creds.lastfUser}`
      }
    }
    let promises = [];
    promises.push(request(hypem));
    promises.push(request(lastfm));

    Promise.all(promises)
      .then(p => {
        let songHypem = p[0][0];
        let songLastfm = p[1].recenttracks.track[0];

        let elapsedHypem = moment().diff(moment.unix(songHypem.ts_played));
        let nowScrobbling = songLastfm['@attr']
          ? true
          : false;
        let elapsedLastfm = nowScrobbling
          ? false
          : moment().diff(moment.unix(songLastfm.date.uts));

        let song = '';
        if (elapsedHypem < 300000)
          song = `${songHypem.artist} - ${songHypem.title}`;
        else if (nowScrobbling)
          song = `${songLastfm.artist['#text']} - ${songLastfm.name}`;
        else if (elapsedLastfm < 900000)
          song = `${songLastfm.artist['#text']} - ${songLastfm.name}`;
        else return console.log('No song detected in the last 15 min!');
        this.bot.say(song);
        console.log(`--> ${song}`);
      })
  }
}
