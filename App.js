import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import "expo-dev-client";
import { GoogleSignin, GoogleSigninButton } from "@react-native-google-signin/google-signin";
import auth from "@react-native-firebase/auth";
import React, { useEffect, useState } from "react";

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  // Configure Google Sign-In
  GoogleSignin.configure({
    webClientId: "282731735766-iu9nrsl9j5brj7b9tvl3p28i1cgt5800.apps.googleusercontent.com",
  });

  // Handle auth state changes
  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  const onGoogleButtonPress = async () => {
    try {
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // Get the users ID token
      const signInResult = await GoogleSignin.signIn();
      
      // Get the ID token
      let idToken = signInResult.idToken;
      
      if (!idToken && signInResult.data?.idToken) {
        idToken = signInResult.data.idToken;
      }
      
      if (!idToken) {
        throw new Error("No ID token found");
      }

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Sign-in the user with the credential
      const userCredential = await auth().signInWithCredential(googleCredential);
      console.log('User signed in:', userCredential.user.displayName);
    } catch (error) {
      console.error('Sign-in error:', error);
    }
  };

  if (initializing) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      {!user ? (
        <GoogleSigninButton
          style={{ width: 300, height: 65 }}
          onPress={onGoogleButtonPress}
        />
      ) : (
        <View>
          <Text>Welcome, {user.displayName}</Text>
          <Text>Email: {user.email}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});