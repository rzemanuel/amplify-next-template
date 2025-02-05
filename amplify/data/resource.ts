import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/*== FileUpload Model ======================================================
This model tracks uploaded Excel files.
It stores the S3 file key and a timestamp for when the file was uploaded.
The authorization rule below specifies that only authenticated users
can create and read their own file records.
========================================================================*/
const schema = a.schema({
  FileUpload: a
    .model({
      fileKey: a.string(),
      uploadedAt: a.dateTime(),
    })
    .authorization((allow) => [allow.authenticatedUser()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    // Use Cognito User Pools for authentication instead of API key
    defaultAuthorizationMode: "userPools",
  },
});
