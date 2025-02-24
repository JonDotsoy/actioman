export type Metric = {
  name: string;
  labels?: Record<string, string>;
  value: number;
  timestamp?: number;
};

export class MetricTextEncoder {
  private encodeLabels(labels?: Record<string, string>) {
    if (!labels) return;
    return Array.from(
      Object.entries(labels),
      ([key, value]) => `${key}=${JSON.stringify(value.toString())}`,
    ).join(",");
  }

  encode(inpiut: Metric) {
    // EBNF format:
    // metric_name [
    //   "{" label_name "=" `"` label_value `"` { "," label_name "=" `"` label_value `"` } [ "," ] "}"
    // ] value [ timestamp ]
    const metric_name = inpiut.name;
    const labels = this.encodeLabels(inpiut.labels);
    const value = inpiut.value;
    const timestamp = inpiut.timestamp;
    const parts = {
      metric_name,
      labels: labels ? `{${labels}}` : "",
      value: ` ${value}`,
      timestamp: timestamp ? ` ${timestamp}` : "",
    };
    return `${parts.metric_name}${parts.labels}${parts.value}${parts.timestamp}`;
  }
}
