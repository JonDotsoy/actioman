import { version as osVersion } from "os";
import type { Telemetry, MetricMessage } from "./telemetry";

export class MessageTrace {
  private _type?: "command_execution" | undefined;
  public get type(): "command_execution" | undefined {
    return this._type;
  }
  public set type(value: "command_execution" | undefined) {
    this._type = value;
  }
  private _command?: string | undefined;
  public get command(): string | undefined {
    return this._command;
  }
  public set command(value: string | undefined) {
    this._command = value;
  }
  // actioman_version?: string;
  private _os_version: string | null | undefined = osVersion();
  public get os_version(): string | null | undefined {
    return this._os_version;
  }
  public set os_version(value: string | null | undefined) {
    this._os_version = value;
  }
  private _plugins_active?: string[] | undefined;
  public get plugins_active(): string[] | undefined {
    return this._plugins_active;
  }
  public set plugins_active(value: string[] | undefined) {
    this._plugins_active = value;
  }
  private _duration_ms?: number | undefined;
  public get duration_ms(): number | undefined {
    return this._duration_ms;
  }
  public set duration_ms(value: number | undefined) {
    this._duration_ms = value;
  }
  private _error_code?: string | null | undefined;
  public get error_code(): string | null | undefined {
    return this._error_code;
  }
  public set error_code(value: string | null | undefined) {
    this._error_code = value;
  }

  private sended = false;

  constructor(
    readonly telemetry: Telemetry,
    readonly createdAt = Date.now(),
  ) {}

  // [Symbol.dispose]() {
  //   this.push();
  // }
  push() {
    if (this.sended) return;
    this.sended = true;

    if (!this.type) return;
    if (!this.command) return;
    this.duration_ms = Date.now() - this.createdAt;
    const message: MetricMessage = {
      type: this.type,
      command: this.command,
      os_version: this.os_version,
      plugins_active: this.plugins_active,
      duration_ms: this.duration_ms,
      error_code: this.error_code,
    };
    this.telemetry.push(message);
  }
}
