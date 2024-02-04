import { DynamoDB } from "aws-sdk";
import { InternalServerError } from "http-errors";

const dynamoDB = new DynamoDB.DocumentClient();

export const setAuctionPictureUrl = async (
  auctionId: string,
  pictureUrl: string
) => {
  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id: auctionId },
    UpdateExpression: "set pictureUrl = :pictureUrl",
    ExpressionAttributeValues: {
      ":pictureUrl": pictureUrl,
    },
    ReturnValues: "ALL_NEW",
  };

  try {
    const result = await dynamoDB.update(params).promise();
    return result.Attributes;
  } catch (error) {
    console.error(error);
    throw new InternalServerError(error);
  }
};
