import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { DynamoDB } from "aws-sdk";
import { transpileSchema } from "@middy/validator/transpile";

import { InternalServerError } from "http-errors";
import { getAuctionsSchema } from "./schema";
import validator from "@middy/validator";

const dynamoDB = new DynamoDB.DocumentClient();

const getAuctions = async (event) => {
  try {
    const { status } = event.queryStringParameters;
    const auctions = await dynamoDB
      .query({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        IndexName: "statusAndEndDate",
        KeyConditionExpression: "#status = :status",
        ExpressionAttributeValues: {
          ":status": status,
        },
        ExpressionAttributeNames: {
          "#status": "status",
        },
      })
      .promise();
    return formatJSONResponse({ auctions: auctions.Items }, 201);
  } catch (error) {
    throw new InternalServerError(error);
  }
};

export const main = middyfy(getAuctions).use(
  validator({
    eventSchema: transpileSchema(getAuctionsSchema, {
      useDefaults: true,
      strict: false,
    }),
  })
);
