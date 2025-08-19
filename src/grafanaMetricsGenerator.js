/**
 * Grafana Metrics Generator
 * Generates Prometheus-formatted metrics for Grafana
 */
class GrafanaMetricsGenerator {
  constructor() {
    this.metrics = new Map(); // Store metric definitions
    this.output = []; // Store generated metric strings
    this.emittedHeaders = new Set(); // Track which metrics have had HELP/TYPE emitted
  }

  /**
   * Define a metric with its help text and type
   * @param {string} metricName - The name of the metric
   * @param {string} helpText - The help text for the metric
   * @param {string} metricType - The type of metric (gauge, counter, histogram, summary)
   */
  defineMetric(metricName, helpText, metricType = 'gauge') {
    const validTypes = ['gauge', 'counter', 'histogram', 'summary'];
    if (!validTypes.includes(metricType)) {
      throw new Error(`Invalid metric type: ${metricType}. Must be one of: ${validTypes.join(', ')}`);
    }

    this.metrics.set(metricName, {
      help: helpText,
      type: metricType
    });
  }

  /**
   * Define and generate a metric in one call
   * @param {string} metricName - The name of the metric
   * @param {string} helpText - The help text for the metric
   * @param {Object} options - Options object containing labels, type, and value
   * @param {Object} options.labels - Object containing label key-value pairs
   * @param {string} options.type - The type of metric (gauge, counter, histogram, summary)
   * @param {number|string} options.value - The metric value
   * @returns {string} The complete metric output with HELP and TYPE
   */
  defineMetricWithData(metricName, helpText, options = {}) {
    const { labels = {}, type = 'gauge', value } = options;

    // Define the metric
    this.defineMetric(metricName, helpText, type);

    // Generate the complete metric
    return this.generateCompleteMetric(metricName, labels, value);
  }

  /**
   * Generate a metric line in Prometheus format
   * @param {string} metricName - The name of the metric
   * @param {Object} labels - Object containing label key-value pairs
   * @param {number|string} value - The metric value
   * @returns {string} The formatted metric line
   */
  generateMetric(metricName, labels = {}, value) {
    // Check if metric is defined
    if (!this.metrics.has(metricName)) {
      throw new Error(`Metric '${metricName}' is not defined. Use defineMetric() first.`);
    }

    const metric = this.metrics.get(metricName);

    // Build labels string
    const labelPairs = Object.entries(labels)
      .filter(([_, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `${k}="${String(v).replace(/"/g, '\\"')}"`)
      .join(',');

    const labelsString = labelPairs ? `{${labelPairs}}` : '';

    return `${metricName}${labelsString} ${value}`;
  }

  /**
   * Generate complete metric output with HELP and TYPE comments
   * @param {string} metricName - The name of the metric
   * @param {Object} labels - Object containing label key-value pairs
   * @param {number|string} value - The metric value
   * @returns {string} The complete metric output with HELP and TYPE
   */
  generateCompleteMetric(metricName, labels = {}, value) {
    const metric = this.metrics.get(metricName);
    if (!metric) {
      throw new Error(`Metric '${metricName}' is not defined. Use defineMetric() first.`);
    }

    const helpLine = `# HELP ${metricName} ${metric.help}`;
    const typeLine = `# TYPE ${metricName} ${metric.type}`;
    const metricLine = this.generateMetric(metricName, labels, value);

    return `${helpLine}\n${typeLine}\n${metricLine}`;
  }

  /**
   * Add a metric to the output buffer
   * @param {string} metricName - The name of the metric
   * @param {Object} labels - Object containing label key-value pairs
   * @param {number|string} value - The metric value
   */
  addMetric(metricName, labels = {}, value) {
    if (!this.metrics.has(metricName)) {
      throw new Error(`Metric '${metricName}' is not defined. Use defineMetric() first.`);
    }
    const metric = this.metrics.get(metricName);
    if (!this.emittedHeaders.has(metricName)) {
      this.output.push(`# HELP ${metricName} ${metric.help}`);
      this.output.push(`# TYPE ${metricName} ${metric.type}`);
      this.emittedHeaders.add(metricName);
    }
    const sample = this.generateMetric(metricName, labels, value);
    this.output.push(sample);
  }

  /**
   * Add a metric using the simplified interface
   * @param {string} metricName - The name of the metric
   * @param {string} helpText - The help text for the metric
   * @param {Object} options - Options object containing labels, type, and value
   * @param {Object} options.labels - Object containing label key-value pairs
   * @param {string} options.type - The type of metric (gauge, counter, histogram, summary)
   * @param {number|string} options.value - The metric value
   */
  addMetricWithData(metricName, helpText, options = {}) {
    const { labels = {}, type = 'gauge', value } = options;
    if (!this.metrics.has(metricName)) {
      this.defineMetric(metricName, helpText, type);
    }
    // Emit headers once per metric per output buffer
    const metric = this.metrics.get(metricName);
    if (!this.emittedHeaders.has(metricName)) {
      this.output.push(`# HELP ${metricName} ${metric.help}`);
      this.output.push(`# TYPE ${metricName} ${metric.type}`);
      this.emittedHeaders.add(metricName);
    }
    const sample = this.generateMetric(metricName, labels, value);
    this.output.push(sample);
  }

  /**
   * Get all generated metrics as a string
   * @returns {string} All metrics concatenated with newlines
   */
  getOutput() {
    return this.output.join('\n');
  }

  /**
   * Clear the output buffer
   */
  clearOutput() {
    this.output = [];
    this.emittedHeaders.clear();
  }

  /**
   * Generate metrics from validator data object
   * @param {Object} validatorData - Object containing validator metrics data
   * @param {string} chain - Chain identifier
   * @param {string} network - Network identifier
   * @param {string} validatorPubkey - Validator public key
   */
  generateFromValidatorData(validatorData, chain, network, validatorPubkey) {
    const baseLabels = {
      chain: chain,
      network: network,
      validator_account: validatorPubkey
    };

    // Define metrics if not already defined
    if (!this.metrics.has('solana_validator_leader_reward_reported_lamports')) {
      this.defineMetric(
        'solana_validator_leader_reward_reported_lamports',
        'Number of lamports reported as leader reward by the validator in the current epoch.',
        'gauge'
      );
    }

    if (!this.metrics.has('solana_validator_priority_fees_lamports')) {
      this.defineMetric(
        'solana_validator_priority_fees_lamports',
        'Priority fees collected by the validator in lamports.',
        'gauge'
      );
    }

    if (!this.metrics.has('solana_validator_transaction_fees_total_lamports')) {
      this.defineMetric(
        'solana_validator_transaction_fees_total_lamports',
        'Total transaction fees in lamports.',
        'gauge'
      );
    }

    if (!this.metrics.has('solana_validator_tips_lamports')) {
      this.defineMetric(
        'solana_validator_tips_lamports',
        'Tips collected by the validator in lamports.',
        'gauge'
      );
    }

    if (!this.metrics.has('solana_validator_compute_units_consumed')) {
      this.defineMetric(
        'solana_validator_compute_units_consumed',
        'Compute units consumed by the validator.',
        'gauge'
      );
    }

    if (!this.metrics.has('solana_validator_votes')) {
      this.defineMetric(
        'solana_validator_votes',
        'Number of votes by the validator.',
        'gauge'
      );
    }

    if (!this.metrics.has('solana_validator_non_votes')) {
      this.defineMetric(
        'solana_validator_non_votes',
        'Number of non-votes by the validator.',
        'gauge'
      );
    }

    // Generate metrics with labels
    const labels = {
      ...baseLabels,
      epoch: validatorData.epoch,
      block_id: validatorData.blocks
    };

    if (validatorData.leader_reward_reported_lamports !== undefined) {
      this.addMetric('solana_validator_leader_reward_reported_lamports', labels, validatorData.leader_reward_reported_lamports);
    }

    if (validatorData.priority_fees_lamports !== undefined) {
      this.addMetric('solana_validator_priority_fees_lamports', labels, validatorData.priority_fees_lamports);
    }

    if (validatorData.transaction_fees_total_lamports !== undefined) {
      this.addMetric('solana_validator_transaction_fees_total_lamports', labels, validatorData.transaction_fees_total_lamports);
    }

    if (validatorData.tips_lamports !== undefined) {
      this.addMetric('solana_validator_tips_lamports', labels, validatorData.tips_lamports);
    }

    if (validatorData.compute_units_consumed !== undefined) {
      this.addMetric('solana_validator_compute_units_consumed', labels, validatorData.compute_units_consumed);
    }

    if (validatorData.votes !== undefined) {
      this.addMetric('solana_validator_votes', labels, validatorData.votes);
    }

    if (validatorData.non_votes !== undefined) {
      this.addMetric('solana_validator_non_votes', labels, validatorData.non_votes);
    }
  }
}

// Export for use in other modules
export default GrafanaMetricsGenerator;
