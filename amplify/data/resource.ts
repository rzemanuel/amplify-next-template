import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/*== FileUpload Model ======================================================
This model tracks uploaded Excel files.
It stores the S3 file key and a timestamp for when the file was uploaded.
The authorization rule below specifies that only authenticated users
can create and read their file records.
========================================================================*/
const schema = a.schema({
  FileUpload: a
    .model({
      fileKey: a.string(),
      // Use "datetime" (all lowercase) to define a timestamp field.
      uploadedAt: a.datetime(),
    })
    // Use "authenticated" instead of "authenticatedUser" to restrict access.
    .authorization((allow) => [allow.authenticated()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    // Use "userPool" (singular) for Cognito User Pools.
    defaultAuthorizationMode: "userPool",
  },
});
