import { createContext, useContext, useState, useEffect } from 'react'
import * as labAPI from '../pages/lab/labRequests'

const LabDataContext = createContext()

export const LabDataProvider = ({ children }) => {
  const [labRequests, setLabRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Technicians state (can be moved to backend later)
  const [technicians, setTechnicians] = useState([
    { id: 1, name: 'John Smith', specialization: 'EMC Testing', status: 'Available' },
    { id: 2, name: 'Aditya Kumar Sahu', specialization: 'Safety Testing', status: 'Busy' },
    { id: 3, name: 'Mike Davis', specialization: 'Thermal Testing', status: 'Available' },
    { id: 4, name: 'Emily Chen', specialization: 'EMC Testing', status: 'Available' },
  ])

  // Schedule state (can be moved to backend later)
  const [schedule, setSchedule] = useState([])

  // Fetch lab requests from backend
  const fetchRequests = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await labAPI.fetchLabRequests()
      
      console.log('Fetched lab requests:', data)
      
      // Transform backend data to frontend format
      const transformedData = data.map(req => ({
        id: req.request_code || `LR-${String(req.id).padStart(4, '0')}`,
        backendId: req.id,
        productName: req.product_name,
        service: req.service_type,
        date: req.created_date ? new Date(req.created_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        status: req.status,
        assignedTo: req.assigned_engineer_id || null,
        priority: 'Normal', // Default, can be added to backend
        progress: 0, // Will be fetched from full request if needed
      }))
      
      console.log('Transformed lab requests:', transformedData)
      setLabRequests(transformedData)
    } catch (err) {
      console.error('Error fetching lab requests:', err)
      setError(err.message || 'Failed to fetch lab requests')
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchRequests()
  }, [])

  // Create new lab request
  const createRequest = async (productName, serviceType) => {
    try {
      const newRequest = await labAPI.createLabRequest(productName, serviceType)
      console.log('Created lab request:', newRequest)
      await fetchRequests() // Refresh the list
      return newRequest
    } catch (err) {
      console.error('Error creating lab request:', err)
      throw err
    }
  }

  // Update request status
  const updateRequestStatus = async (id, newStatus, additionalData = {}) => {
    try {
      const request = labRequests.find(r => r.id === id || r.backendId === id)
      if (!request) throw new Error('Request not found')

      const userId = 'system' // Replace with actual user ID from auth context
      const result = await labAPI.updateStatus(request.backendId, newStatus, userId)
      
      console.log('Status updated:', result)
      
      // Update local state
      setLabRequests(labRequests.map(r => 
        r.id === id || r.backendId === id ? { ...r, status: newStatus, ...additionalData } : r
      ))
      
      return result
    } catch (err) {
      console.error('Error updating status:', err)
      throw err
    }
  }

  // Update request progress
  const updateRequestProgress = async (id, progress, notes = '') => {
    try {
      const request = labRequests.find(r => r.id === id || r.backendId === id)
      if (!request) throw new Error('Request not found')

      const userId = 'system' // Replace with actual user ID from auth context
      const result = await labAPI.addProgress(request.backendId, progress, notes, userId)
      
      console.log('Progress updated:', result)
      
      // Update local state
      setLabRequests(labRequests.map(r => 
        r.id === id || r.backendId === id ? { ...r, progress } : r
      ))
      
      return result
    } catch (err) {
      console.error('Error updating progress:', err)
      throw err
    }
  }

  // Assign request to technician
  const assignRequest = async (requestId, technicianId) => {
    try {
      const request = labRequests.find(r => r.id === requestId || r.backendId === requestId)
      if (!request) throw new Error('Request not found')

      const technician = technicians.find(t => t.id === technicianId)
      if (!technician) throw new Error('Technician not found')

      const userId = 'system' // Replace with actual user ID from auth context
      const result = await labAPI.assignEngineer(request.backendId, technicianId, userId)

      console.log('Engineer assigned:', result)

      // Update local state
      setLabRequests(labRequests.map(r =>
        r.id === requestId || r.backendId === requestId ? {
          ...r,
          assignedTo: technicianId,
          status: 'In Progress',
          progress: 10,
        } : r
      ))

      // Update technician status
      if (technician.status === 'Available') {
        setTechnicians(technicians.map(t =>
          t.id === technicianId ? { ...t, status: 'Busy' } : t
        ))
      }
      
      return result
    } catch (err) {
      console.error('Error assigning request:', err)
      throw err
    }
  }

  // Get full request details
  const getFullRequest = async (id) => {
    try {
      const request = labRequests.find(r => r.id === id || r.backendId === id)
      if (!request) {
        // If not found in local state, try to fetch directly by ID
        const fullData = await labAPI.fetchFullRequest(id)
        return fullData
      }

      const fullData = await labAPI.fetchFullRequest(request.backendId)
      return fullData
    } catch (err) {
      console.error('Error fetching full request:', err)
      throw err
    }
  }

  // Create schedule
  const addScheduleItem = async (item) => {
    try {
      const request = labRequests.find(r => r.id === item.requestId || r.backendId === item.requestId)
      if (!request) throw new Error('Request not found')

      const payload = {
        engineer_id: item.technicianId,
        start_datetime: item.startTime,
        end_datetime: item.endTime,
        schedule_status: item.status || 'Scheduled',
      }

      const result = await labAPI.createSchedule(request.backendId, payload)
      
      console.log('Schedule created:', result)
      
      // Update local schedule state
      const newItem = {
        ...item,
        id: `SCH-${String(schedule.length + 1).padStart(3, '0')}`,
      }
      setSchedule([...schedule, newItem])
      return newItem
    } catch (err) {
      console.error('Error creating schedule:', err)
      throw err
    }
  }

  // Update schedule item (local only for now)
  const updateScheduleItem = (id, updates) => {
    setSchedule(schedule.map(s => s.id === id ? { ...s, ...updates } : s))
  }

  // Delete schedule item (local only for now)
  const deleteScheduleItem = (id) => {
    setSchedule(schedule.filter(s => s.id !== id))
  }

  // Update request (generic)
  const updateRequest = (id, updates) => {
    setLabRequests(labRequests.map(r => 
      r.id === id || r.backendId === id ? { ...r, ...updates } : r
    ))
  }

  // Statistics
  const getStats = () => {
    const pending = labRequests.filter(r => r.status === 'Pending').length
    const inProgress = labRequests.filter(r => r.status === 'In Progress').length
    const completedThisWeek = labRequests.filter(r => {
      if (r.status !== 'Completed' || !r.completedAt) return false
      const completedDate = new Date(r.completedAt)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return completedDate >= weekAgo
    }).length

    // Calculate average turnaround time
    const completedRequests = labRequests.filter(r => r.status === 'Completed' && r.completedAt && r.date)
    const avgTurnaround = completedRequests.length > 0
      ? completedRequests.reduce((sum, r) => {
          const start = new Date(r.date)
          const end = new Date(r.completedAt)
          const days = (end - start) / (1000 * 60 * 60 * 24)
          return sum + days
        }, 0) / completedRequests.length
      : 0

    return {
      pending,
      activeTests: inProgress,
      completedThisWeek,
      avgTurnaround: avgTurnaround > 0 ? avgTurnaround.toFixed(1) + 'd' : '0d',
    }
  }

  const value = {
    labRequests,
    technicians,
    schedule,
    loading,
    error,
    setLabRequests,
    setTechnicians,
    setSchedule,
    fetchRequests,
    createRequest,
    updateRequest,
    assignRequest,
    updateRequestStatus,
    updateRequestProgress,
    addScheduleItem,
    updateScheduleItem,
    deleteScheduleItem,
    getFullRequest,
    getStats,
  }

  return <LabDataContext.Provider value={value}>{children}</LabDataContext.Provider>
}

export const useLabData = () => {
  const context = useContext(LabDataContext)
  if (!context) {
    throw new Error('useLabData must be used within LabDataProvider')
  }
  return context
}