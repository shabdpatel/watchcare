import "./App.css";
import Navbar from "./components/Navbar";
import Homepage from "./pages/Homepage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Input_form from "./components/Input_form";
import form from "./pages/form";
import Detail from "./components/Details";
import AllWatches from "./pages/All_wathces";
import Men from "./pages/Men";
import Women from "./pages/Women";
import Smart from "./pages/Smart";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <BrowserRouter>
        <Navbar />
        {/* Add pt-16 (or pt-[68px] if you need exact match) to account for navbar height */}
        <div className="flex-1 pt-20">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/all_watches" element={<AllWatches />} />
            <Route path="/input" element={<Input_form />} />
            <Route path="/form" element={<form />} />
            <Route path="/details/:collectionName/:id" element={<Detail />} />
            <Route path="/men" element={<Men />} />
            <Route path="/women" element={<Women />} />
            <Route path="/smart" element={<Smart />} />
          </Routes>
        </div>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;

