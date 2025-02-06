// app/page.tsx
"use client";

import React, { useState } from "react";
import { Amplify } from "aws-amplify";
import { uploadData } from "aws-amplify/storage";
import { Authenticator } from "@aws-amplify/ui-react";
import awsExports from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure(awsExports);

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".xlsx")) {
        setUploadStatus("Error: Only .xlsx files are allowed");
        return;
      }
      setFile(selectedFile);
      setUploadStatus("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus("Please select a file");
      return;
    }

    setUploading(true);
    try {
      const fileKey = `uploads/${Date.now()}-${file.name}`;
      console.log('Starting upload...', { fileKey, fileName: file.name });
      
      const result = await uploadData({
        key: fileKey,
        data: file,
        options: {
          contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          onProgress: ({ transferredBytes, totalBytes }) => {
            if (totalBytes) {
              const percentage = (transferredBytes / totalBytes) * 100;
              setUploadStatus(`Uploading: ${Math.round(percentage)}%`);
            }
          }
        }
      });

      console.log('Upload complete:', result);
      setUploadStatus("Upload successful!");
      setFile(null);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("Upload failed. Please try again.");
    }
    setUploading(false);
  };

  return (
    <Authenticator>
      {({ signOut }) => (
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl font-bold">Excel Upload</h1>
              <button
                onClick={signOut}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded"
              >
                Sign Out
              </button>
            </div>
            
            <input
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
              className="w-full mb-4 p-2 border rounded"
              disabled={uploading}
            />
            
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className={`w-full p-2 rounded ${
                !file || uploading 
                  ? "bg-gray-300" 
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {uploading ? "Uploading..." : "Upload File"}
            </button>

            {uploadStatus && (
              <p className={`mt-3 text-center ${
                uploadStatus.includes("Error") || uploadStatus.includes("failed")
                  ? "text-red-600"
                  : "text-green-600"
              }`}>
                {uploadStatus}
              </p>
            )}
          </div>
        </div>
      )}
    </Authenticator>
  );
}
