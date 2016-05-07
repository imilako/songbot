import moment from 'moment'
import {permissionToLevel} from './utils'

export default class Module {
  constructor (bot, chatMonitor) {
    this.bot = bot
    this.chatMonitor = chatMonitor
    this.defaultCooldown = 60
  }

  resetCooldown () {
    this.lastUsed.subtract(this.cooldown, 's')
  }

  createCommand (options) {
    let {permission, alias, cooldown} = options
    let command = options.command.bind(this)
    let level = permissionToLevel(permission)

    command.permission = permission ? level : 0
    command.alias = alias || [command.name]
    command.cooldown = cooldown || this.defaultCooldown
    command.cooldown = cooldown === 0 ? 0 : command.cooldown
    command.lastUsed = moment().subtract(command.cooldown, 's')
    command.resetCooldown = this.resetCooldown

    return command
  }

  registerCommand (options) {
    let command = this.createCommand(options)
    this.chatMonitor.registerCommand(command, options.phrases)
  }
}
