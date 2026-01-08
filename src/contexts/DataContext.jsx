import { createContext, useContext, useState, useEffect } from 'react'

const DataContext = createContext()

export const DataProvider = ({ children }) => {
  // Load data from localStorage or use defaults
  const loadFromStorage = (key, defaultValue) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  }

  const saveToStorage = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }

  // ⚠️ DEPRECATED: Empty arrays for backward compatibility
  // These are NOT used anymore - data comes from backend API
  const [products] = useState([])
  const [orders] = useState([])
  const [documents] = useState([])

  // ✅ KEEP: Messages state (temporary - until backend messaging is ready)
  const [messages, setMessages] = useState(() => loadFromStorage('techlink_messages', [
    {
      id: 'MSG-001',
      from: 'Lab Team',
      subject: 'Test Report Ready',
      body: 'Your test report is now ready for review. Please check the Documents section.',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      read: false,
      type: 'notification',
    },
    {
      id: 'MSG-002',
      from: 'Support Team',
      subject: 'Welcome to Millennium Techlink',
      body: 'Thank you for choosing Millennium Techlink. We are here to help you with all your testing and certification needs.',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      type: 'info',
    },
  ]))

  // ✅ KEEP: Profile state (user personal information)
  const [profile, setProfile] = useState(() => loadFromStorage('techlink_profile', {
    fullName: 'Aditya Kumar Sahu',
    username: 'aditya.sahu',
    gender: 'Male',
    language: 'English',
    companyName: 'TechCorp Industries',
    userId: 'USR-2024-001',
    country: 'United States',
    address: 'Millennium Techlink Private Limited, 17/18/19, 2nd Floor, Mahalaxmi Heights, Mumbai-Pune Road, Pimpri, Pune 411 018, Maharashtra, INDIA',
    phone: '+1 (555) 123-4567',
    email: 'aditya.sahu@techcorp.com',
    designation: 'Senior Engineer',
    membershipLevel: 'Premium',
    industry: 'Technology',
    accountType: 'Business',
    emailAddresses: [
      { email: 'aditya.sahu@techcorp.com', verified: true, addedAt: '1 month ago' }
    ],
    profileImage: null
  }))

  // ✅ KEEP: Settings state (user preferences)
  const [settings, setSettings] = useState(() => loadFromStorage('techlink_settings', {
    notifications: true,
    darkMode: false,
    emailUpdates: true,
    smsNotifications: false,
  }))

  // Save to localStorage whenever state changes
  useEffect(() => {
    saveToStorage('techlink_messages', messages)
  }, [messages])

  useEffect(() => {
    saveToStorage('techlink_profile', profile)
  }, [profile])

  useEffect(() => {
    saveToStorage('techlink_settings', settings)
  }, [settings])

  // Message functions
  const addMessage = (message) => {
    const newMessage = {
      ...message,
      id: `MSG-${String(messages.length + 1).padStart(3, '0')}`,
      timestamp: new Date().toISOString(),
      read: false,
    }
    setMessages([newMessage, ...messages])
    return newMessage
  }

  const markMessageAsRead = (id) => {
    setMessages(messages.map(m => m.id === id ? { ...m, read: true } : m))
  }

  const deleteMessage = (id) => {
    setMessages(messages.filter(m => m.id !== id))
  }

  // ⚠️ DEPRECATED: Dummy functions for backward compatibility
  const addProduct = () => console.warn('addProduct is deprecated - use backend API')
  const updateProduct = () => console.warn('updateProduct is deprecated - use backend API')
  const deleteProduct = () => console.warn('deleteProduct is deprecated - use backend API')
  const addOrder = () => console.warn('addOrder is deprecated - use backend API')
  const addDocument = () => console.warn('addDocument is deprecated - use backend API')
  const deleteDocument = () => console.warn('deleteDocument is deprecated - use backend API')

  const value = {
    // ⚠️ DEPRECATED: Empty arrays for backward compatibility
    products,
    orders,
    documents,
    setProducts: () => {},
    setOrders: () => {},
    setDocuments: () => {},
    addProduct,
    updateProduct,
    deleteProduct,
    addOrder,
    addDocument,
    deleteDocument,
    
    // ✅ Active: Messages (temporary)
    messages,
    setMessages,
    addMessage,
    markMessageAsRead,
    deleteMessage,
    
    // ✅ Active: Profile
    profile,
    setProfile,
    
    // ✅ Active: Settings
    settings,
    setSettings,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within DataProvider')
  }
  return context
}