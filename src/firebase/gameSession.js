import { db } from '../firebase'
import { ref as dbRef, set, get } from 'firebase/database'

export const createGameSession = async () => {
  const sessionId = Math.random().toString(36).substring(2, 15)
  const sessionRef = dbRef(db, `sessions/${sessionId}`)
  
  await set(sessionRef, {
    createdAt: Date.now(),
    status: 'waiting',
    currentQuestion: null,
    votes: {},
    deputies: {}
  })
  
  return sessionId
}

export const getGameSession = async (sessionId) => {
  const sessionRef = dbRef(db, `sessions/${sessionId}`)
  const snapshot = await get(sessionRef)
  return snapshot.val()
}

export const updateGameSession = async (sessionId, data) => {
  const sessionRef = dbRef(db, `sessions/${sessionId}`)
  await set(sessionRef, data)
} 