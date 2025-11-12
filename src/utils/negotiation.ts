import { db } from '../pages/firebase';
import { collection, doc, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';

export type NegotiationStatus = 'pending' | 'approved' | 'rejected';

export interface NegotiationRequest {
  id: string; // `${productId}_${buyerId}`
  productId: string;
  productCollection?: string;
  buyerId: string;
  sellerId?: string;
  originalPrice: number;
  proposedPrice: number;
  approvedPrice?: number;
  status: NegotiationStatus;
  createdAt: Date;
  updatedAt?: Date;
  approvedAt?: Date;
  approvedBy?: string;
  rejectedAt?: Date;
  notes?: string;
}

const coll = () => collection(db, 'negotiations');

export const negotiationDocId = (productId: string, buyerId: string) => `${productId}_${buyerId}`;

export async function submitNegotiationRequest(args: {
  productId: string;
  productCollection?: string;
  buyerId: string;
  originalPrice: number;
  proposedPrice: number;
}): Promise<void> {
  const { productId, productCollection, buyerId, originalPrice, proposedPrice } = args;
  const id = negotiationDocId(productId, buyerId);
  const ref = doc(coll(), id);
  const now = new Date();
  const existing = await getDoc(ref);
  if (existing.exists()) {
    await updateDoc(ref, {
      productId,
      productCollection: productCollection || existing.data().productCollection,
      buyerId,
      originalPrice,
      proposedPrice,
      status: 'pending',
      updatedAt: now,
    });
  } else {
    await setDoc(ref, {
      id,
      productId,
      productCollection,
      buyerId,
      originalPrice,
      proposedPrice,
      status: 'pending',
      createdAt: now,
    });
  }
}

export async function getApprovedNegotiatedPrice(productId: string, buyerId: string): Promise<number | undefined> {
  const id = negotiationDocId(productId, buyerId);
  const snapshot = await getDoc(doc(coll(), id));
  if (snapshot.exists()) {
    const data = snapshot.data() as Partial<NegotiationRequest>;
    if (data.status === 'approved' && typeof data.approvedPrice === 'number') {
      return data.approvedPrice;
    }
  }
  return undefined;
}

export function listenNegotiation(
  productId: string,
  buyerId: string,
  cb: (neg: NegotiationRequest | null) => void
) {
  const id = negotiationDocId(productId, buyerId);
  return onSnapshot(doc(coll(), id), (snap) => {
    if (!snap.exists()) {
      cb(null);
      return;
    }
    const data = snap.data();
    cb({
      id: data.id,
      productId: data.productId,
      productCollection: data.productCollection,
      buyerId: data.buyerId,
      sellerId: data.sellerId,
      originalPrice: data.originalPrice,
      proposedPrice: data.proposedPrice,
      approvedPrice: data.approvedPrice,
      status: data.status,
      createdAt: (data.createdAt?.toDate && data.createdAt.toDate()) || data.createdAt,
      updatedAt: (data.updatedAt?.toDate && data.updatedAt.toDate()) || data.updatedAt,
      approvedAt: (data.approvedAt?.toDate && data.approvedAt.toDate()) || data.approvedAt,
      approvedBy: data.approvedBy,
      rejectedAt: (data.rejectedAt?.toDate && data.rejectedAt.toDate()) || data.rejectedAt,
      notes: data.notes,
    });
  });
}

export function getDisplayPrice(basePrice: number, approved?: number) {
  return typeof approved === 'number' ? approved : basePrice;
}
