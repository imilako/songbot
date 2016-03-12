import request from 'request-promise'
import moment from 'moment'
import Promise from 'bluebird'
import creds from '../../creds'

export default class Song {
  constructor (bot, chatMonitor) {
    this.bot = bot;
    chatMonitor.registerCommand(this, this.echo, 'mod', ['echo', 'say']);
  }

  echo (user, args) {
    this.bot.say(`${args}`);
  }
}