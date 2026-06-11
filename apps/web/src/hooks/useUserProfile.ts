import { useEffect, useState } from 'react';
import {
  getUserProfileSync,
  profileStorageKey,
  profileUpdatedEventName,
  updateUserProfile,
  type UserProfile
} from '../api/usersApi';

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(() => getUserProfileSync());

  useEffect(() => {
    function refreshProfile() {
      setProfile(getUserProfileSync());
    }

    function handleStorage(event: StorageEvent) {
      if (event.key === profileStorageKey) {
        refreshProfile();
      }
    }

    window.addEventListener(profileUpdatedEventName, refreshProfile);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(profileUpdatedEventName, refreshProfile);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  async function saveProfile(nextProfile: UserProfile) {
    const saved = await updateUserProfile(nextProfile);
    setProfile(saved);
    return saved;
  }

  return { profile, saveProfile };
}
