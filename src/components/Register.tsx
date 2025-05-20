import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import flags from 'react-phone-number-input/flags';

const Register = () => {
    const [method, setMethod] = useState('email');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState(null);
    const { signup, signupWithPhone, verifyPhoneCode } = useAuth();
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        email: '',
        password: '',
        displayName: '',
        firstName: '',
        lastName: '',
        phone: '',
        address: {
            street: '',
            city: '',
            state: '',
            zip: '',
            country: ''
        },
        dateOfBirth: ''
    });


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            await signup(userData.email, userData.password, {
                displayName: userData.displayName,
                firstName: userData.firstName,
                lastName: userData.lastName,
                phone: userData.phone,
                address: userData.address,
                dateOfBirth: userData.dateOfBirth
            });
            navigate('/profile');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) return;

        setIsSubmitting(true);
        setError('');

        try {
            await signup(email, password, displayName);
            navigate('/profile');
        } catch (err) {
            setError(err.message || 'Failed to create account');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePhoneSubmit = async (e) => {
        e.preventDefault();
        if (!phoneNumber) return;

        setIsSubmitting(true);
        setError('');

        try {
            const result = await signupWithPhone(phoneNumber);
            setConfirmationResult(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        if (!verificationCode) return;

        setIsSubmitting(true);
        setError('');

        try {
            await verifyPhoneCode(confirmationResult, verificationCode, displayName);
            navigate('/profile');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen sm:py-12 px-4 sm:px-0 bg-gray-50 flex items-center justify-center">
            <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
                    <p className="text-gray-600">Get started with your free account</p>
                </div>

                <div className="flex mb-8 border-b border-gray-200">
                    <button
                        onClick={() => setMethod('email')}
                        className={`flex-1 py-2 px-4 text-center ${method === 'email'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Email
                    </button>
                    <button
                        onClick={() => setMethod('phone')}
                        className={`flex-1 py-2 px-4 text-center ${method === 'phone'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Phone
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center">
                        <svg
                            className="w-5 h-5 mr-2 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </div>
                )}

                {method === 'email' ? (
                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Display Name
                            </label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                placeholder="Your name"
                                autoComplete="name"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                placeholder="Enter your email"
                                autoComplete="email"
                                required
                                disabled={isSubmitting}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                placeholder="Create a password"
                                autoComplete="new-password"
                                required
                                disabled={isSubmitting}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition flex items-center justify-center disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <svg
                                    className="animate-spin h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={confirmationResult ? handleVerifyCode : handlePhoneSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Display Name
                            </label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                placeholder="Your name"
                                autoComplete="name"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                placeholder="+1 234 567 8900"
                                disabled={isSubmitting || confirmationResult}
                                required
                            />
                        </div>

                        {confirmationResult && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <PhoneInput
                                    international
                                    countryCallingCodeEditable={false}
                                    defaultCountry="IN"
                                    flags={flags}
                                    value={phoneNumber}
                                    onChange={setPhoneNumber}
                                    disabled={isSubmitting || confirmationResult}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    inputComponent={({ ...rest }) => (
                                        <input
                                            {...rest}
                                            className="w-full px-3 py-2 border-none focus:ring-0"
                                            placeholder="Enter phone number"
                                            required
                                        />
                                    )}
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition flex items-center justify-center disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <svg
                                    className="animate-spin h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : confirmationResult ? (
                                'Verify Code'
                            ) : (
                                'Send Verification Code'
                            )}
                        </button>
                    </form>
                )}



                <div className="mt-8 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link
                        to="/login"
                        className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                        Log in
                    </Link>
                </div>

                <div className="mt-4 text-center text-sm text-gray-600">
                    By creating an account, you agree to our{' '}
                    <Link
                        to="/terms"
                        className="text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        Terms of Service
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;