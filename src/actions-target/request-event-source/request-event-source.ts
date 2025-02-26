enum CHARSETS_UTF8 {
  NEW_LINE = 10,
  COLON = 58,
}

export type EventStreamData = {
  id?: string;
  event?: string;
  data: string;
};

export async function* requestEventSource(response: Response) {
  const readableControllerPending =
    Promise.withResolvers<ReadableStreamDefaultController<EventStreamData>>();

  let accumBuff: Uint8Array = new Uint8Array([]);
  let lineBuff: Uint8Array = new Uint8Array([]);
  let accumEventStreamData: Record<string, string | undefined> = {};

  const parseAttribute = (
    buff: Uint8Array,
  ): { name: string; value: string } => {
    const colonIndex = buff.indexOf(CHARSETS_UTF8.COLON);
    if (colonIndex === -1)
      return { name: new TextDecoder().decode(buff), value: "" };
    const name = new TextDecoder().decode(buff.subarray(0, colonIndex)).trim();
    const value = new TextDecoder()
      .decode(buff.subarray(colonIndex + 1))
      .trim();
    return { name, value };
  };

  const reduceBuff = (accum: Uint8Array, chunk: Uint8Array) =>
    new Uint8Array([...accum, ...new Uint8Array(chunk)]);

  const reduceLineBuff = function* (accumLine: Uint8Array) {
    while (true) {
      const newLineIndex = accumBuff.indexOf(CHARSETS_UTF8.NEW_LINE);
      if (newLineIndex === -1) return;
      const lineBuff = accumBuff.subarray(0, newLineIndex);
      yield lineBuff;
      accumBuff = accumBuff.subarray(newLineIndex + 1);
    }
  };

  const reduceData = function* (line: Uint8Array): Generator<EventStreamData> {
    if (line.length === 0) {
      const { event = "message", data, id } = accumEventStreamData;
      if (typeof data === "string")
        yield {
          id,
          event,
          data,
        };
      accumEventStreamData = {};
      return;
    }
    const { name, value } = parseAttribute(line);
    accumEventStreamData = {
      ...accumEventStreamData,
      [name]: value,
    };
  };

  const writable = new WritableStream<Uint8Array>({
    write: (inputBuffer) => {
      accumBuff = reduceBuff(accumBuff, inputBuffer);
      for (const line of reduceLineBuff(lineBuff)) {
        for (const data of reduceData(line)) {
          readableController.enqueue(data);
        }
      }
    },
    close: () => {
      readableController.close();
    },
  });
  const readable = new ReadableStream<EventStreamData>({
    start: (ctrl) => {
      readableControllerPending.resolve(ctrl);
    },
  });
  const readableController = await readableControllerPending.promise;

  const reader = await response.body
    ?.pipeThrough(
      // Transform buffer to event source data
      {
        writable,
        readable,
      },
    )
    .getReader();

  if (!reader) return;

  while (true) {
    const { done, value } = await reader.read();
    if (done) return;
    if (value) yield value;
  }
}
