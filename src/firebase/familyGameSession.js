import { db } from '../firebase'
import { ref as dbRef, set, get, onValue } from 'firebase/database'

export const createFamilyGameSession = async (config) => {
  const sessionId = Math.random().toString(36).substring(2, 15)
  const sessionRef = dbRef(db, `familySessions/${sessionId}`)
  
  const sessionData = {
    createdAt: Date.now(),
    status: 'active',
    config: {
      team1Name: config.team1Name,
      team2Name: config.team2Name,
      questionsData: config.questionsData,
      randomizeQuestions: config.randomizeQuestions,
      autoIncreaseMultiplier: config.autoIncreaseMultiplier,
      gameEndCondition: config.gameEndCondition,
      gameEndLimit: config.gameEndLimit,
      showKeyboardHints: config.showKeyboardHints
    },
    state: {
      currentQuestion: '',
      question: '',
      results: [],
      round: 1,
      currentPoints: 0,
      activeTeam: null,
      currentQuestionIndex: 0,
      multiplierPoints: 1,
      team1Loss: 0,
      team2Loss: 0,
      team1Name: config.team1Name,
      team2Name: config.team2Name
    }
  }
  
  await set(sessionRef, sessionData)
  
  return sessionId
}

export const getFamilyGameSession = async (sessionId) => {
  const sessionRef = dbRef(db, `familySessions/${sessionId}`)
  const snapshot = await get(sessionRef)
  return snapshot.val()
}

export const updateFamilyGameState = async (sessionId, state) => {
  const stateRef = dbRef(db, `familySessions/${sessionId}/state`)
  await set(stateRef, state)
}

export const sendFamilyGameAction = async (sessionId, action) => {
  const actionId = Date.now().toString()
  await set(dbRef(db, `familySessions/${sessionId}/actions/${actionId}`), {
    action: action,
    timestamp: Date.now()
  })
  
  // Usuń akcję po 1 sekundzie (tylko do synchronizacji)
  setTimeout(() => {
    set(dbRef(db, `familySessions/${sessionId}/actions/${actionId}`), null)
  }, 1000)
}

export const setupFamilyGameStateListener = (sessionId, callback) => {
  const stateRef = dbRef(db, `familySessions/${sessionId}/state`)
  
  const unsubscribe = onValue(stateRef, (snapshot) => {
    const state = snapshot.val()
    if (state) {
      callback(state)
    }
  })
  
  return unsubscribe
}

export const setupFamilyGameActionListener = (sessionId, callback) => {
  const actionsRef = dbRef(db, `familySessions/${sessionId}/actions`)
  
  const unsubscribe = onValue(actionsRef, (snapshot) => {
    const actions = snapshot.val()
    if (actions) {
      // Pobierz najnowszą akcję
      const actionEntries = Object.entries(actions)
      if (actionEntries.length > 0) {
        const latestAction = actionEntries[actionEntries.length - 1][1]
        callback(latestAction.action)
      }
    }
  })
  
  return unsubscribe
}

