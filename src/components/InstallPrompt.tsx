import React, { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const InstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showBanner, setShowBanner] = useState(false);
    const [installing, setInstalling] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            maybeShowBanner();
        };

        const maybeShowBanner = () => {
            if (window.matchMedia('(display-mode: standalone)').matches) return;
            // @ts-ignore iOS standalone
            if (window.navigator.standalone) return;

            const lastShown = localStorage.getItem('installPromptLastShown');
            const now = Date.now();
            if (lastShown && now - Number(lastShown) < 24 * 60 * 60 * 1000) return;
            localStorage.setItem('installPromptLastShown', String(now));
            setShowBanner(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        setInstalling(true);
        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setShowBanner(false);
            }
        } catch (err) {
            console.error('PWA install failed', err);
        } finally {
            setDeferredPrompt(null);
            setInstalling(false);
        }
    };

    const handleClose = () => setShowBanner(false);

    if (!showBanner || !deferredPrompt) return null;

    return (
        <div
            role="dialog"
            aria-label="Install Unbox Store"
            className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-md z-50 shadow-xl border border-gray-200 rounded-xl bg-white/95 backdrop-blur-sm flex items-center gap-3 px-4 py-3 animate-fadeIn"
        >
            <div className="h-9 w-9 rounded-md bg-black text-white flex items-center justify-center text-xs font-semibold">UX</div>
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Install Unbox Store</p>
                <p className="text-xs text-gray-500">Get faster access & offline support</p>
            </div>
            <button
                onClick={handleInstallClick}
                disabled={installing}
                className="px-3 py-1.5 rounded-md bg-black text-white text-xs font-medium disabled:opacity-60"
            >
                {installing ? 'Installing…' : 'Install'}
            </button>
            <button
                onClick={handleClose}
                aria-label="Close install prompt"
                className="p-1 rounded-md hover:bg-gray-100"
            >
                <XMarkIcon className="w-4 h-4 text-gray-500" />
            </button>
        </div>
    );
};

export default InstallPrompt;