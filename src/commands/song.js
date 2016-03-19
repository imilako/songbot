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
                    'what is this song',
                    'what song this is',
                    'name of this song?',
                    'what version is this song?',
                    'what is the name of the song'  ];
    chatMonitor.registerCommand(this, this.song, '', alias);
    chatMonitor.registerPhrase(this, this.song, '', phrases);

    this.bot = bot;
    this.cooldown = 60;
    this.maxCheckLength = 60000*6;
    this.lastUsed = moment().subtract(this.cooldown, 's');

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
        user: `${creds.lastfUser}`
      }
    }
  }

  song (user, args, isPhrase) {
    if (moment().diff(this.lastUsed, 'seconds') < this.cooldown) return false;
    this.lastUsed = moment();
    let username = user['display-name'] || user.username;

    Promise.join(request(this.hypem), request(this.lastfm), (rawHypem, rawLastFm) => {
      let songHypem = rawHypem[0]
      let songLastfm = rawLastFm.recenttracks.track[0];

      let elapsedHypem = moment().diff(moment.unix(songHypem.ts_played));
      let nowScrobbling = songLastfm['@attr']
        ? true
        : false;
      let elapsedLastfm = nowScrobbling
        ? false
        : moment().diff(moment.unix(songLastfm.date.uts));

      let song = '';
      if (elapsedHypem < this.maxCheckLength)
        song = `${songHypem.artist} - ${songHypem.title}`;
      else if (nowScrobbling)
        song = `${songLastfm.artist['#text']} - ${songLastfm.name}`;
      else if (elapsedLastfm < this.maxCheckLength)
        song = `${songLastfm.artist['#text']} - ${songLastfm.name}`;
      else
        return console.log('--> No song detected in the last 5 min!');

      /* only whisper when phrase detected
      let sent = isPhrase
        ? false
        : this.bot.say(song); */
      let sent = this.bot.say(song);
      if (!sent) this.bot.whisper(username, song);
      console.log(`--> ${song}`);
    })
  }
}
