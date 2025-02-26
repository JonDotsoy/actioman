import { describe, expect, it } from "bun:test";
import { requestEventSource } from "./request-event-source.js";

describe("test d", () => {
  it("test 1", async () => {
    expect(
      await Array.fromAsync(
        requestEventSource(
          new Response(
            `` +
              `event: notice\n` +
              `data: useful data\n` +
              `id: some-id\n` +
              `\n` +
              ``,
          ),
        ),
      ),
    ).toEqual([
      {
        id: "some-id",
        event: "notice",
        data: "useful data",
      },
    ]);
  });

  it("test 2", async () => {
    expect(
      await Array.fromAsync(
        requestEventSource(
          new Response(
            `` +
              `event: notice\n` +
              `data: useful data\n` +
              `id: some-id\n` +
              `\n` +
              `event: notice\n` +
              `data: useful data\n` +
              `\n` +
              `event: notice\n` +
              `\n` +
              ``,
          ),
        ),
      ),
    ).toEqual([
      {
        id: "some-id",
        event: "notice",
        data: "useful data",
      },
      {
        event: "notice",
        data: "useful data",
      },
    ]);
  });

  it("test 3", async () => {
    expect(
      await Array.fromAsync(
        requestEventSource(
          new Response(
            `` +
              `event: notice\n` +
              `data: useful data\n` +
              `id: some-id\n` +
              `\n` +
              `\n` +
              `\n` +
              `\n` +
              `event: notice\n` +
              `data: useful data\n` +
              `\n` +
              `event: notice\n` +
              `\n` +
              ``,
          ),
        ),
      ),
    ).toEqual([
      {
        id: "some-id",
        event: "notice",
        data: "useful data",
      },
      {
        event: "notice",
        data: "useful data",
      },
    ]);
  });

  it("test 4", async () => {
    expect(
      await Array.fromAsync(
        requestEventSource(
          new Response(
            `` +
              `event: notice\n` +
              `data: useful data\n` +
              `id: some-id\n` +
              `\n` +
              `\n` +
              `\n` +
              `\n` +
              `data: useful data\n` +
              `\n` +
              `\n` +
              ``,
          ),
        ),
      ),
    ).toEqual([
      {
        id: "some-id",
        event: "notice",
        data: "useful data",
      },
      {
        event: "message",
        data: "useful data",
      },
    ]);
  });
});
