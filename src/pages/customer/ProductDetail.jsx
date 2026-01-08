import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Edit, Trash2, FileText, Calendar, Package, Tag, Download, Eye, Loader, Save, X, AlertTriangle } from 'lucide-react'
import { getCalibrationRequestById, downloadDocument, viewDocument, deleteCalibrationRequest, updateCalibrationProductDetails } from '../services/calibrationApi'
import toast from 'react-hot-toast'

function ProductDetail() {
  const { id } = useParams() // This is CAL-{number} format
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [calibrationData, setCalibrationData] = useState(null)
  const [error, setError] = useState(null)
  const [downloadingDocs, setDownloadingDocs] = useState({}) // Track downloading state per doc
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Fetch calibration request details
  useEffect(() => {
    fetchCalibrationDetails()
  }, [id])

  const fetchCalibrationDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getCalibrationRequestById(id)
      setCalibrationData(data)
      
      // Initialize edit form with product data
      if (data.product) {
        setEditForm({
          eut_name: data.product.eut_name || '',
          eut_quantity: data.product.eut_quantity || '',
          manufacturer: data.product.manufacturer || '',
          model_no: data.product.model_no || '',
          serial_no: data.product.serial_no || '',
          supply_voltage: data.product.supply_voltage || '',
          operating_frequency: data.product.operating_frequency || '',
          current: data.product.current || '',
          weight: data.product.weight || '',
          dimensions: {
            length: data.product.length_mm || '',
            width: data.product.width_mm || '',
            height: data.product.height_mm || ''
          },
          power_ports: data.product.power_ports || '',
          signal_lines: data.product.signal_lines || '',
          software_name: data.product.software_name || '',
          software_version: data.product.software_version || '',
          industry: data.product.industry || '',
          industry_other: data.product.industry_other || '',
          preferred_date: data.product.preferred_date || '',
          notes: data.product.notes || ''
        })
      }
    } catch (err) {
      console.error('Error fetching calibration details:', err)
      setError('Failed to load product details')
      toast.error('Failed to load product details')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveEdit = async () => {
    try {
      setSaving(true)
      await updateCalibrationProductDetails(id, editForm)
      toast.success('Product updated successfully')
      
      // Refresh data
      await fetchCalibrationDetails()
      setIsEditing(false)
    } catch (error) {
      console.error('Update error:', error)
      toast.error('Failed to update product')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    // Reset form to original data
    if (calibrationData?.product) {
      setEditForm({
        eut_name: calibrationData.product.eut_name || '',
        eut_quantity: calibrationData.product.eut_quantity || '',
        manufacturer: calibrationData.product.manufacturer || '',
        model_no: calibrationData.product.model_no || '',
        serial_no: calibrationData.product.serial_no || '',
        supply_voltage: calibrationData.product.supply_voltage || '',
        operating_frequency: calibrationData.product.operating_frequency || '',
        current: calibrationData.product.current || '',
        weight: calibrationData.product.weight || '',
        dimensions: {
          length: calibrationData.product.length_mm || '',
          width: calibrationData.product.width_mm || '',
          height: calibrationData.product.height_mm || ''
        },
        power_ports: calibrationData.product.power_ports || '',
        signal_lines: calibrationData.product.signal_lines || '',
        software_name: calibrationData.product.software_name || '',
        software_version: calibrationData.product.software_version || '',
        industry: calibrationData.product.industry || '',
        industry_other: calibrationData.product.industry_other || '',
        preferred_date: calibrationData.product.preferred_date || '',
        notes: calibrationData.product.notes || ''
      })
    }
    setIsEditing(false)
  }

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true)
      await deleteCalibrationRequest(id)
      toast.success('Product deleted successfully')
      navigate('/customer/dashboard')
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete product')
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const handleDownload = async (doc) => {
    try {
      setDownloadingDocs(prev => ({ ...prev, [doc.id]: true }))
      await downloadDocument(doc.id, doc.file_name)
      toast.success(`Downloaded ${doc.file_name}`)
    } catch (error) {
      console.error('Download error:', error)
      toast.error(`Failed to download ${doc.file_name}`)
    } finally {
      setDownloadingDocs(prev => ({ ...prev, [doc.id]: false }))
    }
  }

  const handleView = (doc) => {
    try {
      viewDocument(doc.id)
      toast.success(`Opening ${doc.file_name}`)
    } catch (error) {
      console.error('View error:', error)
      toast.error(`Failed to open ${doc.file_name}`)
    }
  }

  const getDocumentIcon = (docType) => {
    const iconMap = {
      'datasheet': { icon: FileText, color: 'bg-blue-100 text-blue-600' },
      'manual': { icon: FileText, color: 'bg-green-100 text-green-600' },
      'schematic': { icon: FileText, color: 'bg-purple-100 text-purple-600' },
      'test_report': { icon: FileText, color: 'bg-red-100 text-red-600' },
      'certificate': { icon: FileText, color: 'bg-yellow-100 text-yellow-600' },
    }
    return iconMap[docType] || { icon: FileText, color: 'bg-gray-100 text-gray-600' }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const calculateProgress = () => {
    if (!calibrationData) return 0
    const { product, requirements, standards, lab } = calibrationData
    
    let progress = 0
    if (product) progress += 25
    if (requirements) progress += 25
    if (standards) progress += 25
    if (lab) progress += 15
    if (calibrationData.calibration_request?.status === 'submitted') progress = 100
    
    return progress
  }

  const getStatusInfo = () => {
    const status = calibrationData?.calibration_request?.status || 'draft'
    const statusMap = {
      'draft': { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
      'submitted': { label: 'Complete', color: 'bg-green-100 text-green-700' },
      'in_progress': { label: 'Testing', color: 'bg-blue-100 text-blue-700' },
      'under_review': { label: 'Under Review', color: 'bg-yellow-100 text-yellow-700' },
      'completed': { label: 'Complete', color: 'bg-green-100 text-green-700' },
    }
    return statusMap[status] || statusMap.draft
  }

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    )
  }

  // Error State
  if (error || !calibrationData) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">{error || 'Product not found'}</p>
        <Link to="/customer/dashboard" className="text-blue-600 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const { calibration_request, product, requirements, standards, lab, documents } = calibrationData
  const productName = product?.eut_name || `Calibration Request #${calibration_request.id}`
  const progress = calculateProgress()
  const statusInfo = getStatusInfo()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/customer/dashboard"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h2 className="text-2xl font-bold">Product Details</h2>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save
                  </>
                )}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={saving}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold mb-4">Product Information</h3>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                    <Package className="w-4 h-4" />
                    Product Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.eut_name}
                      onChange={(e) => setEditForm({...editForm, eut_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-lg font-medium">{productName}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                    <Tag className="w-4 h-4" />
                    Product ID
                  </label>
                  <p className="text-gray-700">{id}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1">Manufacturer</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.manufacturer}
                      onChange={(e) => setEditForm({...editForm, manufacturer: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-700">{product?.manufacturer || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1">Model Number</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.model_no}
                      onChange={(e) => setEditForm({...editForm, model_no: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-700">{product?.model_no || 'N/A'}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1">Serial Number</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.serial_no}
                      onChange={(e) => setEditForm({...editForm, serial_no: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-700">{product?.serial_no || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1">Quantity</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editForm.eut_quantity}
                      onChange={(e) => setEditForm({...editForm, eut_quantity: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-700">{product?.eut_quantity || 'N/A'}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1">Supply Voltage</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.supply_voltage}
                      onChange={(e) => setEditForm({...editForm, supply_voltage: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-700">{product?.supply_voltage || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1">Operating Frequency</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.operating_frequency}
                      onChange={(e) => setEditForm({...editForm, operating_frequency: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-700">{product?.operating_frequency || 'N/A'}</p>
                  )}
                </div>
              </div>

              {product?.notes && !isEditing && (
                <div>
                  <label className="text-sm text-gray-600 mb-1">Notes</label>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{product.notes}</p>
                </div>
              )}

              {isEditing && (
                <div>
                  <label className="text-sm text-gray-600 mb-1">Notes</label>
                  <textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4" />
                  Created At
                </label>
                <p className="text-gray-700">
                  {calibration_request.created_at 
                    ? new Date(calibration_request.created_at).toLocaleDateString() 
                    : 'N/A'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Requirements & Standards */}
          {!isEditing && (requirements || standards) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold mb-4">Requirements & Standards</h3>
              <div className="space-y-4">
                {requirements && (
                  <>
                    <div>
                      <label className="text-sm text-gray-600 mb-1">Test Type</label>
                      <p className="text-gray-700">{requirements.test_type || 'N/A'}</p>
                    </div>
                    {requirements.selected_tests && requirements.selected_tests.length > 0 && (
                      <div>
                        <label className="text-sm text-gray-600 mb-2 block">Selected Tests</label>
                        <div className="flex flex-wrap gap-2">
                          {requirements.selected_tests.map((test, idx) => (
                            <span 
                              key={idx}
                              className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                            >
                              {test}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {standards && (
                  <>
                    {standards.regions && standards.regions.length > 0 && (
                      <div>
                        <label className="text-sm text-gray-600 mb-2 block">Regions</label>
                        <div className="flex flex-wrap gap-2">
                          {standards.regions.map((region, idx) => (
                            <span 
                              key={idx}
                              className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm"
                            >
                              {region}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {standards.standards && standards.standards.length > 0 && (
                      <div>
                        <label className="text-sm text-gray-600 mb-2 block">Standards</label>
                        <div className="flex flex-wrap gap-2">
                          {standards.standards.map((standard, idx) => (
                            <span 
                              key={idx}
                              className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm"
                            >
                              {standard}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* Progress */}
          {!isEditing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold mb-4">Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Completion</span>
                    <span className="text-sm font-semibold">{progress}%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1 }}
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                    />
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Status: </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Related Documents */}
          {!isEditing && documents && documents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Uploaded Documents ({documents.length})
              </h3>
              <div className="space-y-3">
                {documents.map((doc) => {
                  const docIcon = getDocumentIcon(doc.doc_type)
                  const DocIcon = docIcon.icon
                  const isDownloading = downloadingDocs[doc.id]
                  
                  return (
                    <div
                      key={doc.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${docIcon.color}`}>
                        <DocIcon className="w-6 h-6" />
                      </div>
                      
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{doc.file_name}</p>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                          <span className="capitalize">{doc.doc_type.replace('_', ' ')}</span>
                          <span>•</span>
                          <span>{formatFileSize(doc.file_size)}</span>
                          {doc.uploaded_at && (
                            <>
                              <span>•</span>
                              <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(doc)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDownload(doc)}
                          disabled={isDownloading}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Download"
                        >
                          {isDownloading ? (
                            <Loader className="w-5 h-5 animate-spin" />
                          ) : (
                            <Download className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        {!isEditing && (
          <div className="space-y-6">
            {/* Quick Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold mb-4">Quick Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Type</span>
                  <span className="font-medium">Calibration</span>
                </div>
                {requirements && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Test Type</span>
                    <span className="font-medium">{requirements.test_type}</span>
                  </div>
                )}
                {lab && lab.selected_labs && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Labs Selected</span>
                    <span className="font-medium">{lab.selected_labs.length}</span>
                  </div>
                )}
                {documents && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Documents</span>
                    <span className="font-medium">{documents.length}</span>
                  </div>
                )}
              </div>
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
                  to="/customer/documents"
                  className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
                >
                  View All Documents
                </Link>
                <Link
                  to="/customer/messages"
                  className="block w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center"
                >
                  Send Message
                </Link>
                <Link
                  to="/services/select"
                  className="block w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center"
                >
                  Request New Service
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !deleting && setShowDeleteModal(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold">Delete Product</h3>
                  </div>
                  {!deleting && (
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-gray-600 mb-2">
                    Are you sure you want to delete <span className="font-semibold text-gray-900">{productName}</span>?
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    This will permanently delete the product and all associated data including documents. This action cannot be undone.
                  </p>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      disabled={deleting}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteConfirm}
                      disabled={deleting}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {deleting ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        'Delete'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProductDetail