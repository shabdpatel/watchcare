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
            if (window.matchMedia('(display-mode: standalone)').matches) return;

            // Avoid spamming: show once per day
            const lastShown = localStorage.getItem('installPromptLastShown');
            const now = Date.now();
            if (lastShown && now - Number(lastShown) < 24 * 60 * 60 * 1000) return;

            localStorage.setItem('installPromptLastShown', String(now));

            toast.dismiss();
            toast(
                <div className="flex items-center gap-3 px-3 py-2">
                    <div className="h-8 w-8 rounded-md bg-black text-white flex items-center justify-center text-xs font-semibold">UX</div>
                    <div className="flex-1">
                        <p className="text-sm text-gray-900">Install Unbox Store for a faster experience</p>
                    </div>
                    <button
                        onClick={handleInstallClick}
                        className="px-3 py-1 rounded-md bg-black text-white text-sm disabled:opacity-60"
                        disabled={!isInstallable}
                        aria-label="Install Unbox Store"
                    >
                        Install Now
                    </button>
                </div>,
                {
                    position: 'bottom-center',
                    autoClose: false,
                    closeOnClick: false,
                    hideProgressBar: true,
                    className: 'shadow-lg rounded-lg bg-white border border-gray-200',
                }
            );
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
                    toast.dismiss();
                    toast.success('Unbox Store installed');
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