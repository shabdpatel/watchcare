import "./App.css";
import Navbar from "./components/Navbar";
import Homepage from "./pages/Homepage";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Footer from "./components/Footer";
import Input_form from "./components/Input_form";
import form from "./pages/form";
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

function AppContent() {
  const { currentUser, onboardingCompleted, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen">
      <BrowserRouter>
        <Navbar />
        <div className="flex-1 pt-20">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/all_watches" element={<AllWatches />} />
            <Route path="/input" element={<Input_form />} />
            <Route path="/form" element={<form />} />
            <Route path="/details/:collectionName/:id" element={<Detail />} />
            <Route path="/shoes" element={<Shoes />} />
            <Route path="/fashion" element={<Fashion />} />
            <Route path="/bags" element={<Bags />} />
            <Route path="/accessories" element={<Accessories />} />
            <Route path="/electronics" element={<Electronics />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={
              currentUser ? (
                onboardingCompleted ? (
                  <Profile />
                ) : (
                  <UserOnboarding />
                )
              ) : (
                <Navigate to="/login" />
              )
            } />
            <Route path="/register" element={<Register />} />
          </Routes>
        </div>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Favicon />
      <InstallPrompt />
      <ToastContainer />
      <AppContent />
    </AuthProvider>
  );
}

export default App;

