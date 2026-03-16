export interface SavedTutor {
  id: string;
  name: string;
  subject: string;
  price: number;
  photo: string;
}

const STORAGE_KEY = "learneazy-saved-tutors";
const UPDATE_EVENT = "learneazy-saved-tutors-updated";

function isBrowser() {
  return typeof window !== "undefined";
}

function emitUpdate() {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
}

export function getSavedTutors(): SavedTutor[] {
  if (!isBrowser()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedTutor[]) : [];
  } catch {
    return [];
  }
}

function setSavedTutors(tutors: SavedTutor[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tutors));
  emitUpdate();
}

export function isTutorSaved(id: string) {
  return getSavedTutors().some((tutor) => tutor.id === id);
}

export function toggleSavedTutor(tutor: SavedTutor) {
  const tutors = getSavedTutors();
  const exists = tutors.some((item) => item.id === tutor.id);
  const next = exists ? tutors.filter((item) => item.id !== tutor.id) : [tutor, ...tutors];
  setSavedTutors(next);
  return !exists;
}

export function removeSavedTutor(id: string) {
  const next = getSavedTutors().filter((tutor) => tutor.id !== id);
  setSavedTutors(next);
}

export function subscribeToSavedTutors(listener: () => void) {
  if (!isBrowser()) return () => undefined;

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(UPDATE_EVENT, listener as EventListener);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(UPDATE_EVENT, listener as EventListener);
  };
}
