// amplify/data/resource.ts
import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  FileUpload: a
    .model({
      fileKey: a.string(),
      uploadedAt: a.datetime(),
      fileName: a.string(),
      fileSize: a.string(),
      status: a.string(),
    })
    .authorization(allow => allow.owner()) // Fixed: Removed array wrapper and simplified
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
