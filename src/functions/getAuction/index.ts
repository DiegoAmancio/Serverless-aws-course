import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: "get",
        path: "auction/{id}",
        authorizer: "${self:custom.authorizer}",
      },
    },
  ],
};
