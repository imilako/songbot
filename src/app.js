import Bot from './bot';
import chatMonitor from './chatMonitor';

import Song from './commands/song';
import Echo from './commands/echo';

export default class App {
  constructor () {
    console.log(`Starting songbot`)
    const bot = new Bot();
    const chat = new chatMonitor(bot)

    const song = new Song(bot, chat);
    const echo = new Echo(bot, chat);
  }
}

(function () {
  new App();
})();
