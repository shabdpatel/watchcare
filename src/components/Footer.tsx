import { FaInstagram, FaTwitter, FaFacebookF, FaYoutube } from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="bg-black text-white py-12 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
                {/* Crazy Tagline */}
                <h2 className="text-3xl font-light tracking-widest uppercase text-gray-300">
                    Time Waits for No One, But You Can Own It.
                </h2>

                {/* Social Media Links */}
                <div className="flex justify-center gap-6 mt-6">
                    <a href="#" className="text-gray-400 hover:text-white text-xl transition-all duration-300">
                        <FaInstagram />
                    </a>
                    <a href="#" className="text-gray-400 hover:text-white text-xl transition-all duration-300">
                        <FaTwitter />
                    </a>
                    <a href="#" className="text-gray-400 hover:text-white text-xl transition-all duration-300">
                        <FaFacebookF />
                    </a>
                    <a href="#" className="text-gray-400 hover:text-white text-xl transition-all duration-300">
                        <FaYoutube />
                    </a>
                </div>

                {/* Footer Links */}
                <div className="flex flex-wrap justify-center gap-6 mt-6 text-gray-400 text-sm uppercase">
                    <a href="#" className="hover:text-white transition-all duration-300">About Us</a>
                    <a href="#" className="hover:text-white transition-all duration-300">Contact</a>
                    <a href="#" className="hover:text-white transition-all duration-300">Privacy Policy</a>
                    <a href="#" className="hover:text-white transition-all duration-300">Terms of Service</a>
                </div>

                {/* Copyright */}
                <p className="mt-8 text-gray-500 text-sm tracking-widest">
                    © {new Date().getFullYear()} WatchStore. All Rights Reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
