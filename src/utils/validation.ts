export const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

export const validatePhone = (phone: string): boolean => {
    const re = /^[0-9]{10}$/;
    return re.test(phone);
};

export const validatePincode = (pincode: string): boolean => {
    const re = /^[0-9]{6}$/;
    return re.test(pincode);
};

export const sanitizeInput = (input: string): string => {
    return input.trim().replace(/[<>]/g, '');
};

export const validatePrice = (price: number): boolean => {
    return !isNaN(price) && price > 0 && price < 1000000;
};
