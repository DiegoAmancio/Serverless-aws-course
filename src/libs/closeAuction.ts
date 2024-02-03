import { AuctionStatus } from "@functions/createAuction/status.enum";
import * as AWS from "aws-sdk";
import { DynamoDB } from "aws-sdk";

const dynamoDB = new DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

const selectMessages = ({ title, seller }, { amount, bidder }) =>
  bidder !== ""
    ? {
        bidder: {
          subject: "Your won an Auction",
          recipient: bidder,
          body: `What a great deal ! you got yourself a ${title} for $${amount}`,
        },
        seller: {
          subject: "Your item has been sold",
          recipient: seller,
          body: `Whooo vyou item "${title}" has been sold for $${amount}`,
        },
      }
    : {
        seller: {
          subject: "Nobody wants your auction",
          recipient: seller,
          body: `Nobody wants your auction named: "${title}"`,
        },
      };
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

  await dynamoDB.update(params).promise();
  const { title, seller, highestBid } = auction;
  const { amount, bidder } = highestBid;
  const emailsBody = selectMessages({ title, seller }, { amount, bidder });
  const emailsMessages = [emailsBody.seller];

  if (emailsBody.bidder) {
    emailsMessages.push(emailsBody.bidder);
  }

  return Promise.all(
    emailsMessages.map((message) =>
      sqs
        .sendMessage({
          QueueUrl: process.env.MAIL_QUEUE_URL,
          MessageBody: JSON.stringify(message),
        })
        .promise()
    )
  );
}
