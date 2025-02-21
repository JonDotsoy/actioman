import {
  expect,
  it,
  describe,
  setSystemTime,
  afterAll,
  beforeAll,
} from "bun:test";
import { MetricsClient } from "./metrics-client.js";

describe("MetricsClient", () => {
  beforeAll(() => setSystemTime(1000));
  afterAll(() => setSystemTime());

  it("counter metric increments and aggregates correctly with and without labels", () => {
    const client = new MetricsClient();

    client.counter({ name: "http_requests" }).increment();
    const c = client.counter({
      name: "http_requests",
      labels: { route: "fs", a: "sd" },
    });
    c.increment();
    c.increment();
    c.increment(10);

    expect(client.toJSON()).toEqual({
      http_requests: 1,
      "http_requests{a=sd,route=fs}": 12,
    });
  });

  it("averageBySecond calculates the average of values added within the same second", () => {
    const client = new MetricsClient();

    const a = client.averageBySecond({ name: "http_request_duration_seconds" });

    // time cols: |     1    |
    //            | 100, 200 |
    //            |    150   |
    a.add(100);
    a.add(200);

    expect(client.toJSON()).toEqual({ http_request_duration_seconds: 150 });
  });

  it("averageBySecond calculates the average across two consecutive seconds", async () => {
    const client = new MetricsClient();

    const a = client.averageBySecond({ name: "http_request_duration_seconds" });

    // time cols: |     1    |  2  |
    //            | 100, 200 | 100 |
    //            |       125      |
    setSystemTime(1000);
    a.add(100);
    a.add(200);
    setSystemTime(2000);
    a.add(100);

    expect(client.toJSON()).toEqual({ http_request_duration_seconds: 125 });
  });

  it("averageBySecond returns the average of the last second after a gap in data", async () => {
    const client = new MetricsClient();

    const a = client.averageBySecond({ name: "http_request_duration_seconds" });

    // time cols: |     1    | 2 |  3  |
    //            | 100, 200 |   | 200 |
    //                       |   200   |
    setSystemTime(1000);
    a.add(100);
    a.add(200);
    setSystemTime(3000);
    a.add(200);

    expect(client.toJSON()).toEqual({ http_request_duration_seconds: 200 });
  });

  it("averageBySecond returns NaN when no data for current or consecutive past second after a gap", async () => {
    const client = new MetricsClient();

    const a = client.averageBySecond({ name: "http_request_duration_seconds" });

    // time cols: |     1    | 2 |  3  | 4 | 5 |
    //            | 100, 200 |   | 200 |   |   |
    //                                 |  NaN  |
    setSystemTime(1000);
    a.add(100);
    a.add(200);
    setSystemTime(3000);
    a.add(200);
    setSystemTime(4000);

    expect(client.toJSON()).toEqual({ http_request_duration_seconds: NaN });
  });

  it("averageBySecond calculates combined average for two consecutive seconds after a gap", async () => {
    const client = new MetricsClient();

    const a = client.averageBySecond({ name: "http_request_duration_seconds" });

    // time cols: |     1    | 2 |  3  |  4  |
    //            | 100, 200 |   | 200 | 100 |
    //                           |    150    |
    setSystemTime(1000);
    a.add(100);
    a.add(200);
    setSystemTime(3000);
    a.add(200);
    setSystemTime(4000);
    a.add(100);
    setSystemTime(5000 - 1);

    expect(client.toJSON()).toEqual({ http_request_duration_seconds: 150 });
  });
});
