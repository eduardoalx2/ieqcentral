import {initializeApp} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {getAuth} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
const config={
    apiKey: "AIzaSyBTjxxbYqsSVPN_BhsA__gMtTseSn9_Tr0",
    authDomain: "regiao655-admin.firebaseapp.com",
    projectId: "regiao655-admin",
    storageBucket: "regiao655-admin.firebasestorage.app",
    messagingSenderId: "739836894724",
    appId: "1:739836894724:web:b8580a4984c1ba6e781f51",
    measurementId: "G-PFEWN5RCMP"
};
export const app=initializeApp(config,"central-kids");
export const auth=getAuth(app);
