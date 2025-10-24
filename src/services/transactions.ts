import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

export type Tx = { id?: string; amount: number; category: 'income'|'expense'; note?: string; date: string };

export async function listTx(uid: string) {
  const q = query(collection(db, 'users', uid, 'transactions'), orderBy('date', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Tx,'id'>) }));
}

export async function addTx(uid: string, tx: Omit<Tx,'id'>) {
  const col = collection(db, 'users', uid, 'transactions');
  const ref = await addDoc(col, tx);
  return { id: ref.id, ...tx };
}

export async function removeTx(uid: string, id: string) {
  await deleteDoc(doc(db, 'users', uid, 'transactions', id));
}
