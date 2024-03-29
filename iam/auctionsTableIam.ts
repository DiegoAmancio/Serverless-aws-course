export default {
  Effect: "Allow",
  Action: [
    "dynamodb:PutItem",
    "dynamodb:Scan",
    "dynamodb:GetItem",
    "dynamodb:UpdateItem",
    "dynamodb:Query",
  ],
  Resource: [
    { "Fn::GetAtt": ["AuctionsTable", "Arn"] },
    {
      "Fn::Join": [
        "/",
        [
          { "Fn::GetAtt": ["AuctionsTable", "Arn"] },
          "index",
          "statusAndEndDate",
        ],
      ],
    },
  ],
};
