import Bot from './bot'
import ChatMonitor from './chatMonitor'
import fs from 'fs'

console.log('Starting songbot')
const bot = new Bot()
const chat = new ChatMonitor(bot)

let modules = []
fs.readdir('./src/modules', (err, files) => {
  if (err) console.log(err)
  files.forEach(file => {
    let Module = require(`./modules/${file}`).default
    modules.push(new Module(bot, chat))
  })
})
