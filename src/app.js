import Bot from './bot';
import Song from './commands/song';
import chatMonitor from './chatMonitor';

export default class App {
  constructor () {
    console.log(`Starting songbot`)
    const bot = new Bot();
    const chat = new chatMonitor(bot)

    const song = new Song(bot, chat);
  }
}

(function () {
  new App();
})();
