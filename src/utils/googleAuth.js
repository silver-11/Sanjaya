// Google Sign-In utility functions

// Initialize Google Sign-In
export const initializeGoogleSignIn = (onSuccess, onError) => {
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  
  if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
    console.warn('Google Client ID not configured. Please set REACT_APP_GOOGLE_CLIENT_ID in .env file');
    if (onError) {
      onError('Google Sign-In is not configured. Please contact support.');
    }
    return;
  }

  if (window.google && window.google.accounts) {
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        handleCredentialResponse(response, onSuccess, onError);
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });
  } else {
    console.error('Google Identity Services not loaded');
    if (onError) {
      onError('Google Sign-In service is not available. Please refresh the page.');
    }
  }
};

// Handle Google credential response
const handleCredentialResponse = async (response, onSuccess, onError) => {
  try {
    // Decode the JWT token to get user info
    const base64Url = response.credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const userData = JSON.parse(jsonPayload);
    
    // Extract user information
    const googleUser = {
      fullName: userData.name || `${userData.given_name || ''} ${userData.family_name || ''}`.trim(),
      email: userData.email,
      picture: userData.picture,
      googleId: userData.sub,
      emailVerified: userData.email_verified,
      createdAt: new Date().toISOString(),
      provider: 'google'
    };
    
    onSuccess(googleUser);
  } catch (error) {
    console.error('Error processing Google Sign-In:', error);
    onError('Failed to process Google Sign-In. Please try again.');
  }
};

// Render Google Sign-In button
export const renderGoogleButton = (elementId) => {
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  
  if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
    console.warn('Google Client ID not configured');
    return;
  }

  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }

  if (window.google && window.google.accounts) {
    try {
      window.google.accounts.id.renderButton(
        element,
        {
          theme: 'outline',
          size: 'large',
          width: element.offsetWidth || '100%',
          text: 'signin_with',
          locale: 'en',
          shape: 'rectangular'
        }
      );
    } catch (error) {
      console.error('Error rendering Google button:', error);
    }
  } else {
    console.error('Google Identity Services not loaded');
  }
};

