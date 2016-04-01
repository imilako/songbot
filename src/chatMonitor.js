import moment from 'moment';
import {permissionToLevel} from './utils';

export default class chatMonitor {
  constructor (bot) {
    let onChat = this.onChat.bind(this);
    bot.client.on('chat', onChat);
    bot.client.on('action', onChat);
    this.commands = [];
    this.phrases = [];
    this.bot = bot;
  }

  onChat (channel, user, message, self) {
    this.logMsg(user, message);
    let msg = message.trim().toLowerCase();
    // check for command
    if (msg.charAt(0) === '!') {
      let command = msg.split(' ', 1)[0].substr(1);
      let commandIndex = this.getCommandIndex(command);
      commandIndex.forEach(i => {
        this.executeCommand(i, channel, user, msg.substr(command.length+2), false);
      })
    }
    // check for phrase
    let phraseIndex = this.getPhraseIndex(message);
    if (phraseIndex.length) {
      phraseIndex.forEach(i => {
        let commandIndex = this.phrases[i].index;
        this.executeCommand(commandIndex, channel, user, message, true);
      })
    }
  }

  logMsg (user, message) {
    let name = user['display-name'] || user.username;
    this.bot.logger.log(`${name}: ${message}`);
  }

  getUserPermission (channel, user) {
    let permission = '';
    if (user.subscriber)
      permission = 'sub';
    if (user.mod)
      permission = 'mod';
    if (user.username === channel.replace(/^#/, ''))
      permission = 'broadcaster';
    return permissionToLevel(permission);
  }

  // command control
  registerCommand (command, phrases) {
    let index = this.commands.push(command) - 1;
    console.log(`Registered command ${command.alias}`);
    if (phrases) {
      this.registerPhrase(index, phrases);
    }
  }

  getCommandIndex (name) {
    return this.commands
      .map((command, i) => {
        if (command.alias.findIndex(a => a === name) >= 0) return i;
        return -1;
      })
      .filter(e => e !== -1);
  }

  // phrase control
  registerPhrase (index, phrases) {
    let regex = phrases.reduce((prev, curr) => `${prev}|${curr}`);
    let newPhrase = {
      regex: new RegExp(regex, 'i'),
      index: index
    }
    this.phrases.push(newPhrase);
    console.log(`Registered phrase/s ${regex}`);
  }

  getPhraseIndex (message) {
    return this.phrases
      .map((phrase, i) => {
        if (phrase.regex.test(message)) return i;
        return -1;
      })
      .filter(e => e !== -1);
  }

  executeCommand (index, channel, user, args, isPhrase) {
    let command = this.commands[index];
    let userPermission = this.getUserPermission(channel, user);
    let timePassed = moment().diff(command.lastUsed, 'seconds');

    if (timePassed < command.cooldown) {
      return this.bot.logger.log(`--> Cooldown is active for ${command.name}`);
    }
    if (userPermission < this.commands[index].permission) {
      return this.bot.logger.log(`--> ${command.name} requires a higher permission`);
    }

    command.lastUsed = moment();
    command(user, args, isPhrase);
  }
}
