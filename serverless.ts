import type { AWS } from "@serverless/typescript";

import createAuction from "@functions/createAuction";
import auctionsTable from "@resources/auctionsTable";
import {
  auctionsBucket,
  auctionsBucketPolicy,
} from "@resources/auctionsBucket";
import auctionsTableIam from "@iam/auctionsTableIam";
import auctionsBucketIAM from "@iam/auctionsBucketIAM";
import mailQueueIam from "@iam/mailQueueIam";
import getAuctions from "@functions/getAuctions";
import getAuction from "@functions/getAuction";
import placeBid from "@functions/placeBid";
import processAuctions from "@functions/processAuctions";
import uploadAuction from "@functions/uploadAuction";

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
      MAIL_QUEUE_URL: "${self:custom.MailQueue.url}",
      AUCTIONS_BUCKET_NAME: "${self:custom.AuctionsBucket.name}",
    },
    iam: {
      role: {
        statements: [auctionsTableIam, mailQueueIam, auctionsBucketIAM],
      },
    },
  },
  resources: {
    Resources: {
      AuctionsTable: auctionsTable,
      AuctionsBucket: auctionsBucket,
      AuctionsBucketPolicy: auctionsBucketPolicy,
    },
  },
  functions: {
    createAuction,
    getAuctions,
    getAuction,
    placeBid,
    processAuctions,
    uploadAuction,
  },
  package: { individually: true },
  custom: {
    AuctionsBucket: {
      name: "auctions-bucket-sj19asxz-${self:provider.stage}",
    },
    AuctionsTable: {
      name: {
        REF: "AuctionsTable",
      },
      arn: { "Fn::GetAtt": ["AuctionsTable", "Arn"] },
    },
    MailQueue: {
      arn: "${cf:notification-service-${self:provider.stage}.MailQueueArn}",
      url: "${cf:notification-service-${self:provider.stage}.MailQueueUrl}",
    },
    authorizer:
      "arn:aws:lambda:${self:provider.region}:${aws:accountId}:function:serverless-auth0-authorizer-${self:provider.stage}-auth",
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
