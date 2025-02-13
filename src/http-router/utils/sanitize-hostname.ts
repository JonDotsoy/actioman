export const sanitizeHostname = (hostname: string) => {
  switch (hostname) {
    case "::1":
    case "::":
    case "0.0.0.0":
    case "127.0.0.1":
    case "::ffff:127.0.0.1":
      return "localhost";
  }

  return hostname;
};
