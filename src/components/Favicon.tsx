import React from 'react';
import { IoBagHandleOutline } from "react-icons/io5";

const Favicon: React.FC = () => {
    React.useEffect(() => {
        // Create a canvas element
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            // Set background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 32, 32);

            // Draw icon
            ctx.fillStyle = '#000000';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = '24px "Material Icons"';
            ctx.fillText('shopping_bag', 16, 16);

            // Update favicon
            const link = document.querySelector<HTMLLinkElement>('link[rel*="icon"]') || document.createElement('link');
            link.type = 'image/x-icon';
            link.rel = 'shortcut icon';
            link.href = canvas.toDataURL();
            document.head.appendChild(link);
        }
    }, []);

    return null;
};

export default Favicon;