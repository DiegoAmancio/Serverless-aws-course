export default {
  Effect: "Allow",
  Action: ["dynamodb:PutItem"],
  Resource: [{ "Fn::GetAtt": ["AuctionsTable", "Arn"] }],
};
