const meloTelemetry = {
  track: (event: string, data?: Record<string, unknown>) => {
    if (typeof window !== "undefined") {
      // lightweight client-side telemetry stub; replace with real analytics in prod
      console.info("[telemetry]", event, data || {});
    } else {
      // server-side no-op or logging
      console.info("[telemetry]", event, data || {});
    }
  },
};

export default meloTelemetry;
