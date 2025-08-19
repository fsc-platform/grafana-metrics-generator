# Grafana Metrics Generator

A JavaScript library for generating Prometheus-formatted metrics data for Grafana dashboards. This library provides a clean and intuitive API for creating, managing, and outputting metrics in the standard Prometheus exposition format.

## Features

- 🚀 **Simple API**: Easy-to-use methods for defining and generating metrics
- 📊 **Prometheus Format**: Generates metrics in standard Prometheus exposition format
- 🏷️ **Label Support**: Full support for metric labels with automatic escaping
- 🔧 **Multiple Metric Types**: Support for gauge, counter, histogram, and summary metrics
- 📝 **Auto Documentation**: Automatic generation of HELP and TYPE comments
- 🎯 **Solana Integration**: Built-in support for Solana validator metrics
- 🔄 **Flexible Output**: Generate individual metrics or batch multiple metrics

## Installation

```bash
cd {your_project}
git submodule add https://github.com/fsc-platform/grafana-metrics-generator.git lib/grafana-metrics-generator
```

Or clone the repository and use directly:

```bash
git clone https://github.com/your-username/grafana-metrics-generator.git
cd grafana-metrics-generator
```

## Quick Start

### Basic Usage

```javascript
import GrafanaMetricsGenerator from './lib/grafana-metrics-generator/src/grafanaMetricsGenerator.js';

// Create an instance
const generator = new GrafanaMetricsGenerator();

// Generate a metric with one call
const metricOutput = generator.defineMetricWithData(
  'http_requests_total',
  'Total number of HTTP requests',
  {
    labels: { method: 'GET', endpoint: '/api/users' },
    type: 'counter',
    value: 42
  }
);

console.log(metricOutput);
```

Output:
```
# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",endpoint="/api/users"} 42
```

### Multiple Metrics

```javascript
const generator = new GrafanaMetricsGenerator();

// Add multiple metrics to the output buffer
generator.addMetricWithData(
  'cpu_usage_percent',
  'CPU usage percentage',
  {
    labels: { instance: 'server-01', core: '0' },
    type: 'gauge',
    value: 75.5
  }
);

generator.addMetricWithData(
  'memory_usage_bytes',
  'Memory usage in bytes',
  {
    labels: { instance: 'server-01' },
    type: 'gauge',
    value: 8589934592
  }
);

// Get all metrics as a string
console.log(generator.getOutput());
```

## API Reference

### Constructor

```javascript
const generator = new GrafanaMetricsGenerator();
```

### Core Methods

#### `defineMetric(metricName, helpText, metricType)`

Define a metric with its help text and type.

```javascript
generator.defineMetric(
  'my_metric',
  'Description of my metric',
  'gauge' // 'gauge', 'counter', 'histogram', or 'summary'
);
```

#### `defineMetricWithData(metricName, helpText, options)`

Define and generate a metric in one call.

```javascript
const output = generator.defineMetricWithData(
  'my_metric',
  'Description of my metric',
  {
    labels: { label1: 'value1', label2: 'value2' },
    type: 'gauge',
    value: 123.45
  }
);
```

#### `addMetric(metricName, labels, value)`

Add a metric to the output buffer (requires metric to be defined first).

```javascript
generator.addMetric(
  'my_metric',
  { label1: 'value1' },
  123.45
);
```

#### `addMetricWithData(metricName, helpText, options)`

Add a metric using the simplified interface (auto-defines if needed).

```javascript
generator.addMetricWithData(
  'my_metric',
  'Description of my metric',
  {
    labels: { label1: 'value1' },
    type: 'gauge',
    value: 123.45
  }
);
```

#### `generateMetric(metricName, labels, value)`

Generate a single metric line without HELP/TYPE comments.

```javascript
const metricLine = generator.generateMetric(
  'my_metric',
  { label1: 'value1' },
  123.45
);
// Returns: my_metric{label1="value1"} 123.45
```

#### `generateCompleteMetric(metricName, labels, value)`

Generate complete metric output with HELP and TYPE comments.

```javascript
const completeMetric = generator.generateCompleteMetric(
  'my_metric',
  { label1: 'value1' },
  123.45
);
```

#### `getOutput()`

Get all generated metrics as a string.

```javascript
const allMetrics = generator.getOutput();
```

#### `clearOutput()`

Clear the output buffer.

```javascript
generator.clearOutput();
```

### Solana Integration

The library includes built-in support for Solana validator metrics:

```javascript
const validatorData = {
  epoch: '123',
  blocks: '456789',
  leader_reward_reported_lamports: 1000000,
  priority_fees_lamports: 50000,
  transaction_fees_total_lamports: 200000,
  tips_lamports: 25000,
  compute_units_consumed: 1500000,
  votes: 100,
  non_votes: 5
};

generator.generateFromValidatorData(
  validatorData,
  'solana',
  'mainnet',
  'VALIDATOR_PUBKEY'
);
```

This generates the following Solana-specific metrics:
- `solana_validator_leader_reward_reported_lamports`
- `solana_validator_priority_fees_lamports`
- `solana_validator_transaction_fees_total_lamports`
- `solana_validator_tips_lamports`
- `solana_validator_compute_units_consumed`
- `solana_validator_votes`
- `solana_validator_non_votes`

## Examples

See `grafanaMetricsExample.js` for comprehensive usage examples including:

- Simplified interface usage
- Multiple metrics generation
- Legacy approach compatibility
- Integration with block data
- Solana validator metrics

## Metric Types

The library supports all standard Prometheus metric types:

- **Gauge**: A metric that represents a single numerical value that can arbitrarily go up and down
- **Counter**: A cumulative metric that represents a single monotonically increasing counter
- **Histogram**: A metric that represents observations that usually count something
- **Summary**: A metric that represents observations that usually count something

## Label Handling

Labels are automatically escaped and formatted according to Prometheus standards:

```javascript
// Special characters in labels are automatically escaped
generator.addMetricWithData(
  'test_metric',
  'Test metric',
  {
    labels: {
      path: '/api/users?filter=active',
      message: 'Hello "World"'
    },
    value: 1
  }
);
```

Output:
```
# HELP test_metric Test metric
# TYPE test_metric gauge
test_metric{path="/api/users?filter=active",message="Hello \"World\""} 1
```

## Error Handling

The library provides clear error messages for common issues:

- Invalid metric types
- Undefined metrics
- Malformed data

```javascript
try {
  generator.addMetric('undefined_metric', {}, 1);
} catch (error) {
  console.error(error.message);
  // Output: Metric 'undefined_metric' is not defined. Use defineMetric() first.
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request
