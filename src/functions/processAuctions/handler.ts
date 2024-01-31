import { closeAuction } from "@libs/closeAuction";
import { getEndedAuctions } from "@libs/getEndedAuctions";
import * as createHttpError from "http-errors";

const processAuctions = async () => {
  try {
    const auctionsToClose = await getEndedAuctions();
    await Promise.all(auctionsToClose.map((auction) => closeAuction(auction)));
  } catch (error) {
    console.error(error);
    throw new createHttpError.InternalServerError(error);
  }
};

export const main = processAuctions;
