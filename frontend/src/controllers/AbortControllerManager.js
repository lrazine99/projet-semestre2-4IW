class AbortControllerManager {
  constructor() {
    this.controller = new AbortController()
    this.signal = this.controller.signal
  }

  abort() {
    this.controller.abort()
    this.controller = new AbortController()
    this.signal = this.controller.signal
  }
}

export default AbortControllerManager
