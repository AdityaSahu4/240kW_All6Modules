import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLabData } from '../../contexts/LabDataContext'
import { Search, Filter, User, UserPlus } from 'lucide-react'
 
function LabQueue() {
  const [searchParams] = useSearchParams()
  const { labRequests, technicians, assignRequest } = useLabData()
 
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [selectedTechnician, setSelectedTechnician] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
 
  const [assigningRequest, setAssigningRequest] = useState(null)
  const [assignTech, setAssignTech] = useState('')
 
  // Initialize search from URL params
  useEffect(() => {
    const urlSearch = searchParams.get('search')
    if (urlSearch) {
      setSearchTerm(urlSearch)
    }
  }, [searchParams])
 
  // Filter requests (NO PRIORITY)
  const filteredRequests = labRequests.filter(request => {
    const matchesSearch =
      request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.service.toLowerCase().includes(searchTerm.toLowerCase())
 
    const matchesTechnician =
      selectedTechnician === 'all' ||
      request.assignedTo === selectedTechnician ||
      (!request.assignedTo && selectedTechnician === 'unassigned')
 
    const matchesStatus =
      selectedStatus === 'all' || request.status === selectedStatus
 
    return matchesSearch && matchesTechnician && matchesStatus
  })
 
  const handleAssign = (requestId) => {
    if (!assignTech) {
      alert('Please select a technician')
      return
    }
    assignRequest(requestId, assignTech)
    setAssigningRequest(null)
    setAssignTech('')
    alert('Request assigned successfully!')
  }
 
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-700'
      case 'In Progress':
        return 'bg-blue-100 text-blue-700'
      case 'Rejected':
        return 'bg-red-100 text-red-700'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }
 
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Lab Queue</h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>
 
      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, product, or service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
 
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="grid md:grid-cols-2 gap-4 pt-4 border-t"
          >
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Technician</label>
              <select
                value={selectedTechnician}
                onChange={(e) => setSelectedTechnician(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Technicians</option>
                <option value="unassigned">Unassigned</option>
                {technicians.map(tech => (
                  <option key={tech.id} value={tech.id}>
                    {tech.name} ({tech.id})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </motion.div>
        )}
      </div>
 
      {/* Queue Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="font-semibold">
            Queue ({filteredRequests.length} requests)
          </div>
        </div>
 
        {filteredRequests.length > 0 ? (
          <div className="divide-y">
            {filteredRequests.map((request, idx) => {
              const assignedTech = technicians.find(
                t => t.id === request.assignedTo
              )
 
              return (
                <Link key={request.id} to={`/lab/queue/${request.id}`}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="px-6 py-4 grid grid-cols-11 items-center hover:bg-gray-50 transition-colors cursor-pointer group"
                  >
                    <div className="col-span-2">
                      <span className="text-primary font-medium group-hover:underline">
                        {request.id}
                      </span>
                    </div>
 
                    <div className="col-span-4 font-medium">
                      {request.productName}
                    </div>
 
                    <div className="col-span-3 text-gray-600">
                      {request.service}
                    </div>
 
                    <div className="col-span-1">
                      <span className={`text-xs px-2 py-1 rounded ${getStatusBadge(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
 
                    <div className="col-span-1 flex items-center gap-2">
                      {assignedTech ? (
                        <div className="flex items-center gap-1 text-gray-600 text-sm">
                          <User className="w-4 h-4" />
                          <span>{assignedTech.id}</span>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setAssigningRequest(request.id)
                            setAssignTech('')
                          }}
                          className="text-primary hover:text-primary-dark flex items-center gap-1 text-sm"
                        >
                          <UserPlus className="w-4 h-4" />
                          Assign
                        </button>
                      )}
                    </div>
                  </motion.div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-gray-500">
            No requests found matching your filters
          </div>
        )}
      </div>
 
      {/* Assign Modal */}
      {assigningRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold mb-4">Assign Technician</h3>
 
            <div className="space-y-4">
              <select
                value={assignTech}
                onChange={(e) => setAssignTech(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select a technician</option>
                {technicians.map(tech => (
                  <option key={tech.id} value={tech.id}>
                    {tech.name} ({tech.id}) – {tech.specialization}
                  </option>
                ))}
              </select>
 
              <div className="flex gap-2">
                <button
                  onClick={() => handleAssign(assigningRequest)}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                >
                  Assign
                </button>
                <button
                  onClick={() => setAssigningRequest(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
 
export default LabQueue
 
 