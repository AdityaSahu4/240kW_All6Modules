import { useState } from 'react'
import { FileText, Edit, AlertTriangle, HelpCircle, ArrowRight } from 'lucide-react'

function SubmissionReview({ formData, updateFormData, onEdit }) {
  const [additionalNotes, setAdditionalNotes] = useState(formData.additionalNotes || '')
  const [confirmations, setConfirmations] = useState({
    accurate: formData.confirmAccurate || false,
    correct: formData.confirmCorrect || false,
    understand: formData.confirmUnderstand || false,
  })

  const handleConfirmationChange = (key, value) => {
    const updated = { ...confirmations, [key]: value }
    setConfirmations(updated)
    updateFormData({
      confirmAccurate: updated.accurate,
      confirmCorrect: updated.correct,
      confirmUnderstand: updated.understand,
    })
  }

  const handleNotesChange = (value) => {
    setAdditionalNotes(value)
    updateFormData({ additionalNotes: value })
  }

  const documentTypes = [
    { id: 'test-report', name: 'Test Report PDF', icon: FileText, color: 'red' },
    { id: 'technical-file', name: 'Technical File / Product Manual', icon: FileText, color: 'blue' },
    { id: 'additional', name: 'Additional Compliance Documents', icon: FileText, color: 'green' },
  ]

  const getColorClasses = (color) => {
    const colorMap = {
      red: 'bg-red-100 text-red-600',
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
    }
    return colorMap[color] || 'bg-gray-100 text-gray-600'
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return ''
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Review Submitted Documents</h1>
      </div>

      {/* Product & Region Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Product & Region Summary</h2>
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700">Target Region / Country</label>
            <div className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
              {formData.targetRegion || 'Not selected'}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Product Category</label>
            <div className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
              {formData.productCategory || 'Not selected'}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Product Name</label>
            <div className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
              {formData.productName || 'Not entered'}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Estimated Fee Range</label>
            <div className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
              $150 - $400
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Final amount is confirmed by the certification authority.
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Standards Passed</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.standards && formData.standards.length > 0 ? (
                <>
                  {formData.standards.slice(0, 4).map((standard) => (
                    <span
                      key={standard}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                    >
                      {standard}
                    </span>
                  ))}
                  {formData.standards.length > 4 && (
                    <span className="px-3 py-1 text-indigo-600 text-sm hover:underline cursor-pointer">
                      View all standards ({formData.standards.length})
                    </span>
                  )}
                </>
              ) : (
                <span className="text-sm text-gray-400">No standards added</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Uploaded Supporting Documents */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Uploaded Supporting Documents</h2>
        
        <div className="space-y-4">
          {documentTypes.map((doc) => {
            const Icon = doc.icon
            const uploaded = formData.uploadedCertDocs?.find(d => d.docType === doc.id)
            
            return (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getColorClasses(doc.color)}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{doc.name}</div>
                    {uploaded ? (
                      <div className="text-sm text-gray-600">
                        {uploaded.name} • {formatFileSize(uploaded.size)}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400">No file uploaded</div>
                    )}
                  </div>
                </div>

                {uploaded && (
                  <label className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors text-sm cursor-pointer">
                    Replace
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const updatedDocs = [
                            ...formData.uploadedCertDocs.filter(d => d.docType !== doc.id),
                            {
                              docType: doc.id,
                              file,
                              name: file.name,
                              size: file.size,
                              type: file.type,
                              uploadedAt: new Date().toISOString(),
                            }
                          ]
                          updateFormData({ uploadedCertDocs: updatedDocs })
                        }
                        e.target.value = ''
                      }}
                    />
                  </label>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-yellow-800">
            All documents must be clear and readable. Misuploaded files may delay certification.
          </p>
        </div>
      </div>

      {/* Additional Notes */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Additional Notes or Declaration (Optional)</h2>
        <textarea
          value={additionalNotes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="You may add clarifications, disclaimers, or notes for the certification authority..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Need Help */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <p className="text-sm text-blue-800">
            Our support team is here to assist you with your certification submission.
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm">
          Contact Support
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Final Confirmation */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Final Confirmation</h2>
        
        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmations.accurate}
              onChange={(e) => handleConfirmationChange('accurate', e.target.checked)}
              className="w-5 h-5 mt-0.5"
            />
            <span className="text-sm text-gray-700">
              I confirm that all information provided is accurate.
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmations.correct}
              onChange={(e) => handleConfirmationChange('correct', e.target.checked)}
              className="w-5 h-5 mt-0.5"
            />
            <span className="text-sm text-gray-700">
              I agree that supporting documents are correct and complete.
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmations.understand}
              onChange={(e) => handleConfirmationChange('understand', e.target.checked)}
              className="w-5 h-5 mt-0.5"
            />
            <span className="text-sm text-gray-700">
              I understand that fees are finalized by the certification authority.
            </span>
          </label>
        </div>
      </div>
    </div>
  )
}

export default SubmissionReview

