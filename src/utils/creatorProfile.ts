import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const CREATOR_PROFILE_DOC = 'creator_profile';
const CREATOR_STORAGE_KEY = 'douglas_custom_photo';
const DEFAULT_AVATAR = '/creator-avatar.svg';

export interface CreatorProfile {
  name: string;
  photoUrl: string;
  role: string;
  bio: string;
  education: string;
  career: string;
}

export const DEFAULT_CREATOR_INFO: CreatorProfile = {
  name: 'Douglas Sandeski',
  photoUrl: '/creator-photo.jpg',
  role: 'Criador & Desenvolvedor',
  bio: 'Economista formado pela Unioeste Cascavel e pós/graduando em Tecnologia da Informação e Comunicação pela UEPG.',
  education: 'Ciências Econômicas (Unioeste Cascavel) • TIC (UEPG)',
  career: 'Sicredi Guaraniaçu',
};

// Sync locally cached photo to server file disk and firestore so all users/APK get it permanently
export async function syncCreatorPhotoToServerAndFirestore(userEmail?: string | null, userPhoto?: string | null) {
  try {
    const localPhoto = localStorage.getItem(CREATOR_STORAGE_KEY);
    const photoToSync = localPhoto || (userEmail?.toLowerCase().includes('douglas.sandeski') ? userPhoto : null);

    if (photoToSync) {
      // 1. Send to server file persistence (Vite middleware saves to public/creator-photo.jpg & public/eu.jpeg)
      if (photoToSync.startsWith('data:image')) {
        fetch('/api/save-creator-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: photoToSync }),
        }).catch(() => {});
      }

      // 2. Persist in Firestore public_config for global access by all users & APK
      try {
        const ref = doc(db, 'public_config', CREATOR_PROFILE_DOC);
        await setDoc(
          ref,
          {
            name: 'Douglas Sandeski',
            photoUrl: photoToSync,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch {
        // May require auth depending on rules
      }
    }
  } catch (err) {
    console.warn('Silent creator sync error:', err);
  }
}

// Fetch fixed creator photo
export async function getFixedCreatorPhoto(): Promise<string> {
  // 1. Check Firestore public config first (shared globally across all devices & APK)
  try {
    const ref = doc(db, 'public_config', CREATOR_PROFILE_DOC);
    const snap = await getDoc(ref);
    if (snap.exists() && snap.data()?.photoUrl) {
      return snap.data().photoUrl as string;
    }
  } catch {
    // Continue to next fallbacks
  }

  // 2. Check locally stored photo from upload
  const localPhoto = localStorage.getItem(CREATOR_STORAGE_KEY);
  if (localPhoto) {
    return localPhoto;
  }

  // 3. Check physical file asset
  return '/creator-photo.jpg';
}
