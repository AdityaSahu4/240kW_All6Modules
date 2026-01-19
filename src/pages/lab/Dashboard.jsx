import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLabData } from '../../contexts/LabDataContext'
import { Clock, CheckCircle2, XCircle, AlertCircle, TrendingUp, Eye, Loader2, RefreshCw } from 'lucide-react'
import { useState } from 'react'

function LabDashboard() {
  const { labRequests, loading, error, getStats, fetchRequests } = useLabData()
  const [refreshing, setRefreshing] = useState(false)
  const stats = getStats()

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await fetchRequests()
    } finally {
      setRefreshing(false)
    }
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 className="w-4 h-4" />
      case 'In Progress':
        return <Clock className="w-4 h-4" />
      case 'Rejected':
        return <XCircle className="w-4 h-4" />
      case 'Pending':
        return <AlertCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  if (loading && labRequests.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-600">Loading lab requests...</span>
      </div>
    )
  }

  if (error && labRequests.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 mb-1">Error Loading Data</h3>
            <p className="text-red-700 text-sm mb-3">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  const sections = {
    Pending: labRequests.filter(r => r.status === 'Pending'),
    'In Progress': labRequests.filter(r => r.status === 'In Progress'),
    Completed: labRequests.filter(r => r.status === 'Completed'),
    Rejected: labRequests.filter(r => r.status === 'Rejected'),
  }

  const statCards = [
    { label: 'Pending Requests', value: stats.pending, icon: AlertCircle, color: 'text-yellow-600' },
    { label: 'Active Tests', value: stats.activeTests, icon: Clock, color: 'text-blue-600' },
    { label: 'Completed This Week', value: stats.completedThisWeek, icon: CheckCircle2, color: 'text-green-600' },
    { label: 'Avg Turnaround', value: stats.avgTurnaround, icon: TrendingUp, color: 'text-purple-600' },
  ]

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lab Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor and manage lab testing requests</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error Banner (if error exists but we have cached data) */}
      {error && labRequests.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">Unable to refresh data: {error}. Showing cached data.</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="bg-white rounded-xl border border-gray-200 p-6 text-center shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-center mb-2">
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Request Sections */}
      {Object.entries(sections).map(([section, requests]) => (
        <motion.div
          key={section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 overflow-hidden"
        >
          <div className="px-6 py-4 font-semibold text-lg bg-gray-50 border-b flex items-center justify-between">
            <span>{section}</span>
            <span className="text-sm font-normal text-gray-500">({requests.length})</span>
          </div>
          {requests.length > 0 ? (
            <div className="divide-y">
              {requests.map((request, idx) => (
                <Link key={request.backendId || request.id} to={`/lab/queue/${request.backendId || request.id}`}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="px-6 py-4 grid grid-cols-12 items-center hover:bg-gray-50 transition-colors cursor-pointer group"
                  >
                    <div className="col-span-2">
                      <span className="text-primary font-medium group-hover:underline">{request.id}</span>
                    </div>
                    <div className="col-span-3 font-medium">{request.productName}</div>
                    <div className="col-span-3 text-gray-600">{request.service}</div>
                    <div className="col-span-2 text-gray-500 text-sm">{request.date}</div>
                    <div className="col-span-2 flex items-center justify-end gap-2">
                      <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${getStatusBadge(request.status)}`}>
                        {getStatusIcon(request.status)}
                        {request.status}
                      </span>
                      <Eye className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              No {section.toLowerCase()} requests
            </div>
          )}
        </motion.div>
      ))}

      {/* Empty State */}
      {labRequests.length === 0 && !loading && !error && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Lab Requests Yet</h3>
          <p className="text-gray-600">Lab requests will appear here when they are submitted.</p>
        </div>
      )}
    </div>
  )
}

export default LabDashboard


