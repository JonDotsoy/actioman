import {
  expect,
  it,
  describe,
  beforeAll,
  setSystemTime,
  afterAll,
} from "bun:test";
import { ShellDashboard } from "./shell-metric-dashboard.js";
import { MetricsClient } from "../metrics-client/metrics-client.js";

describe("Shell Dashboard", () => {
  it("should render the dashboard correctly with added items and updated stats", () => {
    const shellDashboard = new ShellDashboard();

    shellDashboard.addItem("Route GET /__actions");
    shellDashboard.addItem("Route POST /__actions/hello");
    shellDashboard.updateItem("Route POST /__actions/hello", {
      requestDurationAverage: 100,
    });
    shellDashboard.updateItem("Route POST /__actions/hello", {
      requestDurationAverage: 200,
      dataTransference: 1_048_576 * 9,
    });
    shellDashboard.setFooter("Listening on http://localhost:30320/");

    expect(shellDashboard.render()).toEqual(
      "" +
        `Route GET /__actions        0 reqs 0% (0) errors 0 ms undefined 0 byte\n` +
        `Route POST /__actions/hello 0 reqs 0% (0) errors 200 ms ↑ 9 MB\n` +
        `Listening on http://localhost:30320/\n` +
        "",
    );
  });

  describe("when subscribing to metrics client", () => {
    beforeAll(() => setSystemTime(1000));
    afterAll(() => setSystemTime());

    it("should update the dashboard based on metrics client updates", () => {
      const client = new MetricsClient();
      const shellDashboard = new ShellDashboard();

      shellDashboard.subscribeMetrics(client);

      const logReq = (
        timestamp: number,
        method: string,
        path: string,
        success: boolean,
        duration: number,
        dataSize: number,
      ) => {
        setSystemTime(timestamp);
        if (!success) {
          client
            .counter({
              name: "request_error_counters",
              labels: { method: method, path: path },
            })
            .increment();
        }
        client
          .counter({
            name: "request_counters",
            labels: { method: method, path: path },
          })
          .increment();
        client
          .counter({
            name: "request_data_transference_bytes",
            labels: { method: method, path: path },
          })
          .increment(dataSize);
        client
          .averageBySecond({
            name: "request_duration_seconds",
            labels: { method: method, path: path },
          })
          .add(duration);
      };

      logReq(2110, "GET", "/__actions", true, 150, 134_000);
      logReq(1000, "POST", "/__actions/hello", true, 120, 90_203);
      logReq(1000, "POST", "/__actions/hello", false, 250, 154_293);
      logReq(1300, "POST", "/__actions/hello", true, 350, 254_403);
      logReq(1390, "POST", "/__actions/hello", true, 400, 154_203);
      logReq(2010, "POST", "/__actions/hello", true, 330, 351_100);

      expect(shellDashboard.render()).toEqual(
        "GET /__actions        1 reqs 0% (0) errors 150 ms ↑ 130.859 kB\nPOST /__actions/hello 5 reqs 20% (1) errors 305 ms ↔ 980.666 kB\n\n",
      );
    });
  });
});
