import request from 'request-promise';
import moment from 'moment';
import Promise from 'bluebird';
import creds from '../../creds';

export default class Song {
  constructor (bot, chatMonitor) {
    let alias = ['song', 'songname', 'nowplaying', 'currentsong'];
    let phrases = [ 'what song is this',
                    'song name?',
                    'song name pls',
                    'what song is this',
                    'what\'s the song?',
                    'what song this is' 	];
    chatMonitor.registerCommand(this, this.song, '', alias);
    chatMonitor.registerPhrase(this, this.song, '', phrases);

    this.bot = bot;
    this.cooldown = 0;
    this.lastUsed = moment().subtract(this.cooldown, 's');
  }

  song (user, args, isPhrase) {
    if (moment().diff(this.lastUsed, 'seconds') < this.cooldown) return false;
    this.lastUsed = moment();
    let username = user['display-name'] || user.username;

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
        else if (elapsedLastfm < 300000)
          song = `${songLastfm.artist['#text']} - ${songLastfm.name}`;
        else
          return console.log('No song detected in the last 15 min!');

        let sent = isPhrase
          ? false
          : this.bot.say(song);
        if (!sent) this.bot.whisper(username, song);
        console.log(`--> ${song}`);
      })
  }
}
