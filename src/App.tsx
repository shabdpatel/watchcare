import "./App.css";
import Navbar from "./components/Navbar";
import Homepage from "./pages/Homepage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Input_form from "./components/Input_form";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/input" element={<Input_form />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;

