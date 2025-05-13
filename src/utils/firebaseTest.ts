// Firebase data test utility
// This file helps verify Firebase connections and data structures

import { collection, getDocs, query, limit, doc, getDoc } from 'firebase/firestore';
import { auth, db, appDB } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Function to check authentication state
export const checkAuthState = () => {
  console.log("Checking auth state...");
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) {
        console.log("User is authenticated:", user.uid);
        console.log("User email:", user.email);
        resolve(user);
      } else {
        console.log("No user is authenticated");
        resolve(null);
      }
    });
  });
};

// Function to list available collections in the database
export const listCollections = async (database = db) => {
  try {
    // For security reasons, listing collections directly is often restricted
    // We'll try to access known collections instead
    const collections = ["partnerWebApp", "users", "partners"];
    
    console.log("Attempting to access known collections...");
    
    for (const collName of collections) {
      try {
        const collRef = collection(database, collName);
        const docsQuery = query(collRef, limit(1));
        const snapshot = await getDocs(docsQuery);
        console.log(`Collection '${collName}' exists with ${snapshot.size} documents available`);
      } catch (error) {
        console.log(`Failed to access collection '${collName}':`, error);
      }
    }
  } catch (error) {
    console.error("Error listing collections:", error);
  }
};

// Function to check if a user document exists
export const checkUserDocument = async (userId, database = db) => {
  if (!userId) {
    console.error("No user ID provided");
    return;
  }
  
  // Try different collections where user data might be stored
  const paths = [
    { db: database, path: `partnerWebApp/${userId}` },
    { db: appDB, path: `partnerWebApp/${userId}` },
    { db: database, path: `users/${userId}` },
    { db: appDB, path: `users/${userId}` }
  ];
  
  console.log(`Checking document existence for user ${userId}`);
  
  for (const { db: dbRef, path } of paths) {
    try {
      const docRef = doc(dbRef, path);
      const docSnap = await getDoc(docRef);
      
      console.log(`Path ${path} exists: ${docSnap.exists()}`);
      if (docSnap.exists()) {
        console.log(`Document data:`, docSnap.data());
      }
    } catch (error) {
      console.error(`Error checking path ${path}:`, error);
    }
  }
};

// Return the utility functions for use elsewhere
const FirebaseTestUtils = {
  checkAuthState,
  listCollections,
  checkUserDocument
};

export default FirebaseTestUtils;
