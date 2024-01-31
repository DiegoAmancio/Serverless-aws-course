import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { v4 as uuid } from "uuid";
import { DynamoDB } from "aws-sdk";
import schema from "./schema";
import { AuctionStatus } from "./status.enum";
import { InternalServerError } from "http-errors";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";

const dynamoDB = new DynamoDB.DocumentClient();

const createAuction: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  const { title } = event.body;
  const now = new Date();
  const endDate = new Date();
  endDate.setHours(now.getHours() + 1);

  const auction = {
    id: uuid(),
    title,
    status: AuctionStatus.OPEN,
    createdAt: now.toISOString(),
    endingAt: endDate.toISOString(),
    highestBid: {
      amount: 0,
    },
  };

  try {
    await dynamoDB
      .put({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Item: auction,
      })
      .promise();
  } catch (error) {
    console.log(error);
    throw new InternalServerError(error);
  }

  return formatJSONResponse(auction, 201);
};

export const main = middyfy(createAuction).use(
  validator({
    eventSchema: transpileSchema(schema, {
      useDefaults: true,
      strict: false,
    }),
  })
);
