import * as http2 from "http2";

export const requestHttp2ToRequest = (
  requestHTTP2: http2.Http2ServerRequest,
) => {
  const schema = requestHTTP2.scheme;
  const authority = requestHTTP2.authority;
  const path = requestHTTP2.url;
  const method = requestHTTP2.method;
  const url = new URL(path, `${schema}://${authority}`);
  let bodyReadable: null | ReadableStreamDefaultController<Uint8Array> = null;
  const toUint8Array = (data: string | Buffer) =>
    typeof data === "string"
      ? new TextEncoder().encode(data)
      : new Uint8Array(data);

  const withoutBody: boolean = !["GET", "HEAD"].includes(method.toUpperCase());
  const body = withoutBody
    ? new ReadableStream({ start: (controller) => (bodyReadable = controller) })
    : undefined;

  requestHTTP2.addListener("data", (data) =>
    bodyReadable?.enqueue(toUint8Array(data)),
  );
  requestHTTP2.addListener("end", () => bodyReadable?.close());

  const headers = new Headers();

  Array.from(Object.entries(requestHTTP2.headers)).forEach(([key, header]) => {
    if (key.startsWith(":")) return;

    if (Array.isArray(header)) {
      for (const h of header) headers.append(key, h);
    } else if (header) {
      headers.set(key, header);
    }
  });

  return new Request(url, { method, headers, body });
};
