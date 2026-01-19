import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLabData } from '../../contexts/LabDataContext'
import { ArrowLeft, User, Calendar, Package, AlertCircle, CheckCircle2, XCircle, Clock, FileText, Download, TrendingUp, Upload } from 'lucide-react'
import { useState, useEffect } from 'react'

function RequestDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { labRequests, technicians, assignRequest, updateRequestStatus, updateRequestProgress, getFullRequest } = useLabData()
  const request = labRequests.find(r => r.backendId === parseInt(id) || r.id === id)
  const [selectedTechnician, setSelectedTechnician] = useState(request?.assignedTo || '')
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [progress, setProgress] = useState(request?.progress || 0)
  const [notes, setNotes] = useState('')
  const [testReportFile, setTestReportFile] = useState(null)
  const [testReportNotes, setTestReportNotes] = useState('')
  
  // Load full request details including progress history
  const [fullDetails, setFullDetails] = useState(null)
  const [loading, setLoading] = useState(false)

  // Load full details on mount
  useEffect(() => {
    if (request) {
      loadFullDetails()
    }
  }, [request])

  // Sync progress state when fullDetails updates
  useEffect(() => {
    if (fullDetails?.progress && fullDetails.progress.length > 0) {
      const latestProgress = fullDetails.progress[0].progress_percent
      setProgress(latestProgress)
    }
  }, [fullDetails])
  // ✅ REMOVED: The duplicate useEffect that was causing conflicts
  // Progress is now set directly in loadFullDetails()

  // Function to load full request details
  const loadFullDetails = async () => {
    if (!request) return
    try {
      setLoading(true)
      const details = await getFullRequest(request.backendId || request.id)
      setFullDetails(details)
      
      // Set progress state immediately after loading
      if (details.progress && details.progress.length > 0) {
        // If progress history exists, use the latest progress
        const latestProgress = details.progress[0]
        setProgress(latestProgress.progress_percent)
      } else {
        // ✅ If no progress history exists yet, start from 10% as a good starting point
        setProgress(10)
      }
    } catch (error) {
      console.error('Error loading full details:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!request) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Request not found</p>
        <Link to="/lab/queue" className="text-primary hover:underline">
          Back to Queue
        </Link>
      </div>
    )
  }

  const assignedTechnician = technicians.find(t => t.id === request.assignedTo)
  const availableTechnicians = technicians.filter(t => 
    t.specialization === request.service || t.status === 'Available'
  )

  const handleAssign = async () => {
    if (!selectedTechnician) {
      alert('Please select a technician')
      return
    }
    try {
      await assignRequest(request.id, parseInt(selectedTechnician))
      setShowAssignModal(false)
      
      // ✅ Set progress to 10% as a starting point for new assignments
      setProgress(10)
      
      alert('Request assigned successfully!')
      await loadFullDetails()
    } catch (error) {
      console.error('Assignment error:', error)
      alert('Failed to assign request: ' + (error.message || 'Unknown error'))
    }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      // ✅ CRITICAL: Block completion if progress is not 100%
      if (newStatus === 'Completed') {
        const currentProgressValue = fullDetails?.progress?.[0]?.progress_percent || progress || request.progress || 0
        
        if (currentProgressValue < 100) {
          alert(`Cannot mark as complete. Progress must be at 100% (currently at ${currentProgressValue}%).`)
          return
        }
        
        // ✅ Show completion modal to upload test report
        setShowCompleteModal(true)
        return
      }
      
      if (newStatus === 'Rejected') {
        const reason = prompt('Please provide a rejection reason:')
        if (!reason || reason.trim() === '') {
          alert('Rejection reason is required')
          return
        }
        await updateRequestStatus(request.id, newStatus, { rejectionReason: reason })
        await loadFullDetails()
      } else {
        await updateRequestStatus(request.id, newStatus)
        await loadFullDetails()
      }
    } catch (error) {
      console.error('Status update error:', error)
      alert('Failed to update status: ' + (error.message || 'Unknown error'))
    }
  }

  const handleCompleteWithReport = async () => {
    // ✅ Validate test report upload
    if (!testReportFile) {
      alert('Please upload a test report before completing.')
      return
    }

    try {
      // TODO: Upload test report file here
      // await uploadTestReport(request.id, testReportFile, testReportNotes)
      
      // Then mark as complete
      await updateRequestStatus(request.id, 'Completed')
      await loadFullDetails()
      
      // Close modal and reset
      setShowCompleteModal(false)
      setTestReportFile(null)
      setTestReportNotes('')
      
      alert('Request marked as complete with test report!')
    } catch (error) {
      console.error('Completion error:', error)
      alert('Failed to complete request: ' + (error.message || 'Unknown error'))
    }
  }

  const handleProgressUpdate = async () => {
    // ✅ Validation
    if (progress < 0 || progress > 100) {
      alert('Progress must be between 0 and 100')
      return
    }

    const currentProgressValue = fullDetails?.progress?.[0]?.progress_percent || request.progress || 0
    
    // Check if there are any changes at all
    const hasProgressChange = progress !== currentProgressValue
    const hasNotes = notes.trim().length > 0
    
    if (!hasProgressChange && !hasNotes) {
      alert('Please either change the progress percentage or add notes.')
      return
    }
    
    // Prevent decreasing progress without confirmation
    if (progress < currentProgressValue) {
      const confirmDecrease = window.confirm(
        `You are decreasing progress from ${currentProgressValue}% to ${progress}%. Are you sure?`
      )
      if (!confirmDecrease) {
        return
      }
    }
    
    try {
      const updatedProgress = parseInt(progress)
      await updateRequestProgress(request.id, updatedProgress, notes)
      
      // Clear notes
      setNotes('')
      
      // Reload full details which will update progress state
      await loadFullDetails()
      
      alert('Progress updated successfully!')
      
      // If progress is now 100%, show completion prompt
      if (updatedProgress === 100) {
        const shouldComplete = window.confirm(
          'Progress is now at 100%! Would you like to mark this request as complete and upload the test report?'
        )
        if (shouldComplete) {
          setShowCompleteModal(true)
        }
      }
    } catch (error) {
      console.error('Progress update error:', error)
      alert('Failed to update progress: ' + (error.message || 'Unknown error'))
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

  // ✅ Function to render appropriate status action buttons
  const renderStatusActions = () => {
    const currentStatus = request.status
    const currentProgressValue = fullDetails?.progress?.[0]?.progress_percent || progress || request.progress || 0
    const hasAssignedTechnician = request.assignedTo || assignedTechnician

    // Don't show any buttons if status is final
    if (currentStatus === 'Completed' || currentStatus === 'Rejected') {
      return null
    }

    return (
      <div className="flex gap-2 flex-wrap">
        {/* Show "Start" button only when Pending */}
        {currentStatus === 'Pending' && (
          <button
            onClick={() => handleStatusChange('In Progress')}
            className="group relative px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Start Testing
          </button>
        )}

        {/* Show "Complete" button only when In Progress AND progress is 100% */}
        {currentStatus === 'In Progress' && (
          <button
            onClick={() => handleStatusChange('Completed')}
            disabled={currentProgressValue < 100}
            className={`group relative px-4 py-2 rounded-lg transition-all duration-200 font-medium shadow-sm flex items-center gap-2 ${
              currentProgressValue === 100
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:shadow-md cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            title={currentProgressValue < 100 ? `Progress must be at 100% to complete (currently ${currentProgressValue}%)` : 'Mark as complete and upload test report'}
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark Complete
            {currentProgressValue < 100 && (
              <span className="text-xs bg-white/30 px-1.5 py-0.5 rounded">
                {currentProgressValue}%
              </span>
            )}
          </button>
        )}

        {/* Show "Reject" button for both Pending and In Progress */}
        {(currentStatus === 'Pending' || currentStatus === 'In Progress') && (
          <button
            onClick={() => handleStatusChange('Rejected')}
            className="group relative px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md flex items-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            Reject
          </button>
        )}
      </div>
    )
  }

  // Get current progress from full details or local state
  const currentProgress = (fullDetails?.progress?.[0]?.progress_percent !== undefined) 
    ? fullDetails.progress[0].progress_percent 
    : (request?.progress || 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/lab/queue"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold">Request Details</h2>
            <p className="text-sm text-gray-600 mt-1">Lab Request #{request.id}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Request Information - ✅ READ ONLY (Customer Provided) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Request Information</h3>
              <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                Customer Provided
              </span>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                    <Package className="w-4 h-4" />
                    Request ID
                  </label>
                  <p className="text-gray-900 font-medium">{request.id}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4" />
                    Date Submitted
                  </label>
                  <p className="text-gray-900">{request.date}</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1">Product Name</label>
                <p className="text-gray-900 font-medium bg-gray-50 px-3 py-2 rounded-lg">{request.productName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1">Service Type Requested</label>
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{request.service}</p>
              </div>
              
              {/* ✅ Status Section with Proper Action Buttons */}
              <div>
                <label className="text-sm text-gray-600 mb-3 block">Current Status</label>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <span className={`text-sm px-4 py-2 rounded-lg flex items-center gap-2 font-semibold shadow-sm ${getStatusBadge(request.status)}`}>
                    {getStatusIcon(request.status)}
                    {request.status}
                  </span>
                  {renderStatusActions()}
                </div>
              </div>

              {request.rejectionReason && (
                <div className="mt-4">
                  <label className="text-sm text-gray-600 mb-2 block">Rejection Reason</label>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-sm">{request.rejectionReason}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Progress Tracking */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Progress Tracking</h3>
              <p className="text-sm text-gray-600 mt-0.5">Monitor testing progress and milestones</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Current Progress - Large Visual Display */}
              <div className="bg-gradient-to-br from-primary/5 via-primary/3 to-transparent rounded-xl p-6 border border-primary/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Current Progress</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-primary">{currentProgress}</span>
                      <span className="text-2xl font-semibold text-primary/60">%</span>
                    </div>
                  </div>
                  <div className="w-24 h-24 rounded-full bg-white shadow-lg flex items-center justify-center">
                    {currentProgress === 100 ? (
                      <CheckCircle2 className="w-12 h-12 text-green-500" />
                    ) : (
                      <Clock className="w-12 h-12 text-primary" />
                    )}
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="relative">
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${currentProgress}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-primary via-primary-dark to-primary rounded-full relative"
                    >
                      {currentProgress > 0 && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                      )}
                    </motion.div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Status Message */}
                <div className="mt-4">
                  {currentProgress === 100 ? (
                    <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-lg">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Testing complete - Ready to mark as completed</span>
                    </div>
                  ) : currentProgress > 0 && request.status === 'In Progress' ? (
                    <div className="flex items-center gap-2 text-blue-700 bg-blue-50 px-4 py-2 rounded-lg">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">{100 - currentProgress}% remaining to complete</span>
                    </div>
                  ) : request.status === 'In Progress' ? (
                    <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 px-4 py-2 rounded-lg">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Testing started - Update progress below</span>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Update Progress Form - Only show when In Progress AND technician assigned */}
              {request.status === 'In Progress' && (
                <>
                  {!assignedTechnician ? (
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-yellow-900 mb-1">Technician Assignment Required</h4>
                          <p className="text-sm text-yellow-800 mb-3">
                            A technician must be assigned to this request before progress can be updated.
                          </p>
                          <button
                            onClick={() => setShowAssignModal(true)}
                            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium text-sm"
                          >
                            Assign Technician Now
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-base font-semibold text-gray-900">Update Progress</h4>
                          <p className="text-sm text-gray-600">Enter new progress percentage and add notes</p>
                        </div>
                      </div>
                      
                      <div className="space-y-5">
                        {/* Progress Input with Slider */}
                        <div>
                          <label className="text-sm font-semibold text-gray-700 mb-3 block">
                            Set New Progress
                          </label>
                          
                          {/* Number Input */}
                          <div className="relative mb-4">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={progress}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0
                                setProgress(Math.min(100, Math.max(0, val)))
                              }}
                              className="w-full px-4 py-3 pr-12 text-lg font-semibold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                              placeholder="0"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-lg">
                              %
                            </div>
                          </div>

                          {/* Range Slider */}
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={progress}
                            onChange={(e) => setProgress(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                            style={{
                              background: `linear-gradient(to right, rgb(var(--primary)) 0%, rgb(var(--primary)) ${progress}%, #e5e7eb ${progress}%, #e5e7eb 100%)`
                            }}
                          />
                          
                          {/* Preview Bar */}
                          <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                            <p className="text-xs text-gray-600 mb-2">Preview</p>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-primary to-primary-dark transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>

                          {/* Quick Select Buttons */}
                          <div className="flex gap-2 mt-3">
                            {[25, 50, 75, 100].map(val => (
                              <button
                                key={val}
                                onClick={() => setProgress(val)}
                                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                                  progress === val 
                                    ? 'bg-primary text-white' 
                                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                {val}%
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Notes Input */}
                        <div>
                          <label className="text-sm font-semibold text-gray-700 mb-2 block">
                            Notes <span className="text-gray-400 font-normal">(Optional)</span>
                          </label>
                          <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none text-gray-700"
                            placeholder="e.g., Completed initial setup and calibration tests..."
                          />
                          <div className="flex justify-between items-center mt-2">
                            <p className="text-xs text-gray-500">
                              Add any relevant details about this progress update
                            </p>
                            {notes && notes.trim().length > 0 && (
                              <span className="text-xs text-green-600 font-medium">
                                ✓ Notes added ({notes.trim().length} chars)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Update Button - Shows completion option when at 100% */}
                        {(() => {
                          const hasProgressChange = progress !== currentProgress
                          const hasNotes = notes && notes.trim().length > 0
                          const isDisabled = !hasProgressChange && !hasNotes
                          const isAt100 = currentProgress === 100
                          
                          // If already at 100%, show "Mark Complete" button
                          if (isAt100 && !hasProgressChange && !hasNotes) {
                            return (
                              <button
                                onClick={() => setShowCompleteModal(true)}
                                className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold text-base flex items-center justify-center gap-2 group"
                              >
                                <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                Mark Complete & Upload Report
                              </button>
                            )
                          }
                          
                          return (
                            <button
                              onClick={handleProgressUpdate}
                              disabled={isDisabled}
                              className="w-full px-6 py-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-xl transition-all duration-200 font-semibold text-base flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                            >
                              <TrendingUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
                              {isDisabled
                                ? 'No Changes to Save' 
                                : hasProgressChange 
                                  ? `Update to ${progress}%` 
                                  : 'Save Progress Update'}
                            </button>
                          )
                        })()}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Progress History */}
              {fullDetails?.progress && fullDetails.progress.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <h4 className="text-base font-semibold text-gray-900">Progress History</h4>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                      {fullDetails.progress.length} {fullDetails.progress.length === 1 ? 'update' : 'updates'}
                    </span>
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {fullDetails.progress
                      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)) // ✅ Sort by newest first
                      .map((prog, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-start gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center flex-shrink-0 shadow-md">
                          <span className="text-white font-bold text-sm">{prog.progress_percent}%</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900">Progress: {prog.progress_percent}%</p>
                            {idx === 0 && (
                              <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full font-medium">
                                Current
                              </span>
                            )}
                          </div>
                          {prog.notes && (
                            <p className="text-sm text-gray-700 mt-1 bg-white px-3 py-2 rounded border border-gray-200">
                              {prog.notes}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(prog.updated_at).toLocaleString()} • {prog.updated_by}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Test Results */}
          {request.status === 'Completed' && request.testResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Test Results
              </h3>
              <p className="text-gray-700 bg-green-50 p-4 rounded-lg">{request.testResults}</p>
              <div className="mt-4">
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download Report
                </button>
              </div>
            </motion.div>
          )}
        </div>

        <div className="space-y-6">
          {/* Assignment Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Assignment
            </h3>
            {assignedTechnician ? (
              <div className="space-y-3">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Assigned To</p>
                  <p className="font-medium text-gray-900">{assignedTechnician.name}</p>
                  <p className="text-sm text-gray-500">{assignedTechnician.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Specialization</p>
                  <p className="text-sm text-gray-900 font-medium">{assignedTechnician.specialization}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`text-xs px-2 py-1 rounded ${
                    assignedTechnician.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {assignedTechnician.status}
                  </span>
                </div>
                {request.status !== 'Completed' && request.status !== 'Rejected' && (
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Reassign
                  </button>
                )}
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-3">Not assigned yet</p>
                {request.status !== 'Rejected' && (
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
                  >
                    Assign Technician
                  </button>
                )}
              </div>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                to={`/lab/schedule?request=${id}`}
                className="block w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center font-medium"
              >
                View Schedule
              </Link>
              <button className="block w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                Generate Report
              </button>
              <button className="block w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                View History
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold mb-4">
              {assignedTechnician ? 'Reassign Technician' : 'Assign Technician'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-2 block">Select Technician</label>
                <select
                  value={selectedTechnician}
                  onChange={(e) => setSelectedTechnician(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select a technician</option>
                  {availableTechnicians.map(tech => (
                    <option key={tech.id} value={tech.id}>
                      {tech.name} ({tech.id}) - {tech.specialization} - {tech.status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAssign}
                  disabled={!selectedTechnician}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {assignedTechnician ? 'Reassign' : 'Assign'}
                </button>
                <button
                  onClick={() => {
                    setShowAssignModal(false)
                    setSelectedTechnician(request?.assignedTo || '')
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Completion Modal with Test Report Upload */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-lg w-full"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Complete Testing</h3>
                <p className="text-sm text-gray-600">Upload test report to finalize request</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* File Upload */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Test Report <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    id="test-report-upload"
                    onChange={(e) => setTestReportFile(e.target.files[0])}
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                  />
                  {testReportFile ? (
                    <div className="space-y-3">
                      <FileText className="w-12 h-12 text-green-500 mx-auto" />
                      <div>
                        <p className="font-medium text-gray-900">{testReportFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {(testReportFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={() => setTestReportFile(null)}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Remove File
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="test-report-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        Click to upload test report
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF, DOC, or DOCX (Max 10MB)
                      </p>
                    </label>
                  )}
                </div>
              </div>

              {/* Report Notes */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Report Notes <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  value={testReportNotes}
                  onChange={(e) => setTestReportNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none"
                  placeholder="Add any notes about the test results..."
                />
              </div>

              {/* Warning Message */}
              {!testReportFile && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    Test report is required to mark the request as complete.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCompleteWithReport}
                  disabled={!testReportFile}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-green-500 disabled:hover:to-green-600 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Complete Request
                </button>
                <button
                  onClick={() => {
                    setShowCompleteModal(false)
                    setTestReportFile(null)
                    setTestReportNotes('')
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
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

export default RequestDetail