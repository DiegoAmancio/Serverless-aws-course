import { AuctionStatus } from "@functions/createAuction/status.enum";
import { DynamoDB } from "aws-sdk";

const dynamoDB = new DynamoDB.DocumentClient();

export async function closeAuction(auction) {
  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: {
      id: auction.id,
    },
    UpdateExpression: "set #status = :status",
    ExpressionAttributeValues: {
      ":status": AuctionStatus.CLOSE,
    },
    ExpressionAttributeNames: {
      "#status": "status",
    },
  };

  const result = await dynamoDB.update(params).promise();
  return result;
}
