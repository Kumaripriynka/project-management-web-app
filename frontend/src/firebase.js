import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// TODO: Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDKtwAFbtHkQ24hbonglYj8rO0NGkJ_UTk",
  authDomain: "project-management-saas-f8d90.firebaseapp.com",
  projectId: "project-management-saas-f8d90",
  storageBucket: "project-management-saas-f8d90.appspot.com",
  messagingSenderId: "378133549369",
  appId: "1:378133549369:web:fbc32cf0dd2ec66bc958e8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
