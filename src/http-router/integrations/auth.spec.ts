import { CleanupTasks } from "@jondotsoy/utils-js/cleanuptasks";
import { describe, it, expect } from "bun:test";
import { HTTPLister } from "../http-listener.js";
import { auth } from "./auth.js";
import { TEST_RUN_EXPERIMENTAL } from "../../constants/TEST_RUN_EXPERIMENTAL.js";

describe("auth integration", () => {
  it("should return 401 if there is no token", async () => {
    await using cleanupTasks = new CleanupTasks();
    const httpLister = HTTPLister.fromModule(
      {
        hello: () => "hello",
      },
      {
        integrations: [
          auth({
            providers: [
              {
                type: "jwt",
                algorithm: "HS256",
                secret: "secret",
              },
            ],
          }),
        ],
      },
    );
    cleanupTasks.add(() => httpLister.close());
    const url = await httpLister.listen();

    const res = await fetch(new URL("__actions/hello", url), {
      method: "POST",
    });

    expect(res.status).toEqual(401);
  });

  it("should return 200 if the token is valid", async () => {
    await using cleanupTasks = new CleanupTasks();
    const httpLister = HTTPLister.fromModule(
      {
        hello: () => "hello",
      },
      {
        integrations: [
          auth({
            providers: [
              {
                type: "jwt",
                algorithm: "HS256",
                secret: "secret",
              },
            ],
          }),
        ],
      },
    );
    cleanupTasks.add(() => httpLister.close());
    const url = await httpLister.listen();

    const res = await fetch(new URL("__actions/hello", url), {
      method: "POST",
      headers: {
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.XbPfbIHMI6arZ3Y922BhjWgQzWXcXNrz0ogtVhfEd2o",
      },
    });

    expect(res.status).toEqual(200);
  });

  it("should return 401 if the token is invalid", async () => {
    await using cleanupTasks = new CleanupTasks();
    const httpLister = HTTPLister.fromModule(
      {
        hello: () => "hello",
      },
      {
        integrations: [
          auth({
            providers: [
              {
                type: "jwt",
                algorithm: "HS256",
                secret: "secret",
              },
            ],
          }),
        ],
      },
    );
    cleanupTasks.add(() => httpLister.close());
    const url = await httpLister.listen();

    const res = await fetch(new URL("__actions/hello", url), {
      method: "POST",
      headers: {
        Authorization: "Bearer foo",
      },
    });

    expect(res.status).toEqual(401);
  });

  /**
   *
   */
  it.skipIf(true)("", async () => {
    const jose = await import("jose");

    const alg = "PS256";
    const jty = "466ad618-638d-4764-900a-9b8dd96568d6";

    const key = await jose.generateKeyPair(alg);

    const jwk = await jose.exportJWK(key.publicKey);

    console.log("🚀 ~ it.only ~ jwk:", jwk);

    const token = await new jose.SignJWT({
      sub: "1234567890",
      name: "John Doe",
    })
      .setProtectedHeader({ alg })
      .setJti(jty)
      .setIssuedAt()
      .sign(key.privateKey);

    console.log("🚀 ~ it.only ~ token:", token);
  });

  it.todoIf(TEST_RUN_EXPERIMENTAL)("should work with jwksUri", async () => {
    await using cleanupTasks = new CleanupTasks();
    const jwksServer = await Bun.serve({
      port: 54112,
      fetch: () =>
        Response.json({
          keys: [
            {
              e: "AQAB",
              kty: "RSA",
              n: "7v9M20vjwMo5-GX3ztvHkLyiFk9SGnuYgFAGU3DurymDCMVtA1KsBrLGjvdLsroIuWsMa4ER9XfcmHEXqXPv_tSxdKbQsuPq6HRNqijoQpxQoTbsV-VM8IBNSzODhETqF3dnJuJHMvlzSkve-BMN1rDwNFA3eysfS47eC15eJN6kBetdR0PDzYoA5uLzJpZJvq9jzUWWXeLAZBy6TNNMGQDIJ1LRGWdCY0bYSOCtTJYOclrg_cTQhOHg8n72RrOrD-sf6sRMcgN87iXMwWvQDvdFjDJOTtt5b6LNWFNdCVzD6fvK34vX0pc4eh1-KbWOFmkpLYB4Sfs4ujgxI3gcUQ",
            },
          ],
        }),
    });
    await fetch(jwksServer.url);
    cleanupTasks.add(() => jwksServer.stop());
    const httpLister = HTTPLister.fromModule(
      {
        hello: () => "hello",
      },
      {
        integrations: [
          auth({
            providers: [
              {
                type: "jwt",
                jwksUri: new URL("./jwks.json", jwksServer.url).toString(),
              },
            ],
          }),
        ],
      },
    );
    cleanupTasks.add(() => httpLister.close());
    const url = await httpLister.listen();

    const res = await fetch(new URL("__actions/hello", url), {
      method: "POST",
      headers: {
        Authorization:
          "Bearer eyJhbGciOiJQUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwianRpIjoiNDY2YWQ2MTgtNjM4ZC00NzY0LTkwMGEtOWI4ZGQ5NjU2OGQ2IiwiaWF0IjoxNzM4NTMwNDI0fQ.ha1dFLUUt6_a0Z99VICeb09tR8gzciRr04ddhOTS2IuISYx_Gy2qedPuXw-I7GBWNTwCInmdkAMSUvMOPks0zn-Um6vtYGdECP05jgVv4zktW5Id5-pFfp7bMhhVOIeLx9r2dKeN52fBsfF0jvOQmJ4xYegpAARUY2KIflhFDPv9FDrgDh6sckah9QrjzVzp2ho41Q3FZ1eFWRp4NsViRSs_sPFUAT2_zWSvCslrlitvOBPdqUz7_ZpwykwrNXj3tyik8EIh5Kd4pKt6W0Ovax-l80Hu7CkkDjCjqHJr7YZRCxs5X7GuWwnzygAjdOhpOwxxrqk4wawv1V5Zw2E92w",
      },
    });

    expect(res.status).toEqual(200);
  });
});
