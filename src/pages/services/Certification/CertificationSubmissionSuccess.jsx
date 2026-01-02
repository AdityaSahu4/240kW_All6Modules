import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, FileText, ArrowLeft, Clock } from 'lucide-react'

function CertificationSubmissionSuccess({ formData }) {
  const navigate = useNavigate()

  const uploadedDocuments = Array.isArray(formData?.uploadedCertDocs)
    ? formData.uploadedCertDocs
    : []

  const getFileIconColor = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase()
    if (ext === 'pdf') return 'text-red-600'
    if (['jpg', 'jpeg', 'png'].includes(ext)) return 'text-blue-600'
    return 'text-gray-600'
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
                  { title: 'Certification Documents', completed: true },
                  { title: 'Submission Review', completed: true },
                ].map((step, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-green-500 text-white">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
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
              {/* Success Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                >
                  <CheckCircle className="w-12 h-12 text-white" />
                </motion.div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Documents Submitted for Certification</h1>
                <p className="text-lg text-gray-600">
                  Your documents have been successfully uploaded and forwarded to the certification authority. You will be notified once the review is completed.
                </p>
              </div>

              {/* Uploaded Documents */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-green-600" />
                  <h2 className="text-xl font-bold text-gray-900">Uploaded Documents</h2>
                </div>
                
                {uploadedDocuments.length > 0 ? (
                  <div className="space-y-2">
                    {uploadedDocuments.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
                      >
                        <FileText className={`w-5 h-5 ${getFileIconColor(doc.name)}`} />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{doc.name}</span>
                          <span className="text-xs text-gray-500">{doc.docType}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No documents were uploaded.
                  </p>
                )}

                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Review timelines vary based on the certification body.</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="text-center">
                <button
                  onClick={() => navigate('/customer/dashboard')}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold inline-flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </button>
              </div>
            </motion.div>

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

export default CertificationSubmissionSuccess

