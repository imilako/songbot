import request from 'request-promise';
import moment from 'moment';
import Promise from 'bluebird';
import creds from '../../creds';

export default class Song {
  constructor (bot, chatMonitor) {
    this.bot = bot;
    chatMonitor.registerCommand(this, this.echo, 'mod', ['echo', 'say']);
    chatMonitor.registerCommand(this, this.song, 'mod', ['song', 'songs']);
    chatMonitor.registerPhrase(this, this.echo, '', ['echo', 'say'])
  }

  echo (user, args) {
    this.bot.say(`${args}`);
    console.log(`${args}`)
  }

  song (user, args) {
    this.bot.say(`${args}`);
    console.log(`song ${args}`)
  }
}
