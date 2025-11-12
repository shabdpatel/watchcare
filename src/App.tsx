import "./App.css";
import Navbar from "./components/Navbar";
import Homepage from "./pages/Homepage";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import Input_form from "./components/Input_form";
import FormPage from "./pages/form";
import Detail from "./components/Details";
import AllWatches from "./pages/All_wathces";
import Shoes from "./pages/Shoes";
import Fashion from "./pages/Fashion";
import Bags from "./pages/Bags";
import Electronics from "./pages/Electronics";
import Login from "./components/Login";
import Profile from "./components/Profile";
import Register from "./components/Register";
import Accessories from "./pages/Accessories";
import { AuthProvider, useAuth } from './components/AuthContext';
import UserOnboarding from './components/UserOnboarding';
import Favicon from './components/Favicon';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import InstallPrompt from './components/InstallPrompt';
import ScrollToTop from './components/ScrollToTop';
import { SearchProvider } from './context/SearchContext';
import { CartProvider } from './context/CartContext';
import Cart from './components/Cart';
import ChatBot from './components/ChatBot';
import Sells from "./components/Sells";
import AdminPanel from './components/AdminPanel';
import OrderSuccess from "./pages/OrderSuccess";
import CheckoutFlow from "./components/CheckoutFlow";
import Orders from './pages/Orders';
import { useEffect, useState } from 'react';
import Loader from './components/Loader';

function RouteChangeHandler() {
  const location = useLocation();
  const [isRouteChanging, setIsRouteChanging] = useState(false);

  useEffect(() => {
    setIsRouteChanging(true);
    const timer = setTimeout(() => {
      setIsRouteChanging(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [location]);

  return isRouteChanging ? <Loader /> : null;
}

type AuthLike = { currentUser: { email?: string } | null; onboardingCompleted: boolean; loading: boolean };

function AppContent() {
  const { currentUser, onboardingCompleted, loading } = useAuth() as AuthLike;

  if (loading) return <Loader />;

  return (
    <div className="flex flex-col min-h-screen">
      <BrowserRouter>
        <RouteChangeHandler />
        <ScrollToTop />
        <Navbar />
        <main id="main-content" role="main" className="flex-1 pt-20" aria-label="Main content">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/all_watches" element={<AllWatches />} />
            <Route path="/input" element={<Input_form />} />
            {/* @ts-expect-error route-level page handles its own props/state */}
            <Route path="/form" element={<FormPage />} />
            <Route path="/details/:collectionName/:id" element={<Detail />} />
            <Route path="/shoes" element={<Shoes />} />
            <Route path="/fashion" element={<Fashion />} />
            <Route path="/bags" element={<Bags />} />
            <Route path="/accessories" element={<Accessories />} />
            <Route path="/electronics" element={<Electronics />} />
            <Route path="/cart" element={<Cart />} />
            {/* @ts-expect-error route wrapper supplies props internally */}
            <Route path="/checkout" element={<CheckoutFlow />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/orders" element={<Orders />} />
            {/* Redirects for specific paths */}
            <Route path="/sells" element={<Sells />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={
              currentUser ? (
                onboardingCompleted ? <Profile /> : <Navigate to="/onboarding" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } />
            <Route path="/onboarding" element={
              currentUser ? (
                onboardingCompleted ? <Navigate to="/profile" replace /> : <UserOnboarding />
              ) : (
                <Navigate to="/login" replace />
              )
            } />
            <Route path="/admin" element={
              currentUser && ['shabdpatel0@gmail.com', '22bph028@nith.ac.in', 'prameetsw@gmail.com', 'shabdpatel87@gmail.com'].includes(currentUser?.email ?? '') ? (
                <AdminPanel />
              ) : (
                <Navigate to="/login" replace />
              )
            } />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
        <Footer />
        <ChatBot />
      </BrowserRouter>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <SearchProvider>
          <a href="#main-content" className="skip-link">Skip to main content</a>
          <Favicon />
          <InstallPrompt />
          <ToastContainer
            position="top-right"
            autoClose={2000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          <AppContent />
        </SearchProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

