import {
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    getDocs,
    query,
    where,
    onSnapshot,
    addDoc,
    serverTimestamp,
    orderBy,
    writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { User, GameRoom, GameSessionState, Character, PoliticalParty, Archetype } from '../types';

// Collection References
const USERS_COLLECTION = 'users';
const ROOMS_COLLECTION = 'rooms';
const SESSIONS_COLLECTION = 'sessions';
const PARTIES_COLLECTION = 'parties';
const ARCHETYPES_COLLECTION = 'archetypes';

// --- USER MANAGEMENT ---

export const getUserByUsername = async (username: string): Promise<User | null> => {
    const q = query(collection(db, USERS_COLLECTION), where("username", "==", username));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return null;

    const userDoc = querySnapshot.docs[0];
    return userDoc.data() as User;
};

export const getUserById = async (userId: string): Promise<User | null> => {
    const docRef = doc(db, USERS_COLLECTION, userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data() as User;
    } else {
        return null;
    }
};

export const createUser = async (user: User): Promise<void> => {
    await setDoc(doc(db, USERS_COLLECTION, user.id), user);
};

export const updateUser = async (user: User): Promise<void> => {
    const userRef = doc(db, USERS_COLLECTION, user.id);
    await updateDoc(userRef, { ...user });
};

export const getAllUsers = async (): Promise<User[]> => {
    const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
    return querySnapshot.docs.map(doc => doc.data() as User);
};

export const updateUserRole = async (userId: string, role: User['role']): Promise<void> => {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, { role });
};

// --- GAME ROOM MANAGEMENT ---

export const subscribeToRooms = (callback: (rooms: GameRoom[]) => void) => {
    const q = query(collection(db, ROOMS_COLLECTION), orderBy("createdAt", "desc"));

    return onSnapshot(q, (snapshot) => {
        const rooms: GameRoom[] = [];
        snapshot.forEach((doc) => {
            rooms.push(doc.data() as GameRoom);
        });
        callback(rooms);
    });
};

export const createGameRoom = async (room: GameRoom): Promise<void> => {
    // We use setDoc with the room.id which we already generated client-side
    // Alternatively we could use addDoc and let Firestore gen the ID, but our types use ID for rendering
    await setDoc(doc(db, ROOMS_COLLECTION, room.id), {
        ...room,
        createdAt: serverTimestamp() // Add timestamp for sorting
    });
};

export const updateGameRoomStatus = async (roomId: string, status: GameRoom['status'], playersCount?: number) => {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    const updates: any = { status };
    if (playersCount !== undefined) {
        updates.players = playersCount;
    }
    await updateDoc(roomRef, updates);
};

export const getGameRoom = async (roomId: string): Promise<GameRoom | null> => {
    const docRef = doc(db, ROOMS_COLLECTION, roomId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data() as GameRoom;
    }
    return null;
};

// --- GAME SESSION MANAGEMENT ---

export const getGameSession = async (roomId: string): Promise<GameSessionState | null> => {
    const docRef = doc(db, SESSIONS_COLLECTION, roomId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data() as GameSessionState;
    }
    return null;
};

export const saveGameSession = async (session: GameSessionState): Promise<void> => {
    await setDoc(doc(db, SESSIONS_COLLECTION, session.roomId), session);
};

export const subscribeToSession = (roomId: string, callback: (session: GameSessionState | null) => void) => {
    return onSnapshot(doc(db, SESSIONS_COLLECTION, roomId), (doc) => {
        if (doc.exists()) {
            callback(doc.data() as GameSessionState);
        } else {
            callback(null);
        }
    });
};

// --- STATIC DATA / SEEDING ---

export const seedParties = async (parties: PoliticalParty[]) => {
    const batch = writeBatch(db);

    // Checking if parties exist first to avoid overwrite loops if deemed necessary, 
    // but for seeding we can just overwrite or check count.
    const snapshot = await getDocs(collection(db, PARTIES_COLLECTION));
    if (snapshot.empty) {
        console.log("Seeding parties...");
        for (const party of parties) {
            batch.set(doc(db, PARTIES_COLLECTION, party.id), party);
        }
        await batch.commit();
    }
};

export const getStoredParties = async (): Promise<PoliticalParty[]> => {
    const snapshot = await getDocs(collection(db, PARTIES_COLLECTION));
    return snapshot.docs.map(doc => doc.data() as PoliticalParty);
};
