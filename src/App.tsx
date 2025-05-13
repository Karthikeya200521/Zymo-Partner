import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { AuthPage } from './pages/AuthPage';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { Home } from './pages/Home';
import { ProfilePage } from './pages/ProfilePage';
import { UploadLogoPage } from './pages/UploadLogoPage';
import { UploadCarPage } from './pages/UploadCarPage';
import { Layout } from './components/Layout'; 
import AdminPage from './pages/AdminPage';
import Bookings from './pages/Bookings';
import { useEffect, useState } from 'react';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Protected Route component
const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    
    return () => unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    // Still checking authentication state
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // User is not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated
  return <Outlet />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth pages - public */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Protected Routes - require authentication */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/upload-logo" element={<UploadLogoPage />} />
            <Route path="/upload-car" element={<UploadCarPage />} />
            <Route path="/bookings" element={<Bookings />} />
          </Route>
        </Route>
        
        {/* Admin route - separate from normal protected routes */}
        <Route path="/admin" element={<AdminPage />} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/auth" replace />} />
      </Routes>
       
    </BrowserRouter>
  );
}

export default App;
