const scriptUrl = "https://accounts.google.com/gsi/client";
const driveScope = "https://www.googleapis.com/auth/drive.appdata";

interface TokenResponse {
  access_token?: string;
  error?: string;
}

interface TokenClient {
  requestAccessToken(config?: { prompt?: string }): void;
}

interface GoogleOAuth {
  initTokenClient(config: {
    client_id: string;
    scope: string;
    callback(response: TokenResponse): void;
    error_callback?(error: unknown): void;
  }): TokenClient;
  revoke(token: string, callback: () => void): void;
}

declare global {
  interface Window {
    google?: { accounts: { oauth2: GoogleOAuth } };
  }
}

let scriptPromise: Promise<GoogleOAuth> | undefined;

function loadGoogleOAuth(): Promise<GoogleOAuth> {
  if (window.google) return Promise.resolve(window.google.accounts.oauth2);
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    script.addEventListener(
      "load",
      () => {
        const oauth = window.google?.accounts.oauth2;
        if (oauth) resolve(oauth);
        else reject(new Error("Google Identity Services did not initialize"));
      },
      { once: true },
    );
    script.addEventListener(
      "error",
      () => reject(new Error("Google Identity Services failed to load")),
      {
        once: true,
      },
    );
    document.head.append(script);
  });
  return scriptPromise;
}

export async function requestDriveAccessToken(
  clientId: string,
): Promise<string> {
  const oauth = await loadGoogleOAuth();
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(
      () => reject(new Error("Google authorization timed out or was closed")),
      120_000,
    );
    const finish = (action: () => void) => {
      window.clearTimeout(timeout);
      action();
    };
    const client = oauth.initTokenClient({
      client_id: clientId,
      scope: driveScope,
      callback: (response) =>
        finish(() =>
          response.access_token
            ? resolve(response.access_token)
            : reject(
                new Error(response.error ?? "Google authorization failed"),
              ),
        ),
      error_callback: () =>
        finish(() => reject(new Error("Google authorization was cancelled"))),
    });
    // GIS requires this call to remain in the original button gesture chain.
    client.requestAccessToken({ prompt: "select_account" });
  });
}

export async function revokeDriveAccessToken(token: string): Promise<void> {
  const oauth = await loadGoogleOAuth();
  await new Promise<void>((resolve) => oauth.revoke(token, resolve));
}
