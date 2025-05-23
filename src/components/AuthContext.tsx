import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../pages/firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    signInWithPhoneNumber,
    RecaptchaVerifier,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);
    const [onboardingCompleted, setOnboardingCompleted] = useState(false);

    // Update AuthProvider initialization
    useEffect(() => {
        const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
            'expired-callback': () => {
                console.log('reCAPTCHA expired. Resetting...');
                verifier.render();
            }
        });
        setRecaptchaVerifier(verifier);

        return () => verifier.clear();
    }, []);

    async function signup(email, password, displayName = '') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName) {
            await updateProfile(userCredential.user, { displayName });
        }
        // Changed to use email as document ID
        await setDoc(doc(db, 'users', email), {
            uid: userCredential.user.uid,
            email,
            displayName,
            createdAt: new Date(),
        });
        return userCredential;
    }

    const signupWithPhone = async (phoneNumber) => {
        try {
            if (!/^\+[1-9]\d{1,14}$/.test(phoneNumber)) {
                throw new Error('Invalid phone format. Use +[country][number]');
            }

            const confirmationResult = await signInWithPhoneNumber(
                auth,
                phoneNumber,
                recaptchaVerifier
            );

            return confirmationResult;
        } catch (error) {
            let message = 'Failed to send verification code';
            switch (error.code) {
                case 'auth/invalid-phone-number':
                    message = 'Invalid phone number format';
                    break;
                case 'auth/too-many-requests':
                    message = 'Too many attempts. Try again later';
                    break;
            }
            throw new Error(message);
        }
    };

    const verifyPhoneCode = async (confirmationResult, code, displayName = '') => {
        try {
            const userCredential = await confirmationResult.confirm(code);
            const email = userCredential.user.email || `${userCredential.user.phoneNumber}@phone.user`;

            if (displayName) {
                await updateProfile(userCredential.user, { displayName });
            }

            await setDoc(doc(db, 'users', email), {
                uid: userCredential.user.uid,
                phoneNumber: userCredential.user.phoneNumber,
                email,
                displayName,
                createdAt: new Date(),
            }, { merge: true });

            return userCredential;
        } catch (error) {
            let message = 'Verification failed';
            switch (error.code) {
                case 'auth/invalid-verification-code':
                    message = 'Invalid verification code';
                    break;
                case 'auth/code-expired':
                    message = 'Code expired. Request new one';
                    break;
            }
            throw new Error(message);
        }
    };

    const login = (email, password) =>
        signInWithEmailAndPassword(auth, email, password);

    const googleLogin = () => {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    };

    const logout = () => signOut(auth);

    // Update the useEffect hook that checks auth state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.email));
                    const userData = userDoc.data();
                    setOnboardingCompleted(userData?.onboardingCompleted || false);
                } catch (error) {
                    console.error('Error checking onboarding status:', error);
                }
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        loading,
        onboardingCompleted,
        signup,
        login,
        googleLogin,
        logout,
        signupWithPhone,
        verifyPhoneCode
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
            <div id="recaptcha-container" style={{ display: 'none' }}></div>
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}