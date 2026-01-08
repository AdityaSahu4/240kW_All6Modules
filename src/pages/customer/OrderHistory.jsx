import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Plus, Package, Loader } from 'lucide-react'
import { getAllCalibrationRequests } from '../services/calibrationApi'
import toast from 'react-hot-toast'

function OrderHistory() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchCalibrationHistory()
  }, [])

  const fetchCalibrationHistory = async () => {
    try {
      setLoading(true)
      const data = await getAllCalibrationRequests()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching calibration history:', error)
      toast.error('Failed to load calibration history')
    } finally {
      setLoading(false)
    }
  }

  // Filter products based on search query
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.service.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const completed = filteredProducts.filter(p => p.status === 'Complete')
  const cancelled = filteredProducts.filter(p => p.status === 'Cancelled')
  const inProgress = filteredProducts.filter(p => 
    p.status !== 'Complete' && p.status !== 'Cancelled' && p.status !== 'Awaiting'
  )
  const activeProducts = filteredProducts.filter(p => 
    p.status !== 'Complete' && p.status !== 'Cancelled'
  )

  const totalProducts = filteredProducts.length
  const completedCount = completed.length
  const inProgressCount = inProgress.length
  const activeFlowsCount = activeProducts.length

  // Calculate analytics
  const certificationRate = totalProducts > 0 
    ? Math.round((completedCount / totalProducts) * 100) 
    : 0
  const workflowActivity = totalProducts > 0
    ? Math.round(((inProgressCount + completedCount) / totalProducts) * 100)
    : 0

  const getProgressStages = (product) => {
    const stages = [
      { label: 'Planned', completed: product.progress >= 10 },
      { label: 'Awaiting Samples', completed: product.progress >= 20 },
      { label: 'Quoted', completed: product.progress >= 30 },
      { label: 'Testing', completed: product.progress >= 50 },
      { label: 'In Progress', completed: product.progress >= 60 },
      { label: 'Under Review', completed: product.progress >= 80 },
      { label: 'Report Submitted', completed: product.progress >= 90 },
      { label: 'Completed', completed: product.status === 'Complete' },
    ]

    // Add dates only to completed stages (you can make this dynamic later)
    if (product.progress >= 10) {
      stages[0].date = new Date(product.createdAt).toLocaleDateString()
      stages[0].time = new Date(product.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    if (product.progress >= 20) {
      const date = new Date(product.createdAt)
      date.setDate(date.getDate() + 1)
      stages[1].date = date.toLocaleDateString()
      stages[1].time = '04:00 pm'
    }
    if (product.progress >= 30) {
      const date = new Date(product.createdAt)
      date.setDate(date.getDate() + 2)
      stages[2].date = date.toLocaleDateString()
      stages[2].time = '06:00 pm'
    }
    if (product.progress >= 50) {
      const date = new Date(product.createdAt)
      date.setDate(date.getDate() + 3)
      stages[3].date = date.toLocaleDateString()
      stages[3].time = '10:25 am'
    }
    if (product.progress >= 60) {
      const date = new Date(product.createdAt)
      date.setDate(date.getDate() + 4)
      stages[4].date = date.toLocaleDateString()
      stages[4].time = '04:00 pm'
    }
    if (product.progress >= 80) {
      const date = new Date(product.createdAt)
      date.setDate(date.getDate() + 5)
      stages[5].date = date.toLocaleDateString()
      stages[5].time = '09:30 am'
    }
    if (product.progress >= 90) {
      const date = new Date(product.createdAt)
      date.setDate(date.getDate() + 6)
      stages[6].date = date.toLocaleDateString()
      stages[6].time = '02:00 pm'
    }
    if (product.status === 'Complete') {
      const date = new Date(product.createdAt)
      date.setDate(date.getDate() + 7)
      stages[7].date = date.toLocaleDateString()
      stages[7].time = '09:00 am'
    }

    return stages
  }

  const getProductIcon = (index) => {
    const colors = [
      'bg-blue-100 text-blue-600',
      'bg-green-100 text-green-600',
      'bg-yellow-100 text-yellow-600',
      'bg-purple-100 text-purple-600',
      'bg-pink-100 text-pink-600',
    ]
    return colors[index % colors.length]
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Calibration History</h2>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading calibration history...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Calibration History</h2>
          <p className="text-gray-600 mt-1">View all your calibration requests</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Link
            to="/services/select"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Request
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <div className="text-3xl font-bold text-gray-800">{totalProducts}</div>
          <div className="text-sm text-gray-600 mt-1">Total Requests</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <div className="text-3xl font-bold text-green-600">{completedCount}</div>
          <div className="text-sm text-gray-600 mt-1">Completed</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <div className="text-3xl font-bold text-yellow-600">{inProgressCount}</div>
          <div className="text-sm text-gray-600 mt-1">In Progress</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <div className="text-3xl font-bold text-blue-600">{activeFlowsCount}</div>
          <div className="text-sm text-gray-600 mt-1">Active Flows</div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Completed Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-gray-200"
          >
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold">Completed ({completedCount})</h3>
            </div>
            
            {completed.length > 0 ? (
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-600 border-b">
                        <th className="pb-3 font-medium">#</th>
                        <th className="pb-3 font-medium">Product Name</th>
                        <th className="pb-3 font-medium">Service</th>
                        <th className="pb-3 font-medium">Progress</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completed.map((product, index) => (
                        <tr key={product.id} className="border-b last:border-b-0">
                          <td className="py-4">{index + 1}</td>
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getProductIcon(index)}`}>
                                <span className="font-bold text-sm">
                                  {product.name.substring(0, 2).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium">{product.name}</div>
                                <div className="text-xs text-gray-500">ID: {product.id}</div>
                                {product.manufacturer && (
                                  <div className="text-xs text-gray-400">By: {product.manufacturer}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-sm">{product.service}</td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-gray-200 rounded-full max-w-[100px]">
                                <div
                                  className="h-full bg-green-500 rounded-full"
                                  style={{ width: `${product.progress}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{product.progress}%</span>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              Completed
                            </span>
                          </td>
                          <td className="py-4">
                            <Link
                              to={`/customer/products/${product.id}`}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Timeline for first completed product */}
                {completed.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4">Progress Timeline</h4>
                    <div className="relative">
                      <div className="absolute left-0 right-0 h-[2px] bg-gray-300 top-[11px]" />
                      <div className="flex items-start justify-between relative">
                        {getProgressStages(completed[0]).map((stage, index) => (
                          <div key={index} className="flex flex-col items-center flex-1 relative">
                            <div className="mb-2 relative z-10">
                              {stage.completed ? (
                                <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full" />
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-white border-[3px] border-gray-300" />
                              )}
                            </div>
                            <div className="text-xs font-medium text-center whitespace-nowrap px-1">
                              {stage.label}
                            </div>
                            {stage.date && (
                              <>
                                <div className="text-xs text-gray-500 text-center mt-1 whitespace-nowrap">
                                  {stage.date}
                                </div>
                                <div className="text-xs text-gray-500 text-center whitespace-nowrap">
                                  {stage.time}
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p>No completed requests yet</p>
              </div>
            )}
          </motion.section>

          {/* Rejected / Cancelled Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border border-gray-200"
          >
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold">Rejected / Cancelled ({cancelled.length})</h3>
            </div>
            
            {cancelled.length > 0 ? (
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-600 border-b">
                        <th className="pb-3 font-medium">#</th>
                        <th className="pb-3 font-medium">Product Name</th>
                        <th className="pb-3 font-medium">Service</th>
                        <th className="pb-3 font-medium">Progress</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cancelled.map((product, index) => (
                        <tr key={product.id} className="border-b last:border-b-0">
                          <td className="py-4">{index + 1}</td>
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm">
                                {product.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium">{product.name}</div>
                                <div className="text-xs text-gray-500">ID: {product.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-sm">{product.service}</td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-gray-200 rounded-full max-w-[100px]">
                                <div
                                  className="h-full bg-red-500 rounded-full"
                                  style={{ width: `${product.progress}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{product.progress}%</span>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                              Cancelled
                            </span>
                          </td>
                          <td className="py-4">
                            <Link
                              to={`/customer/products/${product.id}`}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                <p>No cancelled requests</p>
              </div>
            )}
          </motion.section>

          {/* Active Workflows Section */}
          {activeProducts.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl border border-gray-200"
            >
              <div className="p-6 border-b">
                <h3 className="text-xl font-bold">Active Workflows ({activeProducts.length})</h3>
              </div>
              
              <div className="p-6 space-y-4">
                {activeProducts.slice(0, 5).map((product, index) => (
                  <div
                    key={product.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-medium">
                          {product.service} - {product.name}
                        </div>
                        {product.testType && (
                          <div className="text-xs text-gray-500 mt-1">
                            Test Type: {product.testType}
                          </div>
                        )}
                      </div>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                        In Progress
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{product.progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${product.progress}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="h-full bg-blue-600 rounded-full"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link
                        to={`/customer/products/${product.id}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Continue
                      </Link>
                      <Link
                        to={`/customer/products/${product.id}`}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}
        </div>

        {/* Progress Analytics Sidebar */}
        <aside className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6"
          >
            <h3 className="text-lg font-bold mb-6">Progress Analytics</h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Completion Rate</span>
                  <span className="text-sm font-bold">{certificationRate}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${certificationRate}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-green-500 rounded-full"
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Workflow Activity</span>
                  <span className="text-sm font-bold">{workflowActivity}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${workflowActivity}%` }}
                    transition={{ duration: 1, delay: 0.7 }}
                    className="h-full bg-blue-500 rounded-full"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </aside>
      </div>
    </div>
  )
}

export default OrderHistory