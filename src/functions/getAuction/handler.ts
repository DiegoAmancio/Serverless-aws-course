import {
  ValidatedEventAPIGatewayProxyEvent,
  formatJSONResponse,
} from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { DynamoDB } from "aws-sdk";

import { InternalServerError, NotFound } from "http-errors";

const dynamoDB = new DynamoDB.DocumentClient();

const getAuction: ValidatedEventAPIGatewayProxyEvent<any> = async (event) => {
  const { id } = event.pathParameters;
  console.log(event.pathParameters);
  let auction;
  try {
    auction = await dynamoDB
      .get({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id },
      })
      .promise();
  } catch (error) {
    throw new InternalServerError(error);
  }

  if (!auction) {
    throw new NotFound(`Auction with ID ${id} not found`);
  }

  return formatJSONResponse(auction, 201);
};

export const main = middyfy(getAuction);
