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
      let index = this.getCommandIndex (this.commands, command);
      let userPermission = this.getUserPermission(channel, user);
      if (index !== -1 && userPermission >= this.commands[index].permission)
        this.commands[index](user, message.substr(firstWord.length+1));
      else
        console.log(`${command} command not found or unauthorized`);
    }
  }

  getUserPermission (channel, user) {
    let permission = '';
    if (user.subscriber) permission = 'sub';
    if (user.mod) permission = 'mod';
    if (user.username === channel.replace(/^#/, ''))
      permission = 'broadcaster';
    return this.permissionToLevel(permission);
  }

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

  permissionToLevel (permission) {
    let p = ['', 'sub', 'mod', 'broadcaster', 'global_mod', 'admin', 'staff'];
    for (let i = 0; i < p.length; i++) {
      if (p[i] === permission)
        return i;
    }
    return -1;
  }

  registerCommand (context, command, permission, alias = [command.name]) {
    let newCommand = command.bind(context);
    newCommand.permission = this.permissionToLevel(permission || '');
    newCommand.alias = alias;
    this.commands.push(newCommand);
    console.log(`Registered command ${newCommand.alias[0]}`);
  }

  executeCommand (index, user, args) {
    this.commands[index].func(user, args);
  }
}
