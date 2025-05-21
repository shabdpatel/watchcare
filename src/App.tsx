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
import Women from "./pages/Women";
import Smart from "./pages/Smart";
import Brand from "./pages/Brand";
import Login from "./components/Login";
import Profile from "./components/Profile";
import Register from "./components/Register";
import { AuthProvider, useAuth } from './components/AuthContext';
import UserOnboarding from './components/UserOnboarding';
import Favicon from './components/Favicon';

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
            <Route path="/women" element={<Women />} />
            <Route path="/smart" element={<Smart />} />
            <Route path="/brand" element={<Brand />} />
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
      <AppContent />
    </AuthProvider>
  );
}

export default App;

