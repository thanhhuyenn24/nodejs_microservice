'use strict';

const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');

// ENV-first
const SERVICE = process.env.OTEL_SERVICE_NAME || 'products-service'; // đổi theo service
const OTLP_ENDPOINT = (process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://otel-collector:4318').replace(/\/$/, '');

const traceExporter = new OTLPTraceExporter({
  url: `${OTLP_ENDPOINT}/v1/traces`,
});

const sdk = new NodeSDK({
  traceExporter,
  instrumentations: [getNodeAutoInstrumentations()],
});

// ⭐️ KHÁC BIỆT Ở ĐÂY: không chain trực tiếp .then vào sdk.start()
Promise.resolve(sdk.start())
  .then(() => console.log(`OTel started. service=${SERVICE} endpoint=${OTLP_ENDPOINT}`))
  .catch((err) => console.error('OTel start failed', err));

process.on('SIGTERM', () => {
  Promise.resolve(sdk.shutdown())
    .then(() => console.log('Tracing terminated'))
    .catch((err) => console.error('Error terminating tracing', err))
    .finally(() => process.exit(0));
});
