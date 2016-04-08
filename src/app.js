import Bot from './bot';
import chatMonitor from './chatMonitor';
import fs from 'fs';

export default class App {
  constructor () {
    console.log(`Starting songbot`)
    const bot = new Bot();
    const chat = new chatMonitor(bot);

    let modules = [];
    fs.readdir('./src/modules', (err, files) => {
      files.forEach(file => {
        let module = require(`./modules/${file}`).default;
        modules.push(new module(bot, chat));
      });
    })
  }
}

(function () {
  new App();
})();
