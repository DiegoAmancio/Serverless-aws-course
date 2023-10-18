import {
  ValidatedEventAPIGatewayProxyEvent,
  formatJSONResponse,
} from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { DynamoDB } from "aws-sdk";

import { InternalServerError, NotFound } from "http-errors";

const dynamoDB = new DynamoDB.DocumentClient();

export const getAuctionById = async (id: String) => {
  try {
    const auction = await dynamoDB
      .get({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id },
      })
      .promise();
    if (!auction) {
      throw new NotFound(`Auction with ID ${id} not found`);
    }

    return auction.Item;
  } catch (error) {
    throw new InternalServerError(error);
  }
};
const getAuction: ValidatedEventAPIGatewayProxyEvent<any> = async (event) => {
  const { id } = event.pathParameters;

  return formatJSONResponse(await getAuctionById(id), 201);
};

export const main = middyfy(getAuction);
