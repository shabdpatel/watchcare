interface Window {
    Tawk_API?: {
        onLoad: () => void;
        hideWidget: () => void;
        maximize: () => void;
    };
    Tawk_LoadStart?: Date;
    Razorpay: unknown;
}

// Negotiation types used across the app
type NegotiationStatus = 'pending' | 'approved' | 'rejected';

type FirestoreTimestampLike = { toDate: () => Date };

interface NegotiationRequest {
    id: string; // `${productId}_${buyerId}`
    productId: string;
    productCollection?: string; // e.g., Watches, Shoes
    buyerId: string; // user email
    sellerId?: string; // optional future use
    originalPrice: number;
    proposedPrice: number;
    approvedPrice?: number;
    status: NegotiationStatus;
    createdAt: Date | FirestoreTimestampLike; // Firestore Timestamp or Date
    updatedAt?: Date | FirestoreTimestampLike; // Firestore Timestamp or Date
    approvedAt?: Date | FirestoreTimestampLike;
    approvedBy?: string;
    rejectedAt?: Date | FirestoreTimestampLike;
    notes?: string;
}