import moment from 'moment'
import fs from 'fs'

export default class Logger {
  constructor () {
    this.currentDate = moment()
    this.pathToFile = this.initOutputFile()
  }

  log (msg) {
    this.checkDate()
    let line = `${this.getTime()} ${msg}\n`
    fs.appendFile(this.pathToFile, line, (err) => {
      if (err) {
        console.log(this.getTime(), 'Error writing to file!', err)
      }
    })
  }

  getTime () {
    return moment().format('HH:mm')
  }

  checkDate () {
    if (!this.currentDate.isSame(moment(), 'day')) {
      this.currentDate = moment()
      this.pathToFile = this.initOutputFile()
    }
  }

  initOutputFile () {
    let date = this.currentDate.format('DD.MM.YYYY')
    let path = `logs/${date}.txt`
    fs.open(path, 'a', (err, fd) => {
      if (err) {
        console.log(err)
      } else {
        fs.close(fd)
        console.log(this.getTime(), 'Logging to file', path)
      }
    })
    return path
  }
}
