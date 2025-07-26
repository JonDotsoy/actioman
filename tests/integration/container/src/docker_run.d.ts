type DockerRunOptions = {
  containerTimeoutSeconds?: number;
  publishPorts?: (number | [number, number])[];
  tty?: boolean;
  stdin?: boolean;
  detached?: boolean;
  rm?: boolean;
  workdir?: string;
  env?: Record<string, string>;
  volumes?: Record<string, URL>;
  networkMode?: string;
  command?: string[];
  containerID?: string;
};
export declare const dockerRun: (
  options?: DockerRunOptions,
) => import("./docker_process").DockerProcess;
export {};
