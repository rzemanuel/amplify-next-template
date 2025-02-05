"use client";

import React from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

export default function AuthPage() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main style={{ padding: '2rem' }}>
          <h1>Welcome, {user.username}!</h1>
          <p>You are now logged in.</p>
          <button onClick={signOut}>Sign Out</button>
          {/* Insert your protected app content here */}
        </main>
      )}
    </Authenticator>
  );
}
