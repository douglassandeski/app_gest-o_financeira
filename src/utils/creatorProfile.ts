import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const CREATOR_PROFILE_DOC = 'creator_profile';
const CREATOR_STORAGE_KEY = 'douglas_custom_photo';

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
  bio: 'Idealizador e desenvolvedor do sistema de Gestão Financeira. Curso superior de Ciências Econômicas em andamento e tecnólogo em Tecnologia da Informação e Comunicação.',
  education: 'Curso Superior de Economia em Andamento • Tecnólogo em TI e Comunicação',
  career: '',
};

// Immediate cleanup of any old Google profile URL stored in localStorage
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem(CREATOR_STORAGE_KEY);
    if (saved && (saved.includes('googleusercontent') || saved.includes('http'))) {
      localStorage.removeItem(CREATOR_STORAGE_KEY);
    }
  } catch {
    // Ignore storage access error
  }
}

// Resets/ensures creator photo in Firestore is NEVER contaminated with any Google account photo
export async function ensureCreatorPhotoClean(isLoggedInUser?: boolean) {
  try {
    if (!isLoggedInUser) return;
    const ref = doc(db, 'public_config', CREATOR_PROFILE_DOC);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const currentUrl = snap.data()?.photoUrl;
      // If it has a Google profile URL (googleusercontent), immediately wipe it back to /creator-photo.jpg
      if (typeof currentUrl === 'string' && currentUrl.includes('googleusercontent.com')) {
        await setDoc(
          ref,
          {
            name: 'Douglas Sandeski',
            photoUrl: '/creator-photo.jpg',
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }
    }
  } catch {
    // Ignore permissions/network errors
  }
}

// Fetch fixed creator photo - always returns Douglas's actual attached photo
export async function getFixedCreatorPhoto(): Promise<string> {
  try {
    // Check if there is a custom base64 photo in localStorage (only if uploaded)
    const localPhoto = localStorage.getItem(CREATOR_STORAGE_KEY);
    if (localPhoto && localPhoto.startsWith('data:image')) {
      return localPhoto;
    }

    // Check Firestore public config, only accepting valid non-google creator URLs
    const ref = doc(db, 'public_config', CREATOR_PROFILE_DOC);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const url = snap.data()?.photoUrl;
      if (typeof url === 'string' && !url.includes('googleusercontent.com') && (url.startsWith('/creator-photo') || url.startsWith('data:image'))) {
        return url;
      }
    }
  } catch {
    // Fallback directly to physical asset
  }

  // The permanent physical asset of Douglas Sandeski
  return '/creator-photo.jpg';
}
