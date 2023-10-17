import type { AWS } from "@serverless/typescript";

import createAuction from "@functions/createAuction";
import auctionsTable from "@resources/auctionsTable";
import auctionsTableIam from "@iam/auctionsTableIam";

const serverlessConfiguration: AWS = {
  service: "curso-aws",
  frameworkVersion: "3",
  plugins: ["serverless-esbuild"],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    region: "us-east-1",
    stage: "${opt:stage, 'dev'}",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
      AUCTIONS_TABLE_NAME: {
        Ref: "AuctionsTable",
      },
    },
    iam: {
      role: {
        statements: [auctionsTableIam],
      },
    },
  },
  resources: {
    Resources: {
      AuctionsTable: auctionsTable,
    },
  },
  functions: { createAuction },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node14",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
