import { AuctionStatus } from "@functions/createAuction/status.enum";

const getAuctionsSchema = {
  properties: {
    queryStringParameters: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: [AuctionStatus.OPEN, AuctionStatus.CLOSE],
          default: AuctionStatus.OPEN,
        },
      },
    },
  },
  required: ["queryStringParameters"],
};

export { getAuctionsSchema };
