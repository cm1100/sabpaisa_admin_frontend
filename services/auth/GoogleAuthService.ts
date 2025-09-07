export interface GoogleUserProfile {
  id: string;
  email: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

class GoogleAuthService {
  private isInitialized = false;
  private clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'your-google-client-id';

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      // Load Google Sign-In script
      if (!document.getElementById('google-signin-script')) {
        const script = document.createElement('script');
        script.id = 'google-signin-script';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          this.initializeGoogleSignIn().then(resolve).catch(reject);
        };
        script.onerror = () => reject(new Error('Failed to load Google Sign-In script'));
        document.head.appendChild(script);
      } else {
        this.initializeGoogleSignIn().then(resolve).catch(reject);
      }
    });
  }

  private async initializeGoogleSignIn(): Promise<void> {
    return new Promise((resolve) => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: this.clientId,
          callback: this.handleCredentialResponse.bind(this),
        });
        this.isInitialized = true;
        resolve();
      } else {
        // Retry after a short delay
        setTimeout(() => this.initializeGoogleSignIn().then(resolve), 100);
      }
    });
  }

  async signIn(): Promise<GoogleUserProfile> {
    await this.initialize();

    return new Promise((resolve, reject) => {
      if (!window.google) {
        reject(new Error('Google Sign-In not loaded'));
        return;
      }

      // Store the resolve/reject functions to use in callback
      (window as any).googleAuthResolve = resolve;
      (window as any).googleAuthReject = reject;

      // Trigger the sign-in popup
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback to manual sign-in
          this.fallbackSignIn().then(resolve).catch(reject);
        }
      });
    });
  }

  private async fallbackSignIn(): Promise<GoogleUserProfile> {
    return new Promise((resolve, reject) => {
      // Create a temporary button and click it programmatically
      const buttonDiv = document.createElement('div');
      buttonDiv.style.display = 'none';
      document.body.appendChild(buttonDiv);

      window.google.accounts.id.renderButton(buttonDiv, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        text: 'signin_with',
      });

      // Store callbacks
      (window as any).googleAuthResolve = resolve;
      (window as any).googleAuthReject = reject;

      // Simulate button click
      const button = buttonDiv.querySelector('div[role="button"]') as HTMLElement;
      if (button) {
        button.click();
      } else {
        document.body.removeChild(buttonDiv);
        reject(new Error('Unable to trigger Google sign-in'));
      }
    });
  }

  private handleCredentialResponse(response: any): void {
    try {
      // Decode the JWT token to get user info
      const tokenParts = response.credential.split('.');
      const payload = JSON.parse(atob(tokenParts[1]));

      const userProfile: GoogleUserProfile = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        given_name: payload.given_name,
        family_name: payload.family_name,
        picture: payload.picture,
      };

      // Resolve the promise if it exists
      if ((window as any).googleAuthResolve) {
        (window as any).googleAuthResolve(userProfile);
        (window as any).googleAuthResolve = null;
        (window as any).googleAuthReject = null;
      }
    } catch (error) {
      console.error('Error processing Google credential:', error);
      if ((window as any).googleAuthReject) {
        (window as any).googleAuthReject(error);
        (window as any).googleAuthResolve = null;
        (window as any).googleAuthReject = null;
      }
    }
  }

  async signOut(): Promise<void> {
    await this.initialize();
    
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
    
    // Clear any stored user data
    localStorage.removeItem('google_user');
  }

  getCurrentUser(): GoogleUserProfile | null {
    const userData = localStorage.getItem('google_user');
    return userData ? JSON.parse(userData) : null;
  }

  isSignedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  storeUser(user: GoogleUserProfile): void {
    localStorage.setItem('google_user', JSON.stringify(user));
  }
}

export const googleAuthService = new GoogleAuthService();