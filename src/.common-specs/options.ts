if (process.env.NODE_ENV !== "test") {
  console.warn(
    "Warning: This file is intended to be used only in test environments.",
  );
}

function createOneTimeWarning(message: string) {
  let called = false;
  return () => {
    if (called) return;
    called = true;
    console.warn(message);
  };
}

const isOn = (value: unknown) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string")
    return ["true", "on", "yes", "1", "enabled"].includes(value.toLowerCase());
  if (typeof value === "number") return value > 0;
  return false;
};

const experimentalFeatureWarning = createOneTimeWarning(
  "You are testing an experimental feature. Use with caution as it may not be stable.",
);

export const specOptions = {
  /**
   * Indica si la funcionalidad experimental está habilitada.
   * @type {boolean}
   */
  get isExperimentalFeatureEnabled() {
    experimentalFeatureWarning();
    return isOn(process.env.TEST_EXPERIMENTAL);
  },
};
