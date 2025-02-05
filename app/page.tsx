// app/page.tsx
"use client";

import React from 'react';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import awsExports from '@/amplify_outputs.json'; // adjust the path as needed
import '@aws-amplify/ui-react/styles.css';

// Configure Amplify with the generated settings
Amplify.configure(awsExports);

export default function Page() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
          <h1>Welcome, {user?.username || "Guest"}!</h1>
          <p>You are successfully logged in.</p>
          <button onClick={signOut} style={{ padding: '0.5rem 1rem', marginTop: '1rem' }}>
            Sign Out
          </button>
          {/* Add your protected content here */}
        </main>
      )}
    </Authenticator>
  );
}
