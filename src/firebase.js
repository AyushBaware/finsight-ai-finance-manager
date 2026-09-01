import { initializeApp } from "firebase/app"
import { showToast } from "./utils/toastStore"
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously,
} from "firebase/auth"
import {
  enableIndexedDbPersistence,
  enableMultiTabIndexedDbPersistence,
  getFirestore,
} from "firebase/firestore"

// ── Firebase config now comes from environment variables ──────────────────
// Never hardcode these values here. Set them in your local .env file
// (see .env.example) and in your Vercel/Netlify dashboard for production.
// Vite only exposes variables prefixed with VITE_ to client-side code.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Fail loudly in development if someone forgot to set up .env — this saves
// you from a confusing "Firebase: Error (auth/invalid-api-key)" later.
if (import.meta.env.DEV) {
  const missing = Object.entries(firebaseConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key)

  if (missing.length > 0) {
    console.error(
      `[firebase.js] Missing environment variables: ${missing.join(", ")}.\n` +
        "Did you create a .env file from .env.example and restart the dev server?",
    )
  }
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const provider = new GoogleAuthProvider()
export const db = getFirestore(app)

// ── Anonymous-first auth bootstrap ─────────────────────────────────────
// Every device gets a real (anonymous) Firebase user on first load, with
// no visible sign-in screen and no separate "Guest Mode" data path.
// Because an anonymous user already has a Firestore-legal uid, their
// expenses can be written straight to Firestore like any signed-in
// user's — dataService.js's existing "if (user) { cloud } else { local }"
// branches already do the right thing here with zero changes, since
// auth.currentUser is now populated almost immediately, even for guests.
//
// Signing out returns a user to a fresh anonymous session automatically
// (see the listener below) — there is deliberately no "logged out" state
// in this app; there's only "anonymous" and "signed in."
export const isAnonymousUser = (user) => Boolean(user?.isAnonymous)

if (typeof window !== "undefined") {
  onAuthStateChanged(auth, (user) => {
    if (user) return

    signInAnonymously(auth).catch((error) => {
      console.error("[firebase.js] Anonymous sign-in failed", error)
      // Non-fatal: dataService.js falls back to localStorage whenever
      // auth.currentUser is null, so the app still works offline/locally
      // if this fails (e.g. no network on very first load). Still worth
      // surfacing — a silent failure here means cross-device sync quietly
      // never happens and no one notices until data "disappears."
      showToast(
        "Could not start a session. Your data will be saved on this device only.",
        "warning",
        6000,
      )
    })
  })
}

export const FIRESTORE_PERSISTENCE_EVENT = "firestorePersistenceChanged"

let persistenceState = {
  attempted: false,
  enabled: false,
  mode: "memory",
  errorCode: null,
  message: "",
}

const updatePersistenceState = (updates) => {
  persistenceState = {
    ...persistenceState,
    ...updates,
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(FIRESTORE_PERSISTENCE_EVENT, {
        detail: persistenceState,
      }),
    )
  }
}

export const getFirestorePersistenceState = () => persistenceState

export const subscribeToFirestorePersistenceState = (listener) => {
  if (typeof listener !== "function") {
    return () => {}
  }

  listener(persistenceState)

  if (typeof window === "undefined") {
    return () => {}
  }

  const handleChange = (event) => {
    listener(event.detail ?? persistenceState)
  }

  window.addEventListener(FIRESTORE_PERSISTENCE_EVENT, handleChange)

  return () => {
    window.removeEventListener(FIRESTORE_PERSISTENCE_EVENT, handleChange)
  }
}

if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db)
    .then(() => {
      updatePersistenceState({
        attempted: true,
        enabled: true,
        mode: "indexeddb",
        errorCode: null,
        message: "",
      })
    })
    .catch((error) => {
      const code = String(error?.code || "").replace("firestore/", "")

      if (code === "failed-precondition") {
        enableMultiTabIndexedDbPersistence(db)
          .then(() => {
            updatePersistenceState({
              attempted: true,
              enabled: true,
              mode: "multi-tab",
              errorCode: null,
              message: "",
            })
          })
          .catch((multiTabError) => {
            const multiTabCode = String(multiTabError?.code || "").replace("firestore/", "")

            console.warn("Firestore persistence could not be enabled.", multiTabError)
            updatePersistenceState({
              attempted: true,
              enabled: false,
              mode: "memory",
              errorCode: multiTabCode || code || "failed-precondition",
              message:
                multiTabCode === "failed-precondition"
                  ? "Offline caching is unavailable in this tab because another session already owns it."
                  : "Offline caching is unavailable in this browser session.",
            })
          })

        return
      }

      console.warn("Firestore persistence could not be enabled.", error)
      updatePersistenceState({
        attempted: true,
        enabled: false,
        mode: "memory",
        errorCode: code || null,
        message:
          code === "unimplemented"
            ? "Offline caching is not supported in this browser."
            : "Offline caching is unavailable in this browser session.",
      })
    })
}