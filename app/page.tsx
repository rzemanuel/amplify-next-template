"use client";

import React, { useState } from "react";
import { Amplify } from "aws-amplify";
import { Storage } from '@aws-amplify/storage';
import { generateClient } from "aws-amplify/api";
import { Authenticator } from "@aws-amplify/ui-react";
import awsExports from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";

// Configure Amplify
Amplify.configure(awsExports);

// Initialize API client
const client = generateClient();

// GraphQL mutation
const createFileUpload = /* GraphQL */ `
  mutation CreateFileUpload(
    $input: CreateFileUploadInput!
  ) {
    createFileUpload(input: $input) {
      id
      fileKey
      fileName
      fileSize
      uploadedAt
      status
      createdAt
      updatedAt
      owner
    }
  }
`;

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.name.endsWith(".xlsx")) {
        setUploadStatus("Error: Only .xlsx files are allowed.");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setUploadStatus("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus("Please select a file.");
      return;
    }

    setUploading(true);
    setUploadStatus("Uploading...");

    try {
      // Generate unique file key
      const fileKey = `uploads/${Date.now()}-${file.name}`;
      
      // Upload to S3
      const uploadResult = await Storage.put(fileKey, file, {
        contentType: file.type,
        progressCallback(progress) {
          const percentage = (progress.loaded / progress.total) * 100;
          setUploadStatus(`Uploading: ${Math.round(percentage)}%`);
        },
      });

      // Create database record
      await client.graphql({
        query: createFileUpload,
        variables: {
          input: {
            fileKey: uploadResult.key,
            fileName: file.name,
            fileSize: file.size,
            uploadedAt: new Date().toISOString(),
            status: 'uploaded'
          }
        }
      });

      setUploadStatus(`Upload successful! File key: ${uploadResult.key}`);
      setFile(null);
    } catch (error: any) {
      console.error("Upload error:", error);
      setUploadStatus(`Upload failed: ${error.message || "Unknown error"}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold mb-2">Excel Automation Upload</h1>
                <p className="text-gray-600">Logged in as: {user?.username || "Guest"}</p>
              </div>
              <button
                onClick={signOut}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                disabled={uploading}
              >
                Sign Out
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-3">Upload your Excel file (.xlsx)</h2>
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={handleFileChange}
                  className="w-full border border-gray-300 rounded p-2"
                  disabled={uploading}
                />
              </div>

              <div>
                <button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className={`px-4 py-2 rounded transition ${
                    !file || uploading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {uploading ? 'Uploading...' : 'Upload File'}
                </button>

                {uploadStatus && (
                  <p className={`mt-3 ${
                    uploadStatus.includes('Error') || uploadStatus.includes('failed')
                      ? 'text-red-600'
                      : uploadStatus.includes('successful')
                      ? 'text-green-600'
                      : 'text-blue-600'
                  }`}>
                    {uploadStatus}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Authenticator>
  );
}
