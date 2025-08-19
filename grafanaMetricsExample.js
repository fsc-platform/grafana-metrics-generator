import GrafanaMetricsGenerator from './grafanaMetricsGenerator.js';

// Example usage of the GrafanaMetricsGenerator

// Create an instance
const metricsGenerator = new GrafanaMetricsGenerator();

// Example 1: Using the new simplified interface - define and generate in one call
const metricOutput = metricsGenerator.defineMetricWithData(
  'solana_validator_leader_reward_reported_lamports',
  'Number of lamports reported as leader reward by the validator in the current epoch.',
  {
    labels: {
      chain: 'solana',
      network: 'mainnet',
      validator_account: 'VALIDATOR_PUBKEY',
      epoch: '123',
      block_id: '456789'
    },
    type: 'gauge',
    value: 1000000
  }
);

console.log('Example 1 - Simplified interface (define and generate in one call):');
console.log(metricOutput);
console.log('\n' + '='.repeat(50) + '\n');

// Example 2: Using addMetricWithData to add to output buffer
const metricsGen2 = new GrafanaMetricsGenerator();

metricsGen2.addMetricWithData(
  'solana_validator_leader_reward_reported_lamports',
  'Number of lamports reported as leader reward by the validator in the current epoch.',
  {
    labels: {
      chain: 'solana',
      network: 'mainnet',
      validator_account: 'VALIDATOR_PUBKEY',
      epoch: '123',
      block_id: '456789'
    },
    type: 'gauge',
    value: 1000000
  }
);

metricsGen2.addMetricWithData(
  'solana_validator_priority_fees_lamports',
  'Priority fees collected by the validator in lamports.',
  {
    labels: {
      chain: 'solana',
      network: 'mainnet',
      validator_account: 'VALIDATOR_PUBKEY',
      epoch: '123',
      block_id: '456789'
    },
    type: 'gauge',
    value: 50000
  }
);

console.log('Example 2 - Multiple metrics using simplified interface:');
console.log(metricsGen2.getOutput());
console.log('\n' + '='.repeat(50) + '\n');

// Example 3: Legacy approach (still supported)
const metricsGen3 = new GrafanaMetricsGenerator();

// Define metrics first
metricsGen3.defineMetric(
  'solana_custom_metric',
  'A custom metric for demonstration purposes.',
  'counter'
);

metricsGen3.defineMetric(
  'solana_performance_score',
  'Performance score of the validator (0-100).',
  'gauge'
);

// Add metrics to output
metricsGen3.addMetric(
  'solana_custom_metric',
  { validator: 'VALIDATOR_PUBKEY', epoch: '123' },
  42
);

metricsGen3.addMetric(
  'solana_performance_score',
  { validator: 'VALIDATOR_PUBKEY', metric_type: 'block_production' },
  95.5
);

console.log('Example 3 - Legacy approach (still supported):');
console.log(metricsGen3.getOutput());
console.log('\n' + '='.repeat(50) + '\n');

// Example 4: Integration with existing code using the new interface
function generateMetricsForBlock(blockData, chain, network, validatorPubkey) {
  const generator = new GrafanaMetricsGenerator();

  // Generate metrics using the simplified interface
  generator.addMetricWithData(
    'solana_validator_leader_reward_reported_lamports',
    'Number of lamports reported as leader reward by the validator in the current epoch.',
    {
      labels: {
        chain: chain,
        network: network,
        validator_account: validatorPubkey,
        epoch: blockData.epoch,
        block_id: blockData.slot
      },
      type: 'gauge',
      value: blockData.leaderRewardReportedLamports
    }
  );

  generator.addMetricWithData(
    'solana_validator_priority_fees_lamports',
    'Priority fees collected by the validator in lamports.',
    {
      labels: {
        chain: chain,
        network: network,
        validator_account: validatorPubkey,
        epoch: blockData.epoch,
        block_id: blockData.slot
      },
      type: 'gauge',
      value: blockData.priorityFeesLamports
    }
  );

  generator.addMetricWithData(
    'solana_validator_transaction_fees_total_lamports',
    'Total transaction fees in lamports.',
    {
      labels: {
        chain: chain,
        network: network,
        validator_account: validatorPubkey,
        epoch: blockData.epoch,
        block_id: blockData.slot
      },
      type: 'gauge',
      value: blockData.transactionFeesLamportsTotal
    }
  );

  return generator.getOutput();
}

// Example usage of the integration function
const sampleBlockData = {
  slot: '456789',
  epoch: '123',
  leaderRewardReportedLamports: 1000000,
  priorityFeesLamports: 50000,
  transactionFeesLamportsTotal: 200000,
  tipsLamports: 25000,
  computeUnitsConsumed: 1500000,
  votes: 100,
  nonVotes: 5
};

console.log('Example 4 - Integration with block data using simplified interface:');
console.log(generateMetricsForBlock(sampleBlockData, 'solana', 'mainnet', 'VALIDATOR_PUBKEY'));
