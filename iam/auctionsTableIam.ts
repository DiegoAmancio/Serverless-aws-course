export default {
  Effect: "Allow",
  Action: ["dynamodb:PutItem", "dynamodb:Scan", "dynamodb:GetItem"],
  Resource: [{ "Fn::GetAtt": ["AuctionsTable", "Arn"] }],
};
