import Pace from './pace'

export default class ProgressBar {
  constructor(total) {
    this.pace = new Pace(total)
  }

  step() {
    this.pace.op()
  }
}
