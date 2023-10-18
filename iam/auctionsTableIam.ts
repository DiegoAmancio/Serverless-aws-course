export default {
  Effect: "Allow",
  Action: ["dynamodb:PutItem", "dynamodb:Scan"],
  Resource: [{ "Fn::GetAtt": ["AuctionsTable", "Arn"] }],
};
