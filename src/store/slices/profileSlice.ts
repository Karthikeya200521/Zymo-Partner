import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { Timestamp } from 'firebase/firestore';

interface UnavailableHours {
  start: string;
  end: string;
}

interface Profile {
  fullName: string;
  email: string;
  brandName: string;
  phone: string;
  gstNumber: string;
  bankAccountName: string;
  bankAccount: string;
  ifscCode: string;
  cities: string[];
  logo: string;
  loading: boolean;
  error: string | null;
  unavailableHours?: UnavailableHours;
  createdAt?: number; // Store as number (milliseconds)
}

const defaultUnavailableHours: UnavailableHours = {
  start: '00:00',
  end: '06:00'
};

const initialState: Profile = {
  fullName: '',
  email: '',
  brandName: '',
  phone: '',
  gstNumber: '',
  bankAccountName: '',
  bankAccount: '',
  ifscCode: '',
  cities: [],
  logo: '',
  loading: false,
  error: null,
  unavailableHours: defaultUnavailableHours
};

const isFirestoreTimestamp = (value: any): value is Timestamp => {
  return value instanceof Timestamp;
};

// Updated convertTimestamps function with proper type handling
const convertTimestamps = (data: any) => {
  if (!data) return data;
  
  return Object.entries(data).reduce((acc, [key, value]) => {
    if (isFirestoreTimestamp(value)) {
      return { ...acc, [key]: value.toMillis() };
    }
    return { ...acc, [key]: value };
  }, {});
};

// Helper function to wait for auth state
const waitForAuthState = () => {
  return new Promise<string>((resolve, reject) => {
    // Set a timeout to prevent waiting indefinitely
    const timeoutId = setTimeout(() => {
      reject(new Error('Authentication timeout'));
    }, 10000); // 10 seconds timeout
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      clearTimeout(timeoutId);
      
      if (user) {
        resolve(user.uid);
      } else {
        reject(new Error('No authenticated user'));
      }
    });
  });
};

export const fetchProfile = createAsyncThunk<Profile, void, { rejectValue: string }>(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      let userId;
      
      if (!auth.currentUser) {
        console.log('No authenticated user, waiting for auth state...');
        try {
          userId = await waitForAuthState();
          console.log('Auth state resolved, user found:', userId);
        } catch (error) {
          console.error('Auth state resolution failed:', error);
          return rejectWithValue('Authentication failed');
        }
      } else {
        userId = auth.currentUser.uid;
        console.log('User already authenticated:', userId);
      }
      
      // Fetch profile data
      console.log('Fetching profile for user:', userId);
      const docRef = doc(db, 'partnerWebApp', userId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        console.error('Profile document not found');
        return rejectWithValue('Profile not found');
      }
      
      const rawData = docSnap.data();
      console.log('Raw profile data:', rawData);
      const convertedData = convertTimestamps(rawData);
      
      const profileData: Profile = {
        ...initialState,
        ...convertedData,
        unavailableHours: convertedData.unavailableHours 
          ? { 
              start: convertedData.unavailableHours.start || defaultUnavailableHours.start,
              end: convertedData.unavailableHours.end || defaultUnavailableHours.end
            }
          : defaultUnavailableHours
      };
      
      return profileData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error in fetchProfile:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);
 
export const updateProfile = createAsyncThunk<Partial<Profile>, Partial<Profile>, { rejectValue: string }>(
  'profile/updateProfile',
  async (profile, { rejectWithValue }) => {
    try {
      let userId;
      
      if (!auth.currentUser) {
        try {
          userId = await waitForAuthState();
        } catch (error) {
          return rejectWithValue('Authentication failed');
        }
      } else {
        userId = auth.currentUser.uid;
      }
      
      const docRef = doc(db, 'partnerWebApp', userId);
      
      // Convert back to Firestore Timestamp if needed
      const dataToSave = {
        ...profile,
        unavailableHours: profile.unavailableHours || defaultUnavailableHours,
        createdAt: profile.createdAt ? Timestamp.fromMillis(profile.createdAt) : Timestamp.now()
      };
      
      await setDoc(docRef, dataToSave, { merge: true });
      return profile;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return rejectWithValue(errorMessage);
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    resetProfile: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        Object.assign(state, action.payload);
        state.unavailableHours = action.payload.unavailableHours || defaultUnavailableHours;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message || 'Failed to fetch profile';
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        Object.assign(state, action.payload);
        if (action.payload.unavailableHours) {
          state.unavailableHours = action.payload.unavailableHours;
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message || 'Failed to update profile';
      });
  },
});

export const { resetProfile } = profileSlice.actions;
export default profileSlice.reducer;
