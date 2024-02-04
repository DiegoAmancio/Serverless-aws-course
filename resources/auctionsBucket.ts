export const auctionsBucket = {
  Type: "AWS::S3::Bucket",
  Properties: {
    BucketName: "${self:custom.AuctionsBucket.name}",
    PublicAccessBlockConfiguration: {
      BlockPublicAcls: false,
    },
    OwnershipControls: {
      Rules: [
        {
          ObjectOwnership: "ObjectWriter",
        },
      ],
    },
    LifecycleConfiguration: {
      Rules: [
        {
          Id: "ExpirePictures",
          Status: "Enabled",
          ExpirationInDays: 1,
        },
      ],
    },
  },
};

export const auctionsBucketPolicy = {
  Type: "AWS::S3::BucketPolicy",
  Properties: {
    Bucket: {
      Ref: "AuctionsBucket",
    },
    PolicyDocument: {
      Statement: [
        {
          Action: ["s3:GetObject"],
          Sid: "PublicRead",
          Effect: "Allow",
          Principal: "*",
          Resource: "arn:aws:s3:::${self:custom.AuctionsBucket.name}/*",
        },
      ],
    },
  },
};
