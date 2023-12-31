export default {
  Effect: "Allow",
  Action: [
    "dynamodb:PutItem",
    "dynamodb:Scan",
    "dynamodb:GetItem",
    "dynamodb:UpdateItem",
  ],
  Resource: [{ "Fn::GetAtt": ["AuctionsTable", "Arn"] }],
};
