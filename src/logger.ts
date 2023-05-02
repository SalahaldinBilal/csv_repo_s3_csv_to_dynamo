import type { InspectOptions } from 'util'

export class Logger<TUuid extends string> {
  private route?: string | undefined;
  private id: TUuid;
  private static lastLog: { type: "log" | "dir" | "error", data: Parameters<Logger<string>["log"]> | Parameters<Logger<string>["dir"]> };

  constructor(id: TUuid, route?: string) {
    this.id = id;
    this.route = route;
  }

  private getPreLog() {
    let preLog = `[${this.id}]`
    if (this.route) preLog += ` - [page ${this.route}] `
    return preLog;
  }

  log(...args: any[]) {
    console.log(this.getPreLog(), ...args)
    Logger.lastLog = {
      type: "log",
      data: [this.getPreLog(), ...args]
    }
  }

  error(...args: any[]) {
    console.error(this.getPreLog(), ...args)
    Logger.lastLog = {
      type: "log",
      data: [this.getPreLog(), ...args]
    }
  }

  dir(obj: object, message: string, options: InspectOptions) {
    const defaultOptions = { depth: null }
    process.stdout.write(this.getPreLog() + " ")
    process.stdout.write(message)
    console.dir(obj, { ...defaultOptions, ...options })
    Logger.lastLog = {
      type: "dir",
      data: [obj, message, options]
    }
  }

  startTimer() {
    console.time(this.getPreLog())
    Logger.lastLog = {
      type: "log",
      data: [this.getPreLog(), "Timer Start"]
    }
  }

  endTimer() {
    console.timeEnd(this.getPreLog())
    Logger.lastLog = {
      type: "log",
      data: [this.getPreLog(), "Timer End"]
    }
  }

  static getLastLog() {
    const logger = new Logger("Last Log");
    const lastLog = Logger.lastLog
    const params = lastLog.data as Parameters<Logger<string>["log"]> | Parameters<Logger<string>["dir"]>;

    if (!lastLog) logger.log("No logs were previously printed.")
    //@ts-ignore
    else logger[lastLog.type](...params)
  }
}