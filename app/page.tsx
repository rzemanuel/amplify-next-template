"use client";

import React, { useState } from "react";
import { Amplify } from "aws-amplify";
import { uploadData } from "aws-amplify/storage";
import { Authenticator } from "@aws-amplify/ui-react";
import awsExports from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";

// Configure Amplify
Amplify.configure(awsExports);

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
      const fileKey = `uploads/${Date.now()}-${file.name}`;
      
      await uploadData({
        key: fileKey,
        data: file,
        options: {
          contentType: file.type,
          onProgress: ({ transferredBytes, totalBytes }) => {
            const percentage = (transferredBytes / totalBytes) * 100;
            setUploadStatus(`Uploading: ${Math.round(percentage)}%`);
          },
        },
      });

      setUploadStatus(`Upload successful!`);
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
                <h1 className="text-2xl font-bold mb-2">Excel Upload</h1>
                <p className="text-gray-600">Logged in as: {user?.username || "Guest"}</p>
              </div>
              <button
                onClick={signOut}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Sign Out
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-3">Select Excel File (.xlsx)</h2>
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
