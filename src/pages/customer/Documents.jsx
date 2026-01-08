import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Download, Eye, Package, ChevronDown, ChevronRight, File, CheckCircle, Loader, Upload, X } from 'lucide-react'
import { getAllCalibrationRequests, getCalibrationRequestById, downloadDocument, viewDocument } from '../services/calibrationApi'
import toast from 'react-hot-toast'

function Documents() {
  const [productsWithDocs, setProductsWithDocs] = useState([])
  const [expandedProducts, setExpandedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [downloadingDocs, setDownloadingDocs] = useState({}) // Track downloading state per doc

  // Fetch all calibration requests and their documents
  useEffect(() => {
    fetchAllDocuments()
  }, [])

  const fetchAllDocuments = async () => {
    try {
      setLoading(true)
      
      // Get all calibration requests
      const requests = await getAllCalibrationRequests()
      
      // Fetch full details including documents for each request
      const productsWithDocsPromises = requests.map(async (request) => {
        try {
          const fullData = await getCalibrationRequestById(request.id)
          return {
            id: request.id,
            name: request.name,
            service: request.service,
            status: request.status,
            manufacturer: request.manufacturer,
            createdAt: request.createdAt,
            docs: fullData.documents || []
          }
        } catch (error) {
          console.error(`Error fetching details for ${request.id}:`, error)
          return {
            id: request.id,
            name: request.name,
            service: request.service,
            status: request.status,
            manufacturer: request.manufacturer,
            createdAt: request.createdAt,
            docs: []
          }
        }
      })

      const productsData = await Promise.all(productsWithDocsPromises)
      setProductsWithDocs(productsData)
      
      // Expand first product by default
      if (productsData.length > 0) {
        setExpandedProducts([productsData[0].id])
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const toggleProduct = (productId) => {
    setExpandedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
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

  const getDocumentIcon = (docType) => {
    const iconMap = {
      'datasheet': { icon: FileText, color: 'bg-blue-100 text-blue-600' },
      'manual': { icon: FileText, color: 'bg-green-100 text-green-600' },
      'schematic': { icon: FileText, color: 'bg-purple-100 text-purple-600' },
      'test_report': { icon: FileText, color: 'bg-red-100 text-red-600' },
      'certificate': { icon: CheckCircle, color: 'bg-green-100 text-green-600' },
      'specification': { icon: File, color: 'bg-yellow-100 text-yellow-600' },
    }
    return iconMap[docType] || { icon: File, color: 'bg-gray-100 text-gray-600' }
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

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown'
    
    const now = new Date()
    const uploaded = new Date(dateString)
    const diffMs = now - uploaded
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`
    }
    const months = Math.floor(diffDays / 30)
    return `${months} month${months > 1 ? 's' : ''} ago`
  }

  // Calculate total documents
  const totalDocuments = productsWithDocs.reduce((sum, product) => sum + product.docs.length, 0)

  // Loading State
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">View Documents</h2>
            <p className="text-gray-600 mt-1">Your Products</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading documents...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">View Documents</h2>
          <p className="text-gray-600 mt-1">
            {productsWithDocs.length} Product{productsWithDocs.length !== 1 ? 's' : ''} • {totalDocuments} Document{totalDocuments !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      {/* Upload Notice */}
      {showUpload && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 rounded-xl border border-blue-200 p-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Upload Documents</h3>
              <p className="text-sm text-blue-700 mb-4">
                To upload documents, please go to the specific product's calibration form and upload files during the submission process.
              </p>
              <Link
                to="/services/select"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Start New Calibration Request
              </Link>
            </div>
            <button
              onClick={() => setShowUpload(false)}
              className="p-1 hover:bg-blue-100 rounded"
            >
              <X className="w-5 h-5 text-blue-700" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Products List with Documents */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-200"
      >
        <div className="p-6">
          <div className="space-y-3">
            {productsWithDocs.length > 0 ? (
              productsWithDocs.map((product, idx) => {
                const isExpanded = expandedProducts.includes(product.id)
                
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    {/* Product Header */}
                    <button
                      onClick={() => toggleProduct(product.id)}
                      className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-gray-600 font-medium">{idx + 1}</span>
                      
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getProductIcon(idx)}`}>
                        <Package className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <span>ID: {product.id}</span>
                          {product.manufacturer && (
                            <>
                              <span>•</span>
                              <span>{product.manufacturer}</span>
                            </>
                          )}
                          <span>•</span>
                          <span className="text-blue-600 font-medium">{product.docs.length} document{product.docs.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/customer/products/${product.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          View Product
                        </Link>
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </button>

                    {/* Documents List (Expandable) */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-gray-200 bg-gray-50"
                        >
                          {product.docs.length > 0 ? (
                            <div className="p-4 space-y-3">
                              {product.docs.map((doc) => {
                                const docIcon = getDocumentIcon(doc.doc_type)
                                const DocIcon = docIcon.icon
                                const isDownloading = downloadingDocs[doc.id]
                                
                                return (
                                  <div
                                    key={doc.id}
                                    className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                                  >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${docIcon.color}`}>
                                      <DocIcon className="w-5 h-5" />
                                    </div>
                                    
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-900">{doc.file_name}</div>
                                      <div className="text-sm text-gray-500 flex items-center gap-2">
                                        <span className="capitalize">{doc.doc_type.replace('_', ' ')}</span>
                                        <span>•</span>
                                        <span>{formatFileSize(doc.file_size)}</span>
                                        <span>•</span>
                                        <span>{getTimeAgo(doc.uploaded_at)}</span>
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
                          ) : (
                            <div className="p-6 text-center text-gray-500 text-sm">
                              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                              <p>No documents uploaded for this product</p>
                              <Link
                                to={`/customer/products/${product.id}`}
                                className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                              >
                                View Product Details
                              </Link>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })
            ) : (
              <div className="p-12 text-center text-gray-500">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-lg mb-2">No products found</p>
                <p className="text-sm mb-4">Create a calibration request to upload documents</p>
                <Link
                  to="/services/select"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Calibration Request
                </Link>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Summary Card */}
      {productsWithDocs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-gray-200 p-6"
        >
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{productsWithDocs.length}</div>
              <div className="text-sm text-gray-600 mt-1">Total Products</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{totalDocuments}</div>
              <div className="text-sm text-gray-600 mt-1">Total Documents</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {productsWithDocs.filter(p => p.docs.length > 0).length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Products with Docs</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default Documents