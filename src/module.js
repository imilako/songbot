import moment from 'moment';
import {permissionToLevel} from './utils';

export default class Module {
  constructor (bot, chatMonitor) {
    this.bot = bot;
    this.chatMonitor = chatMonitor;
    this.defaultCooldown = 60;
  }

  createCommand (options) {
    let {permission, alias, cooldown} = options;
    let command = options.command.bind(this);
    let level = permissionToLevel(permission);

    command.permission = permission ? level : 0;
    command.alias = alias ? alias : [command.name];
    command.lastUsed = moment().subtract(command.cooldown, 's');
    command.cooldown = cooldown ? cooldown : this.defaultCooldown;
    if (cooldown === 0) command.cooldown = 0;

    return command;
  }

  registerCommand (options) {
    let command = this.createCommand(options);
    this.chatMonitor.registerCommand(command, options.phrases);
  }
}
