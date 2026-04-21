import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import {
  enableIndexedDbPersistence,
  enableMultiTabIndexedDbPersistence,
  getFirestore,
} from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyDdb1-1F5Vtd9KAaxO3JrmS-Nr9GwWaS8M",
  authDomain: "finsight-web.firebaseapp.com",
  projectId: "finsight-web",
  storageBucket: "finsight-web.firebasestorage.app",
  messagingSenderId: "792812376072",
  appId: "1:792812376072:web:279393f403e32be95281bd",
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const provider = new GoogleAuthProvider()
export const db = getFirestore(app)

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
