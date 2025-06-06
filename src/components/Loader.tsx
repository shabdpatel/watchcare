import React from 'react';

const Loader = () => {
    return (
        <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="relative">
                <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-blue-600 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-10 w-10 rounded-full border-t-4 border-b-4 border-rose-500 animate-spin"></div>
                </div>
            </div>
        </div>
    );
};

export default Loader;
