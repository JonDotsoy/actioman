import net from "net";
import { INITIAL_PORT } from "../http-listener.js";

export const findNextPort = async () => {
  let porposalPort = INITIAL_PORT;
  while (true) {
    porposalPort++;
    if (porposalPort >= INITIAL_PORT + 10000)
      throw new Error("No available port");
    const port = await new Promise<number | null>((resolve) => {
      const connectiong = net.connect({
        host: "localhost",
        port: porposalPort,
      });

      connectiong.addListener("connect", () => {
        resolve(null);
        connectiong.destroy();
      });
      connectiong.addListener("error", (err) => {
        if ("code" in err && err.code === "ECONNREFUSED") resolve(porposalPort);
      });
    });
    if (typeof port === "number") return port;
  }
};
