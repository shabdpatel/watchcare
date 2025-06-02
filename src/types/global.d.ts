interface Window {
    Tawk_API?: {
        onLoad: () => void;
        hideWidget: () => void;
        maximize: () => void;
    };
    Tawk_LoadStart?: Date;
    Razorpay: any;
}