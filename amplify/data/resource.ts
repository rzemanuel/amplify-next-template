// amplify/data/resource.ts
import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { defineStorage } from '@aws-amplify/backend-storage';

// Storage configuration for S3
export const storage = defineStorage({
  name: 'excel-storage',
  accessLevel: {
    auth: {
      authenticated: ['read', 'write'],
      unAuthenticated: []
    }
  }
});

// Data schema for tracking uploads
const schema = a.schema({
  FileUpload: a
    .model({
      fileKey: a.string(),
      uploadedAt: a.datetime(),
      fileName: a.string(),
      fileSize: a.string(),
      status: a.string(),
    })
    .authorization(allow => allow.owner())
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
