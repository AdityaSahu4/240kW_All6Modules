import { FileText, Upload, CheckCircle, X, Layers, Settings, Cpu, List, Zap, Code } from 'lucide-react'

function DebuggingTechnicalDocuments({ formData, updateFormData }) {
  const documents = [
    { id: 'circuit', name: 'Circuit Diagram/Schematic', icon: Layers, color: 'blue', required: false },
    { id: 'datasheet', name: 'Product datasheet', icon: Settings, color: 'purple', required: false },
    { id: 'pcb', name: 'PCB layout, (Gerber Files)', icon: Cpu, color: 'green', required: false },
    { id: 'manual', name: 'DUT Operation Manual', icon: List, color: 'orange', required: false },
    { id: 'previous', name: 'Previous Reports', icon: Zap, color: 'yellow', required: false },
    { id: 'firmware', name: 'Firmware Details', icon: Code, color: 'indigo', required: false },
  ]

  // ⭐️ SAVE ACTUAL FILE object + metadata
  const handleFileUpload = (docId, file) => {
    if (!file) return

    updateFormData({
      uploadedDocs: {
        ...formData.uploadedDocs,
        [docId]: {
          file,                      // <-- real file
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
        }
      }
    })
  }

  const handleRemoveFile = (docId) => {
    const copy = { ...formData.uploadedDocs }
    delete copy[docId]
    updateFormData({ uploadedDocs: copy })
  }

  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-600',
      purple: 'bg-purple-100 text-purple-600',
      green: 'bg-green-100 text-green-600',
      orange: 'bg-orange-100 text-orange-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      indigo: 'bg-indigo-100 text-indigo-600',
    }
    return colorMap[color] || 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Technical Specification Documents</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="space-y-6">
          {documents.map((doc) => {
            const Icon = doc.icon
            const uploaded = formData.uploadedDocs?.[doc.id]

            return (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getColorClasses(doc.color)}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{doc.name}</span>

                      {doc.required && (
                        <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                          Required
                        </span>
                      )}
                    </div>

                    {uploaded && (
                      <div className="flex items-center gap-2 mt-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-600">{uploaded.name}</span>
                        <span className="text-xs text-gray-400">
                          ({(uploaded.size / 1024).toFixed(0)} KB)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {uploaded ? (
                    <button
                      onClick={() => handleRemoveFile(doc.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  ) : (
                    <label className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          handleFileUpload(doc.id, file)
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Document Guidelines:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Accepted formats: PDF, PNG, JPG, DOCX</li>
                <li>Maximum file size: 50MB per document</li>
                <li>Ensure all documents are clearly labeled and legible</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default DebuggingTechnicalDocuments