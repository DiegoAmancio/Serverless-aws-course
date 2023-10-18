import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { DynamoDB } from "aws-sdk";
import schema from "./schema";
import { InternalServerError } from "http-errors";
import { getAuctionById } from "@functions/getAuction/handler";
import { Forbidden } from "http-errors";

const dynamoDB = new DynamoDB.DocumentClient();

const checkAuction = (amount: number, auction) => {
  if (amount <= auction.highestBid.amount) {
    throw new Forbidden(
      `Your bid must be higher than ${auction.highestBid.amount}`
    );
  }
};
const placeBid: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  const { id } = event.pathParameters;
  const { amount } = event.body;

  const auction = await getAuctionById(id);

  checkAuction(amount, auction);

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    UpdateExpression: "set highestBid.amount = :amount",
    ExpressionAttributeValues: {
      ":amount": amount,
    },
    ReturnValues: "ALL_NEW",
  };

  try {
    const result = await dynamoDB.update(params).promise();
    return formatJSONResponse(result.Attributes, 201);
  } catch (error) {
    throw new InternalServerError(error);
  }
};

export const main = middyfy(placeBid);
