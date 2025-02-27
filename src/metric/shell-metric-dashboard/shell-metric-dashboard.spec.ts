import {
  expect,
  it,
  describe,
  beforeAll,
  setSystemTime,
  afterAll,
} from "bun:test";
import { ShellDashboard } from "./shell-metric-dashboard.js";

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

    it.todo(
      "should update the dashboard based on metrics client updates",
      () => {},
    );
  });
});
