export default class chatMonitor {
  constructor (bot) {
    bot.client.on('chat', this.onChat.bind(this));
    this.commands = [];
    this.bot = bot;
  }

  onChat (channel, user, message, self) {
    message = message.trim();
    let firstWord = message.split(' ', 1)[0];
    if (firstWord.charAt(0) === '!') {
      let command = firstWord.substr(1);
      let index = -1;
      this.commands.forEach((c, i) => {
        if (c.name === command)
          index = i;
      })
      if (index !== -1)
        this.executeCommand(index, user, message.substr(firstWord.length+1));
      else
        console.log(`${command} command not found`);
    }
  }

  permissionToLevel (permission) {
    let p = ['', 'sub', 'mod', 'broadcaster', 'global_mod', 'admin', 'staff'];
    for (let i = 0; i < p.length; i++) {
      if (p[i] === permission)
        return i;
    }
    return -1;
  }

  registerCommand (context, command, permission) {
    let newCommand = {
      name: command.name,
      func: command,
      permission: this.permissionToLevel(permission || ''),
      context: context
    }
    this.commands.push(newCommand);
    console.log(`Registered command ${newCommand.name}`);
  }

  executeCommand (index, user, args) {
    this.commands[index].func(this.bot, user, args);
  }
}
