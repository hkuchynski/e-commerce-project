// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    signInWithRedirect, 
    signInWithPopup, 
    GoogleAuthProvider,
    createUserWithEmailAndPassword 
} from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { 
    getFirestore,
    doc, 
    getDoc,
    setDoc,
} from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyByrfVsYg089549e4L0uzUsDoXEL9WJr1o",
  authDomain: "crwn-clothing-db-be041.firebaseapp.com",
  projectId: "crwn-clothing-db-be041",
  storageBucket: "crwn-clothing-db-be041.firebasestorage.app",
  messagingSenderId: "916698381702",
  appId: "1:916698381702:web:6cdcc27ae701b41bed4007"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: "select_account"
});

export const auth = getAuth();
export const signInWithGooglePopup = () => signInWithPopup(auth, googleProvider);
export const signInWithGoogleRedirect = () => signInWithRedirect(auth, googleProvider);

export const db = getFirestore();

export const createUserDocumentFromAuth = async (userAuth, additionalInformation={}) => {
    if(!userAuth) return;

    const userDocRef = doc(db, 'users', userAuth.uid);

    console.log(userDocRef);

    const userSnapshot = await getDoc(userDocRef);
    console.log(userSnapshot);
    console.log(userSnapshot.exists());

    if(!userSnapshot.exists()) {
        const { displayName, email } = userAuth;
        const createdAt = new Date();

        try{
            await setDoc(userDocRef, {
                displayName,
                email,
                createdAt,
                ...additionalInformation
            });
        } catch(error) {
            console.log('error creating the user', error.message);
        }
    }

    return userDocRef;
};

export const createAuthUserWithEmailAndPassword = async (email, password) => {
    if(!email || !password) return;

    return await createUserWithEmailAndPassword(auth, email, password);
}

