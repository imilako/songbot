import moment from 'moment';

export default class chatMonitor {
  constructor (bot) {
    bot.client.on('chat', this.onChat.bind(this));
    this.commands = [];
    this.phrases = [];
    this.bot = bot;
  }

  onChat (channel, user, message, self) {
    this.logMsg(user, message);
    message = message.trim();
    // check for command
    let firstWord = message.split(' ', 1)[0];
    if (firstWord.charAt(0) === '!') {
      let command = firstWord.substr(1);
      let index = this.getCommandIndex (this.commands, command);
      let userPermission = this.getUserPermission(channel, user);
      if (index !== -1 && userPermission >= this.commands[index].permission)
        this.commands[index](user, message.substr(firstWord.length+1), false);
      else
        console.log(`${command} command not found or unauthorized`);
    }
    // check for phrase
    let phraseIndex = this.getPhraseIndex(message);
    if (phraseIndex !== -1) {
      let userPermission = this.getUserPermission(channel, user);
      if (userPermission >= this.phrases[phraseIndex].permission)
        this.phrases[phraseIndex](user, message, true);
    }
  }

  logMsg (user, message) {
    let name = user['display-name'] || user.username;
    let ts = moment().format('HH:mm');
    console.log(`${ts} ${name}: ${message}`);
  }

  getUserPermission (channel, user) {
    let permission = '';
    if (user.subscriber) permission = 'sub';
    if (user.mod) permission = 'mod';
    if (user.username === channel.replace(/^#/, ''))
      permission = 'broadcaster';
    return this.permissionToLevel(permission);
  }

  permissionToLevel (permission) {
    let p = ['', 'sub', 'mod', 'broadcaster', 'global_mod', 'admin', 'staff'];
    for (let i = 0; i < p.length; i++) {
      if (p[i] === permission)
        return i;
    }
    return -1;
  }

  // command control
  getCommandIndex (commands, name) {
    let index = -1;
    commands.forEach((c, i) => {
      c.alias.forEach(alias => {
        if (alias === name)
          index = i;
      })
    })
    return index;
  }

  registerCommand (context, command, permission, alias = [command.name]) {
    let newCommand = command.bind(context);
    newCommand.permission = this.permissionToLevel(permission || '');
    newCommand.alias = alias;
    this.commands.push(newCommand);
    console.log(`Registered command ${newCommand.alias[0]}`);
  }

  // phrase control
  registerPhrase (context, command, permission, alias) {
    let newPhrase = command.bind(context);
    let regex = alias.reduce((prev, curr) => `${prev}|${curr}`);
    newPhrase.permission = this.permissionToLevel(permission || '');
    newPhrase.regex = new RegExp(regex, 'i');
    this.phrases.push(newPhrase);
    console.log(`Registered phrase/s ${regex}`);
  }

  getPhraseIndex (message) {
    let index = -1;
    this.phrases.forEach((p, i) => {
        if (p.regex.test(message))
          index = i;
    })
    return index;
  }
}
