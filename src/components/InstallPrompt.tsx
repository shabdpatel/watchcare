// filepath: /home/shabd/Desktop/Webdev/Projects/watch_store/src/components/InstallPrompt.tsx
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const InstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        const showInstallPrompt = () => {
            toast.info(
                <div className="install-prompt">
                    <p>Install Unboxing Store App for a better experience!</p>
                    <button
                        onClick={() => handleInstallClick()}
                        className="bg-black text-white px-4 py-2 rounded"
                    >
                        Install Now
                    </button>
                </div>,
                {
                    position: "bottom-center",
                    autoClose: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true
                }
            );
        };

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            showInstallPrompt();
        });

        // Check if not installed every time page is loaded
        if (!window.matchMedia('(display-mode: standalone)').matches) {
            showInstallPrompt();
        }
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                toast.success('Thank you for installing Unboxing Store!');
            }
            setDeferredPrompt(null);
        }
    };

    return null;
};

export default InstallPrompt;