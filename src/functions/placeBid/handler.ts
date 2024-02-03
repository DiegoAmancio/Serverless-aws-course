import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { DynamoDB } from "aws-sdk";
import schema from "./schema";
import { InternalServerError } from "http-errors";
import { getAuctionById } from "@functions/getAuction/handler";
import { Forbidden } from "http-errors";
import { AuctionStatus } from "@functions/createAuction/status.enum";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";

const dynamoDB = new DynamoDB.DocumentClient();

const checkAuction = (
  { amount, bidderEmail }: { amount: number; bidderEmail: string },
  auction
) => {
  if (auction.seller === bidderEmail) {
    throw new Forbidden("You cannot bid your own auction");
  }
  if (auction.status !== AuctionStatus.OPEN) {
    throw new Forbidden("You cannot bid on closed auctions");
  }
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
  const { email } = event.requestContext.authorizer;

  const auction = await getAuctionById(id);

  checkAuction({ amount: Number(amount), bidderEmail: email }, auction);

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    UpdateExpression:
      "set highestBid.amount = :amount, highestBid.bidder = :bidder",
    ExpressionAttributeValues: {
      ":amount": amount,
      ":bidder": email,
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

export const main = middyfy(placeBid).use(
  validator({
    eventSchema: transpileSchema(schema, {
      useDefaults: true,
      strict: false,
    }),
  })
);
