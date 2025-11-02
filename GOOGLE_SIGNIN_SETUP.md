# Google Sign-In Setup Guide

This guide will help you set up Google Sign-In for your Sanjaya Medical AI application.

## Step 1: Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API" or "Google Identity Services"
   - Click "Enable"

4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - If prompted, configure the OAuth consent screen first
   - Application type: "Web application"
   - Name: "Sanjaya Medical AI"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - Your production domain (e.g., `https://yourdomain.com`)
   - Authorized redirect URIs:
     - `http://localhost:3000` (for development)
     - Your production domain (e.g., `https://yourdomain.com`)
   - Click "Create"

5. Copy your Client ID (it will look like: `123456789-abc123def456.apps.googleusercontent.com`)

## Step 2: Configure Environment Variables

1. Create a `.env` file in the root of your project (same directory as `package.json`)

2. Add your Google Client ID:
   ```
   REACT_APP_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   ```

3. Replace `your-client-id-here.apps.googleusercontent.com` with the actual Client ID you copied in Step 1

4. Make sure `.env` is in your `.gitignore` file (it should already be there)

## Step 3: Restart Your Development Server

After adding the environment variable:

1. Stop your current development server (Ctrl+C)
2. Start it again:
   ```bash
   npm start
   ```

The React app needs to be restarted to pick up new environment variables.

## Step 4: Test Google Sign-In

1. Navigate to the Login page
2. You should see a "Sign in with Google" button below the regular login form
3. Click the button and test the Google Sign-In flow
4. The button should also appear on the Signup page

## Troubleshooting

### Button doesn't appear
- Check the browser console for errors
- Verify that `REACT_APP_GOOGLE_CLIENT_ID` is set correctly
- Make sure you restarted the development server after adding the `.env` file
- Check that the Google script is loading (check Network tab in DevTools)

### "Google Sign-In is not configured" error
- Verify your `.env` file exists in the project root
- Check that the variable name is exactly `REACT_APP_GOOGLE_CLIENT_ID`
- Make sure there are no spaces around the `=` sign
- Restart your development server

### "Redirect URI mismatch" error
- Go to Google Cloud Console > Credentials
- Edit your OAuth 2.0 Client ID
- Add your exact redirect URI (e.g., `http://localhost:3000`)
- Save and wait a few minutes for changes to propagate

## Production Setup

For production:

1. Add your production domain to authorized origins and redirect URIs in Google Cloud Console
2. Update your `.env.production` file with the same Client ID
3. The Client ID can be the same for both development and production, but you may want separate credentials

## Security Notes

- Never commit your `.env` file to version control
- Keep your Client ID secret (though it's less sensitive than a Client Secret)
- Use different OAuth credentials for development and production if possible
- Regularly review and rotate your credentials

## How It Works

- Google Sign-In uses the Google Identity Services library
- When a user signs in with Google, their profile information is retrieved
- The user is automatically registered/logged in to your application
- No password is required for Google-authenticated users

