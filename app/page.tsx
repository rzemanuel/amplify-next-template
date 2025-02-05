// app/page.tsx
"use client";

import React, { useState } from "react";
import { Amplify, Storage } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import awsExports from "@/amplify_outputs.json"; // Make sure the path is correct
import "@aws-amplify/ui-react/styles.css";

// Configure Amplify with the generated settings
Amplify.configure(awsExports);

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Validate file extension (only allow .xlsx files)
      if (!selectedFile.name.endsWith(".xlsx")) {
        setUploadStatus("Error: Only .xlsx files are allowed.");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setUploadStatus("");
    }
  };

  // Upload file to S3 using Amplify Storage
  const handleUpload = async () => {
    if (!file) {
      setUploadStatus("Please select a file.");
      return;
    }
    setUploadStatus("Uploading...");
    try {
      // The file name becomes the key in S3
      const result = await Storage.put(file.name, file, {
        contentType: file.type,
      });
      setUploadStatus(`Upload successful! File key: ${result.key}`);
      // Your S3 bucket should be configured to trigger any processing Lambda
    } catch (error: any) {
      console.error("Upload error:", error);
      setUploadStatus(`Upload failed: ${error.message || error}`);
    }
  };

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
          <h1>Excel Automation Upload</h1>
          <p>Logged in as: {user?.username || "Guest"}</p>
          <button
            onClick={signOut}
            style={{ padding: "0.5rem 1rem", marginBottom: "1rem" }}
          >
            Sign Out
          </button>
          <div style={{ marginTop: "2rem" }}>
            <h2>Upload your Excel file (.xlsx)</h2>
            <input
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
              style={{ marginBottom: "1rem" }}
            />
            <br />
            <button onClick={handleUpload} style={{ padding: "0.5rem 1rem" }}>
              Upload File
            </button>
            <p>{uploadStatus}</p>
          </div>
        </main>
      )}
    </Authenticator>
  );
}
