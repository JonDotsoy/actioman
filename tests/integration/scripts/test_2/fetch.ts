const res = await fetch("http://localhost:40322/__actions");

console.log(
  JSON.stringify({
    ok: res.ok,
    statusCode: res.status,
    headers: res.headers.toJSON(),
    body: await res.json(),
  }),
);
