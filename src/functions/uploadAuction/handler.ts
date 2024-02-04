import { getAuctionById } from "@functions/getAuction/handler";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { setAuctionPictureUrl } from "@libs/setAuctionPictureUrl";
import { uploadPictureToS3 } from "@libs/uploadPictureToS3";
import { Forbidden, InternalServerError } from "http-errors";

const uploadAuctionPicture = async (event) => {
  const { id } = event.pathParameters;
  const { email } = event.requestContext.authorizer;
  const auction = await getAuctionById(id);

  // Validate auction ownership
  if (auction.seller !== email) {
    throw new Forbidden(`You are not the seller of this auction!`);
  }

  const base64 = event.body.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64, "base64");

  let updatedAuction: Record<string, unknown>;

  try {
    const pictureUrl = await uploadPictureToS3(auction.id + ".jpg", buffer);

    updatedAuction = await setAuctionPictureUrl(auction.id, pictureUrl);
  } catch (error) {
    console.error(error);
    throw new InternalServerError(error);
  }
  return formatJSONResponse(updatedAuction, 201);
};

export const main = middyfy(uploadAuctionPicture);
