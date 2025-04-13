const res = await fetch("http://localhost:30321/__actions/hello", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ name: "Bun" }),
});

console.log(
  JSON.stringify({
    ok: res.ok,
    statusCode: res.status,
    headers: res.headers.toJSON(),
    body: await res.json(),
  }),
);
