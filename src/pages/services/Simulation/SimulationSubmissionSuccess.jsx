import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Bell, FileText, FolderOpen, Settings, Eye, ArrowLeft } from 'lucide-react'
import { useState } from "react"
import { fetchFullSimulationRequest } from "../../services/simulationApi"
import SimulationSubmittedDetails from "./SimulationSubmittedDetails"

function SimulationSubmissionSuccess() {
  const location = useLocation()
  const simulationRequestId = 
  location.state?.simulationRequestId ||
  localStorage.getItem("lastSubmittedSimulationRequestId")
  const navigate = useNavigate()
  const [showDetails, setShowDetails] = useState(false)
  const [submittedData, setSubmittedData] = useState(null)

  const submittedItems = [
    {
      id: 'technical-specs',
      title: 'Technical Specifications',
      icon: FileText,
      color: 'blue'
    },
    {
      id: 'test-reports',
      title: 'Uploaded Test Reports',
      icon: FileText,
      color: 'green'
    },
    {
      id: 'design-docs',
      title: 'Design & Documentation Files',
      icon: FolderOpen,
      color: 'purple'
    },
    {
      id: 'simulation-reqs',
      title: 'Simulation Requirements',
      icon: Settings,
      color: 'orange'
    },
  ]

  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
    }
    return colorMap[color] || 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar - Progress Tracker */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-gray-100 rounded-xl p-6 sticky top-8">
              <div className="space-y-4">
                {[
                  { title: 'Product Details', completed: true },
                  { title: 'Technical Specification Documents', completed: true },
                  { title: 'Simulation Details', completed: true },
                  { title: 'Submit for Simulation', completed: true, active: true },
                ].map((step, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      step.active
                        ? 'bg-blue-600 text-white'
                        : step.completed
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {step.completed ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${
                        step.active ? 'text-gray-900' : 'text-gray-600'
                      }`}>
                        {step.title}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl border border-gray-200 p-8 mb-8"
            >
              {/* Success Indicator */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                >
                  <CheckCircle className="w-12 h-12 text-white" />
                </motion.div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Design Submitted for Simulation</h1>
                <p className="text-lg text-gray-600">
                  Your documents and details have been received. Our simulation team will now begin the verification process.
                </p>
              </div>

              {/* Submitted Items */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Submitted Items</h2>
                <div className="space-y-3">
                  {submittedItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getColorClasses(item.color)}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-gray-900">{item.title}</span>
                      </div>
                    )
                  })}
                </div>
                
                {/* Notification */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-600" />
                  <p className="text-sm text-blue-800">
                    You will be notified once the simulation results are ready.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigate('/customer/dashboard')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Return to Dashboard
                </button>
                
                <button
                onClick={async () => {
                  if (!simulationRequestId) {
                    alert("Simulation request ID not found")
                    return
                  }

                  const data = await fetchFullSimulationRequest(simulationRequestId)
                  setSubmittedData(data)
                  setShowDetails(true)
                }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center gap-2"
                >
                <Eye className="w-4 h-4" />
                View Submitted Details
                </button>
              </div>
            </motion.div>
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  className="fixed inset-0 z-50 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Background overlay */}
                  <motion.div
                    className="absolute inset-0 bg-black bg-opacity-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowDetails(false)}
                  />

                  {/* Modal box */}
                  <motion.div
                    className="relative bg-white w-[90%] max-w-5xl max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl p-8 z-10"
                    initial={{ scale: 0.95, y: 30, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.95, y: 30, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    {/* Close button */}
                    <button
                      onClick={() => setShowDetails(false)}
                      className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition"
                      aria-label="Close"
                    >
                      ✕
                    </button>

                    {/* Header */}
                    <div className="mb-6 border-b pb-4">
                      <h2 className="text-2xl font-bold text-gray-900">
                        Submitted Simulation Details
                      </h2>
                      <p className="text-sm text-gray-500">
                        Review the information you submitted for simulation
                      </p>
                    </div>

                    {/* Content */}
                    {submittedData ? (
                      <SimulationSubmittedDetails data={submittedData} />
                    ) : (
                      <div className="text-center text-gray-600 py-16">
                        Loading submitted details…
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Footer */}
            <div className="flex items-center justify-end gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-gray-900">Help</a>
              <a href="#" className="hover:text-gray-900">Privacy</a>
              <a href="#" className="hover:text-gray-900">Terms</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SimulationSubmissionSuccess

