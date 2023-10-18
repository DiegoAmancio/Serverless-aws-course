import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { DynamoDB } from "aws-sdk";

import { InternalServerError } from "http-errors";

const dynamoDB = new DynamoDB.DocumentClient();

const getAuctions = async () => {
  try {
    const auctions = await dynamoDB
      .scan({
        TableName: process.env.AUCTIONS_TABLE_NAME,
      })
      .promise();
    return formatJSONResponse({ auctions }, 201);
  } catch (error) {
    throw new InternalServerError(error);
  }
};

export const main = middyfy(getAuctions);
