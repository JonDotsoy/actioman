import {
  describe,
  it,
  expect,
  setSystemTime,
  afterEach,
  setDefaultTimeout,
} from "bun:test";
import { SerieRegister } from "./serie_register";
import { Temporal } from "temporal-polyfill";

describe("d", () => {
  afterEach(() => {
    setSystemTime();
  });

  it("test a", () => {
    setSystemTime(
      Temporal.Instant.from("2025-03-03T00:00:00.000-03:00").epochMilliseconds,
    );

    const serieRegister = new SerieRegister();

    expect(
      serieRegister.getKeySerieTime(
        Temporal.Instant.from("2025-03-03T00:00:00.000-03:00"),
      ),
    ).toEqual({
      startTime: Temporal.Instant.from("2025-03-03T00:00:00.000-03:00")
        .epochSeconds,
      endTime: Temporal.Instant.from("2025-03-03T00:00:05.000-03:00")
        .epochSeconds,
    });

    expect(
      serieRegister.getKeySerieTime(
        Temporal.Instant.from("2025-03-03T04:31:30.000-03:00"),
      ),
    ).toEqual({
      startTime: Temporal.Instant.from("2025-03-03T04:31:30.000-03:00")
        .epochSeconds,
      endTime: Temporal.Instant.from("2025-03-03T04:31:35.000-03:00")
        .epochSeconds,
    });
  });
});
