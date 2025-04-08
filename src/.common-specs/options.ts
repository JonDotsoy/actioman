const isOn = (value: unknown) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string")
    return ["true", "on", "yes", "1", "enabled"].includes(value.toLowerCase());
  if (typeof value === "number") return value > 0;
  return false;
};

export const specOptions = {
  /**
   * Indica si la funcionalidad experimental está habilitada.
   * @type {boolean}
   */
  testExperimental: isOn(process.env.TEST_EXPERIMENTAL),
};
