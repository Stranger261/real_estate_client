export class GoogleCancelled extends Error {}

let configured = false;

const loadGoogle = async () => {
  let mod: typeof import("@react-native-google-signin/google-signin");

  try {
    mod = await import("@react-native-google-signin/google-signin");
  } catch {
    throw new Error(
      "Google sign-in needs a development build. It doesn't run in Expo Go.",
    );
  }

  if (!configured) {
    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

    if (!webClientId) {
      throw new Error("Google Web Client ID is missing.");
    }

    mod.GoogleSignin.configure({
      webClientId,
    });

    configured = true;
  }

  return mod;
};

export const getGoogleIdToken = async (): Promise<string> => {
  const { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } =
    await loadGoogle();

  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) throw new GoogleCancelled();

    const idToken = response.data.idToken;
    if (!idToken) throw new Error("Google did not return an ID token.");
    return idToken;
  } catch (error) {
    if (error instanceof GoogleCancelled) throw error;
    if (isErrorWithCode(error)) {
      if (
        error.code === statusCodes.SIGN_IN_CANCELLED ||
        error.code === statusCodes.IN_PROGRESS
      ) {
        throw new GoogleCancelled();
      }
      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error("Google Play Services isn't available on this device.");
      }
    }
    throw error;
  }
};

export const googleSignOut = async () => {
  try {
    const { GoogleSignin } = await loadGoogle();
    await GoogleSignin.signOut();
  } catch {
    //
  }
};
