import { db } from '../firebase'
import { ref as dbRef, set, get, onValue } from 'firebase/database'
import { ref } from 'vue'

// Tworzymy współdzielony stan
const topicsState = ref([])

console.log('Initializing topics.js module')

// Przenosimy extractTopics na poziom modułu
const extractTopics = (data) => {
  console.log('Extracting topics from:', data)
  if (Array.isArray(data)) {
    console.log('Data is an array')
    return data
  }
  if (data && typeof data === 'object') {
    console.log('Data is an object')
    if (data.topics && Array.isArray(data.topics)) {
      console.log('Found topics array in data object')
      return data.topics
    }
    // Jeśli to obiekt z kluczami numerycznymi (Firebase array-like object)
    const values = Object.values(data)
    if (values.length > 0 && values.every(v => typeof v === 'string')) {
      console.log('Found array-like object with string values')
      return values
    }
  }
  console.warn('Unexpected data structure:', data)
  return []
}

export const useTopics = () => {
  console.log('useTopics hook called')

  const loadTopics = async () => {
    console.log('loadTopics called')
    try {
      const topicsRef = dbRef(db, 'topics')
      const snapshot = await get(topicsRef)
      console.log('Raw Firebase response:', snapshot.val())
      
      if (!snapshot.exists()) {
        console.log('No topics found in Firebase')
        topicsState.value = []
        return []
      }

      const extractedTopics = extractTopics(snapshot.val())
      console.log('Extracted topics:', extractedTopics)
      console.log('Setting topicsState.value to:', extractedTopics)
      topicsState.value = [...extractedTopics]
      return extractedTopics
    } catch (error) {
      console.error('Error loading topics:', error)
      topicsState.value = []
      return []
    }
  }

  const saveTopics = async (topics) => {
    console.log('saveTopics called with:', topics)
    try {
      const topicsRef = dbRef(db, 'topics')
      await set(topicsRef, { topics })
      console.log('Setting topicsState.value in saveTopics to:', topics)
      topicsState.value = [...topics]
      console.log('Topics saved successfully')
    } catch (error) {
      console.error('Error saving topics:', error)
    }
  }

  // Nasłuchuj na zmiany
  const setupTopicsListener = () => {
    console.log('setupTopicsListener called')
    const topicsRef = dbRef(db, 'topics')
    onValue(topicsRef, (snapshot) => {
      const data = snapshot.val()
      console.log('Topics updated in Firebase:', data)
      const extractedTopics = extractTopics(data)
      console.log('Setting topicsState.value in listener to:', extractedTopics)
      topicsState.value = [...extractedTopics]
    })
  }

  return {
    topics: topicsState,
    loadTopics,
    saveTopics,
    setupTopicsListener
  }
}

export const initializeDefaultTopics = async () => {
  console.log('initializeDefaultTopics called')
  try {
    const topicsRef = dbRef(db, 'topics')
    const snapshot = await get(topicsRef)
    
    if (!snapshot.exists()) {
      console.log('No topics found, initializing default topics...')
      const defaultTopics = [
        "Zalegalizowanie marihuany",
        "Dopuszczalność aborcji",
        "Eutanazja i prawo do śmierci",
        "Małżeństwa osób tej samej płci",
        "Kary cielesne wobec dzieci",
        "Kara śmierci",
        "Obowiązkowe szczepienia",
        "Ograniczenie wolności słowa w imię walki z mową nienawiści"
      ]
      await set(topicsRef, { topics: defaultTopics })
      console.log('Setting topicsState.value in initializeDefaultTopics to:', defaultTopics)
      topicsState.value = [...defaultTopics]
      console.log('Default topics initialized')
    } else {
      const extractedTopics = extractTopics(snapshot.val())
      console.log('Setting topicsState.value in initializeDefaultTopics (existing) to:', extractedTopics)
      topicsState.value = [...extractedTopics]
    }
  } catch (error) {
    console.error('Error initializing default topics:', error)
  }
} 