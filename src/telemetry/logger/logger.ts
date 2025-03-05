export class Logger {
  constructor(
    readonly prefix: string,
    readonly enabled = true,
    private debugLoggers = (message: string) => console.debug(message),
    private errorLoggers = (message: string, error: unknown) =>
      console.error(message, error),
  ) {}

  log = (message: string) => {
    if (this.enabled) this.debugLoggers(`${this.prefix}${message}`);
  };

  error = (message: string, error: unknown) => {
    if (this.enabled) this.errorLoggers(`${this.prefix}${message}`, error);
  };
}
