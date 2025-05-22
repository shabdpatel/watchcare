import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const InstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isInstallable, setIsInstallable] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsInstallable(true);
            showInstallPrompt();
        };

        const showInstallPrompt = () => {
            if (!window.matchMedia('(display-mode: standalone)').matches) {
                toast.info(
                    <div className="install-prompt">
                        <p>Install Unboxing Store App for a better experience!</p>
                        <button
                            onClick={() => handleInstallClick()}
                            className="bg-black text-white px-4 py-2 rounded"
                            disabled={!isInstallable}
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
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, [isInstallable]);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            try {
                await (deferredPrompt as any).prompt();
                const { outcome } = await (deferredPrompt as any).userChoice;
                if (outcome === 'accepted') {
                    toast.success('Thank you for installing Unboxing Store!');
                    setIsInstallable(false);
                }
                setDeferredPrompt(null);
            } catch (error) {
                console.error('Installation failed:', error);
                toast.error('Installation failed. Please try again.');
            }
        }
    };

    return null;
};

export default InstallPrompt;