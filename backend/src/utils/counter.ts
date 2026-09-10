import { db } from '../config/firebase';

/**
 * Gets the next sequence number for a given counter and returns it formatted with the given prefix.
 * Example: getNextSequence('digisilver', 'digisilver') -> 'digisilver001'
 * Example: getNextSequence('gold_value_scheme', 'Gold Value Schemes') -> 'Gold Value Schemes001'
 */
export const getNextSequence = async (counterId: string, prefix: string): Promise<string> => {
  const counterRef = db.collection('counters').doc(counterId);

  try {
    const sequenceNumber = await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(counterRef);
      
      let nextSeq = 1;
      if (doc.exists) {
        nextSeq = (doc.data()?.seq || 0) + 1;
        transaction.update(counterRef, { seq: nextSeq });
      } else {
        transaction.set(counterRef, { seq: nextSeq });
      }
      
      return nextSeq;
    });

    // Pad the sequence with leading zeros (e.g., 001, 002)
    const paddedSeq = sequenceNumber.toString().padStart(3, '0');
    return `${prefix}${paddedSeq}`;
  } catch (error) {
    console.error(`Failed to generate sequence for ${counterId}:`, error);
    // Fallback if transaction fails
    return `${prefix}${Date.now().toString().slice(-4)}`;
  }
};
