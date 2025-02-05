// resource.ts
import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  FileUpload: a
    .model({
      fileKey: a.string(),
      uploadedAt: a.datetime(),
      fileName: a.string(), // Added to store original filename
      fileSize: a.number(), // Added to store file size
      status: a.string(), // Added to track processing status
    })
    .authorization([a.allow.owner()])
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
