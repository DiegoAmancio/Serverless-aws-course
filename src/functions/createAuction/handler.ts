import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { v4 as uuid } from "uuid";
import { DynamoDB } from "aws-sdk";
import schema from "./schema";
import { AuctionStatus } from "./status.enum";
import { InternalServerError } from "http-errors";

const dynamoDB = new DynamoDB.DocumentClient();

const createAuction: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  const { title } = event.body;
  const now = new Date();

  const auction = {
    id: uuid(),
    title,
    status: AuctionStatus.OPEN,
    createdAt: now.toISOString(),
  };

  try {
    await dynamoDB
      .put({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Item: auction,
      })
      .promise();
  } catch (error) {
    throw new InternalServerError(error);
  }

  return formatJSONResponse(auction, 201);
};

export const main = middyfy(createAuction);
