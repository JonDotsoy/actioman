import { get } from "@jondotsoy/utils-js/get";
import type { Integration } from "../configs/configs.js";
import * as jose from "jose";

type Validation = { valid: boolean };

type HttpSchema = "bearer";

type Credentials = string;

type JWTSecretProvider = {
  type: "jwt";
  scheme?: HttpSchema;
  label?: string;
  algorithm: "HS256" | "HS384" | "HS512";
  secret: string;
};

type JWTJWKProvider = {
  type: "jwt";
  scheme?: HttpSchema;
  label?: string;
  jwksUri: string;
};

type Providers = JWTSecretProvider | JWTJWKProvider;

type AuthProps = {
  providers: Providers[];
};

const providers: Record<
  string,
  (
    options: JWTSecretProvider | JWTJWKProvider,
    req: Request,
  ) => Validation | Promise<Validation>
> = {
  jwt: async (options, req) => {
    const credentials = getHTTPTokenAuthenticationBySchema(
      options.scheme ?? "bearer",
      req,
    );

    if (typeof credentials !== "string") return { valid: false };

    const verify =
      "jwksUri" in options
        ? (credentials: string) =>
            jose.jwtVerify(
              credentials,
              jose.createRemoteJWKSet(new URL(options.jwksUri)),
            )
        : "secret" in options && "algorithm" in options
          ? (credentials: string) =>
              jose.jwtVerify(
                credentials,
                new TextEncoder().encode(options.secret),
                { algorithms: [options.algorithm] },
              )
          : null;

    if (verify === null) return { valid: false };

    try {
      await verify(credentials);
    } catch (e) {
      const skipLog =
        { ERR_JWS_INVALID: true }[get.string(e, "code") ?? "_UNKNOWN_"] ??
        false;

      if (skipLog === false) console.error(e);

      return { valid: false };
    }

    return {
      valid: true,
    };
  },
};

const getCredentialsBySchema: Record<
  HttpSchema,
  (req: Request) => null | Credentials
> = {
  bearer: (req) => {
    const authorizationHeader = req.headers.get("Authorization");
    if (!authorizationHeader) return null;
    if (!authorizationHeader.startsWith("Bearer ")) return null;
    return authorizationHeader.slice(7);
  },
};

const getHTTPTokenAuthenticationBySchema = (
  schema: HttpSchema,
  req: Request,
): null | Credentials => getCredentialsBySchema[schema](req);

/**
 * Create Auth Integration
 */
export const auth = (props?: AuthProps): Integration => {
  const evaluate = async (req: Request): Promise<Validation> => {
    for (const providerOption of props?.providers ?? []) {
      const resultValidation = await providers[providerOption.type](
        providerOption,
        req,
      );
      if (resultValidation.valid) return resultValidation;
    }
    return { valid: false };
  };

  return {
    name: "auth",
    hooks: {
      "http:middleware": (fetch) => {
        return async (req) => {
          const { valid } = await evaluate(req);
          if (!valid) return new Response(null, { status: 401 });
          return fetch(req);
        };
      },
    },
  };
};
