interface AnalyticsEvent {
    category: string;
    action: string;
    label?: string;
    value?: number;
}

export const trackEvent = ({ category, action, label, value }: AnalyticsEvent): void => {
    if (typeof window.gtag !== 'undefined') {
        window.gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value
        });
    }
};

export const trackPageView = (url: string): void => {
    if (typeof window.gtag !== 'undefined') {
        window.gtag('config', import.meta.env.VITE_GA_TRACKING_ID, {
            page_path: url
        });
    }
};
