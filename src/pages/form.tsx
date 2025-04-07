import { useState, useEffect } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "./firebase";
import {
    SparklesIcon,
    ClockIcon,
    UserCircleIcon,
    EnvelopeIcon,
    PhoneIcon,
    CalendarIcon,
    CreditCardIcon,
    BanknotesIcon,
    XMarkIcon
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

const Form = ({ selectedService, onClose }) => {
    const [formData, setFormData] = useState({
        brand: "",
        model: "",
        purchaseDate: "",
        warranty: "valid",
        description: "",
        name: "",
        phone: "",
        email: "",
        address: "",
        paymentType: "card",
        cardNumber: "",
        expiry: "",
        cvv: ""
    });

    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const steps = [
        { number: 1, title: "Watch Details" },
        { number: 2, title: "Personal Info" },
        { number: 3, title: "Payment Method" }
    ];

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const validateStep = () => {
        let newErrors = {};

        if (currentStep === 1) {
            if (!formData.brand.trim()) newErrors.brand = "Brand is required";
            if (!formData.model.trim()) newErrors.model = "Model is required";
            if (!formData.purchaseDate) newErrors.purchaseDate = "Purchase date is required";
        }

        if (currentStep === 2) {
            if (!formData.name.trim()) newErrors.name = "Name is required";
            if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Invalid email";
            if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = "Invalid phone number";
            if (!formData.address.trim()) newErrors.address = "Address is required";
        }

        if (currentStep === 3 && formData.paymentType === "card") {
            if (!/^\d{16}$/.test(formData.cardNumber)) newErrors.cardNumber = "Invalid card number";
            if (!/^\d{2}\/\d{2}$/.test(formData.expiry)) newErrors.expiry = "MM/YY required";
            if (!/^\d{3,4}$/.test(formData.cvv)) newErrors.cvv = "Invalid CVV";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNextStep = () => {
        if (validateStep()) {
            setCurrentStep(prev => Math.min(prev + 1, 3));
        }
    };

    const handlePrevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep()) return;

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, selectedService), formData);

            setFormData({
                brand: "",
                model: "",
                purchaseDate: "",
                warranty: "valid",
                description: "",
                name: "",
                phone: "",
                email: "",
                address: "",
                paymentType: "card",
                cardNumber: "",
                expiry: "",
                cvv: ""
            });

            setIsSubmitting(false);
            onClose();
        } catch (error) {
            console.error("Error submitting form:", error);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-black rounded-2xl shadow-2xl w-full max-w-2xl relative overflow-hidden border border-gray-800"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gray-800">
                    <div
                        className="h-full bg-gradient-to-r from-rose-500 to-amber-300 transition-all duration-500"
                        style={{ width: `${(currentStep - 1) * 50}%` }}
                    />
                </div>

                <div className="p-8 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-800 transition-colors"
                    >
                        <XMarkIcon className="w-6 h-6 text-rose-400" />
                    </button>

                    <div className="flex items-center gap-4 mb-8">
                        <SparklesIcon className="w-8 h-8 bg-gradient-to-r from-rose-400 to-amber-300 text-transparent bg-clip-text" />
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-rose-400 to-amber-300 bg-clip-text text-transparent uppercase tracking-wider">
                            {selectedService} Service Request
                        </h2>
                    </div>

                    <div className="flex gap-4 mb-8">
                        {steps.map(step => (
                            <div
                                key={step.number}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full border ${currentStep === step.number
                                    ? 'border-rose-500 bg-rose-500/20 text-rose-400'
                                    : 'border-gray-700 text-gray-400'
                                    } uppercase tracking-wider text-sm`}
                            >
                                <span className="font-bold">{step.number}</span>
                                <span className="hidden sm:inline">{step.title}</span>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleFormSubmit}>
                        <AnimatePresence mode='wait'>
                            {currentStep === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ x: -100, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: 100, opacity: 0 }}
                                    className="space-y-6"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="relative">
                                            <ClockIcon className="w-6 h-6 text-gray-400 absolute left-3 top-3" />
                                            <input
                                                type="text"
                                                name="brand"
                                                placeholder="Watch Brand"
                                                value={formData.brand}
                                                onChange={handleInputChange}
                                                className="w-full pl-12 pr-4 py-3 bg-gray-900 rounded-lg border border-gray-800 text-gray-300 placeholder-gray-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/30 transition-all"
                                            />
                                            <ErrorText text={errors.brand} />
                                        </div>

                                        <div className="relative">
                                            <ClockIcon className="w-6 h-6 text-gray-400 absolute left-3 top-3" />
                                            <input
                                                type="text"
                                                name="model"
                                                placeholder="Watch Model"
                                                value={formData.model}
                                                onChange={handleInputChange}
                                                className="w-full pl-12 pr-4 py-3 bg-gray-900 rounded-lg border border-gray-800 text-gray-300 placeholder-gray-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/30 transition-all"
                                            />
                                            <ErrorText text={errors.model} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="relative">
                                            <CalendarIcon className="w-6 h-6 text-gray-400 absolute left-3 top-3" />
                                            <input
                                                type="date"
                                                name="purchaseDate"
                                                value={formData.purchaseDate}
                                                onChange={handleInputChange}
                                                className="w-full pl-12 pr-4 py-3 bg-gray-900 rounded-lg border border-gray-800 text-gray-300 placeholder-gray-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/30 transition-all"
                                            />
                                            <ErrorText text={errors.purchaseDate} />
                                        </div>

                                        <div className="relative">
                                            <select
                                                name="warranty"
                                                value={formData.warranty}
                                                onChange={handleInputChange}
                                                className="w-full pl-4 pr-4 py-3 bg-gray-900 rounded-lg border border-gray-800 text-gray-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/30 transition-all"
                                            >
                                                <option value="valid">Under Warranty</option>
                                                <option value="expired">Warranty Expired</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <textarea
                                            name="description"
                                            placeholder="Watch Description & Issues"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-gray-900 rounded-lg border border-gray-800 text-gray-300 placeholder-gray-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/30 transition-all min-h-[150px]"
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {currentStep === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ x: -100, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: 100, opacity: 0 }}
                                    className="space-y-6"
                                >
                                    <div className="relative">
                                        <UserCircleIcon className="w-6 h-6 text-gray-400 absolute left-3 top-3" />
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="Your Full Name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full pl-12 pr-4 py-3 bg-gray-900 rounded-lg border border-gray-800 text-gray-300 placeholder-gray-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/30 transition-all"
                                        />
                                        <ErrorText text={errors.name} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="relative">
                                            <PhoneIcon className="w-6 h-6 text-gray-400 absolute left-3 top-3" />
                                            <input
                                                type="tel"
                                                name="phone"
                                                placeholder="Phone Number"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className="w-full pl-12 pr-4 py-3 bg-gray-900 rounded-lg border border-gray-800 text-gray-300 placeholder-gray-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/30 transition-all"
                                            />
                                            <ErrorText text={errors.phone} />
                                        </div>

                                        <div className="relative">
                                            <EnvelopeIcon className="w-6 h-6 text-gray-400 absolute left-3 top-3" />
                                            <input
                                                type="email"
                                                name="email"
                                                placeholder="Email Address"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="w-full pl-12 pr-4 py-3 bg-gray-900 rounded-lg border border-gray-800 text-gray-300 placeholder-gray-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/30 transition-all"
                                            />
                                            <ErrorText text={errors.email} />
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <textarea
                                            name="address"
                                            placeholder="Shipping Address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-gray-900 rounded-lg border border-gray-800 text-gray-300 placeholder-gray-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/30 transition-all min-h-[100px]"
                                        />
                                        <ErrorText text={errors.address} />
                                    </div>
                                </motion.div>
                            )}

                            {currentStep === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ x: -100, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: 100, opacity: 0 }}
                                    className="space-y-6"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <label className={`p-4 rounded-lg cursor-pointer border ${formData.paymentType === 'card'
                                            ? 'border-rose-500 bg-rose-500/20'
                                            : 'border-gray-700 bg-gray-900'
                                            }`}>
                                            <input
                                                type="radio"
                                                name="paymentType"
                                                value="card"
                                                checked={formData.paymentType === 'card'}
                                                onChange={handleInputChange}
                                                className="hidden"
                                            />
                                            <div className="flex items-center gap-2 text-gray-300">
                                                <CreditCardIcon className="w-6 h-6 text-rose-400" />
                                                Credit/Debit Card
                                            </div>
                                        </label>

                                        <label className={`p-4 rounded-lg cursor-pointer border ${formData.paymentType === 'cod'
                                            ? 'border-rose-500 bg-rose-500/20'
                                            : 'border-gray-700 bg-gray-900'
                                            }`}>
                                            <input
                                                type="radio"
                                                name="paymentType"
                                                value="cod"
                                                checked={formData.paymentType === 'cod'}
                                                onChange={handleInputChange}
                                                className="hidden"
                                            />
                                            <div className="flex items-center gap-2 text-gray-300">
                                                <BanknotesIcon className="w-6 h-6 text-rose-400" />
                                                Cash on Delivery
                                            </div>
                                        </label>
                                    </div>

                                    {formData.paymentType === 'card' && (
                                        <div className="space-y-4">
                                            <div className="relative">
                                                <CreditCardIcon className="w-6 h-6 text-gray-400 absolute left-3 top-3" />
                                                <input
                                                    type="text"
                                                    name="cardNumber"
                                                    placeholder="Card Number"
                                                    value={formData.cardNumber}
                                                    onChange={handleInputChange}
                                                    className="w-full pl-12 pr-4 py-3 bg-gray-900 rounded-lg border border-gray-800 text-gray-300 placeholder-gray-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/30 transition-all"
                                                />
                                                <ErrorText text={errors.cardNumber} />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        name="expiry"
                                                        placeholder="MM/YY"
                                                        value={formData.expiry}
                                                        onChange={handleInputChange}
                                                        className="w-full px-4 py-3 bg-gray-900 rounded-lg border border-gray-800 text-gray-300 placeholder-gray-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/30 transition-all"
                                                    />
                                                    <ErrorText text={errors.expiry} />
                                                </div>

                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        name="cvv"
                                                        placeholder="CVV"
                                                        value={formData.cvv}
                                                        onChange={handleInputChange}
                                                        className="w-full px-4 py-3 bg-gray-900 rounded-lg border border-gray-800 text-gray-300 placeholder-gray-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/30 transition-all"
                                                    />
                                                    <ErrorText text={errors.cvv} />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex justify-between mt-8">
                            {currentStep > 1 && (
                                <button
                                    type="button"
                                    onClick={handlePrevStep}
                                    className="px-6 py-2 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-colors flex items-center gap-2 uppercase tracking-wider text-sm"
                                >
                                    <ClockIcon className="w-5 h-5" />
                                    Previous
                                </button>
                            )}

                            {currentStep < 3 ? (
                                <button
                                    type="button"
                                    onClick={handleNextStep}
                                    className="ml-auto px-6 py-2 bg-gradient-to-r from-rose-500 to-amber-400 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 uppercase tracking-wider text-sm font-medium"
                                >
                                    Next
                                    <SparklesIcon className="w-5 h-5" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="ml-auto px-6 py-2 bg-gradient-to-r from-rose-500 to-amber-400 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 uppercase tracking-wider text-sm font-medium disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Processing...' : 'Submit Request'}
                                    <SparklesIcon className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

const ErrorText = ({ text }) => (
    <motion.span
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-rose-400 text-sm block mt-1 font-light"
    >
        {text}
    </motion.span>
);

export default Form;