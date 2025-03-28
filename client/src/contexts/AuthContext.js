import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence
} from 'firebase/auth';

// Initialize Firebase
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Add necessary scopes for Google Drive API
provider.addScope('https://www.googleapis.com/auth/drive.file');

// Set persistence to local
setPersistence(auth, browserLocalPersistence);

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const credential = GoogleAuthProvider.credentialFromResult(result);

            // Get both Firebase ID token and Google access token
            const idToken = await result.user.getIdToken();
            const accessToken = credential.accessToken;

            // Store the access token in localStorage
            localStorage.setItem('googleAccessToken', accessToken);

            setUser({
                ...result.user,
                idToken,
                accessToken
            });

            return result.user;
        } catch (error) {
            console.error('Error signing in with Google:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem('googleAccessToken'); // Clear the access token
            setUser(null);
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    // Get a fresh ID token
                    const idToken = await firebaseUser.getIdToken(true);

                    // Get the stored access token
                    const accessToken = localStorage.getItem('googleAccessToken');

                    setUser({
                        ...firebaseUser,
                        idToken,
                        accessToken
                    });
                } catch (error) {
                    console.error('Error refreshing token:', error);
                    setUser(null);
                }
            } else {
                setUser(null);
                localStorage.removeItem('googleAccessToken'); // Clear the access token on logout
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Refresh the ID token periodically (every 30 minutes)
    useEffect(() => {
        if (!user) return;

        const refreshToken = setInterval(async () => {
            try {
                const idToken = await user.getIdToken(true);
                setUser(prev => ({
                    ...prev,
                    idToken
                }));
            } catch (error) {
                console.error('Error refreshing token:', error);
            }
        }, 30 * 60 * 1000); // 30 minutes

        return () => clearInterval(refreshToken);
    }, [user]);

    const value = {
        user,
        signInWithGoogle,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
} 