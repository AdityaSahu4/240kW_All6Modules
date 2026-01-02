import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Upload, X, DollarSign, Globe, Plus, CheckCircle } from 'lucide-react'

function CertificationDocuments({ formData, updateFormData }) {
  const [targetRegion, setTargetRegion] = useState(formData.targetRegion || '')
  const [productName, setProductName] = useState(formData.productName || '')
  const [productCategory, setProductCategory] = useState(formData.productCategory || '')
  const [standards, setStandards] = useState(
    formData.standards || ['IEC 61000-4-5', 'CISPR 32', 'IEC 61851']
  )
  const [newStandard, setNewStandard] = useState('')
  const [showStandardsDropdown, setShowStandardsDropdown] = useState(false)
  const [uploadedDocs, setUploadedDocs] = useState(
    formData.uploadedCertDocs || []
  )

  const commonStandards = [
    'IEC 61000-4-2', 'IEC 61000-4-3', 'IEC 61000-4-4', 'IEC 61000-4-5', 'IEC 61000-4-6',
    'IEC 61000-4-8', 'IEC 61000-4-11', 'IEC 61000-6-1', 'IEC 61000-6-2', 'IEC 61000-6-3',
    'IEC 61000-6-4', 'IEC 61326-1', 'IEC 61326-2-6', 'IEC 61851-1', 'IEC 61851-21-2',
    'IEC 62040-2', 'IEC 62368-1', 'IEC 60950-1', 'IEC 62479',
    'CISPR 11', 'CISPR 14-1', 'CISPR 14-2', 'CISPR 15', 'CISPR 16', 'CISPR 22', 'CISPR 24', 'CISPR 25', 'CISPR 32', 'CISPR 35',
    'EN 55011', 'EN 55014-1', 'EN 55014-2', 'EN 55015', 'EN 55022', 'EN 55024', 'EN 55032', 'EN 55035',
    'EN 300 328', 'EN 301 489-1', 'EN 301 489-3', 'EN 301 489-17',
    'FCC Part 15', 'FCC Part 18', 'FCC Part 68',
    'ANSI C63.4', 'ANSI C63.10',
    'ISO 7637-2', 'ISO 11452-2', 'ISO 11452-4',
    'ETSI EN 301 511', 'ETSI EN 303 413'
  ]

  const filteredStandards = newStandard.trim()
    ? commonStandards.filter(std => 
        std.toLowerCase().includes(newStandard.toLowerCase()) &&
        !standards.includes(std)
      )
    : []

  const regions = [
    'European Union (CE)',
    'United States (FCC)',
    'Canada (IC)',
    'Taiwan (BSMI)',
    'South Korea (KC)',
    'Brazil (ANATEL)',
    'India (BIS)',
    'Australia (RCM)',
  ]

  const categories = [
    'Electronics - Consumer Devices',
    'Electronics - Industrial Equipment',
    'Telecommunications Equipment',
    'Medical Devices',
    'Automotive Components',
    'IoT Devices',
    'Power Supplies',
    'Other',
  ]

  const documentTypes = [
    { id: 'test-report', name: 'Test Report PDF', icon: FileText, color: 'red' },
    { id: 'technical-file', name: 'Technical File / Product Manual', icon: FileText, color: 'blue' },
    { id: 'additional', name: 'Additional Compliance Documents', icon: FileText, color: 'green' },
  ]

  const handleRegionChange = (value) => {
    setTargetRegion(value)
    updateFormData({ targetRegion: value })
  }

  const handleProductNameChange = (value) => {
    setProductName(value)
    updateFormData({ productName: value })
  }

  const handleCategoryChange = (value) => {
    setProductCategory(value)
    updateFormData({ productCategory: value })
  }

  const handleAddStandard = () => {
    if (newStandard.trim() && !standards.includes(newStandard.trim())) {
      const updated = [...standards, newStandard.trim()]
      setStandards(updated)
      updateFormData({ standards: updated })
      setNewStandard('')
      setShowStandardsDropdown(false)
    }
  }

  const handleSelectStandard = (standard) => {
    const updated = [...standards, standard]
    setStandards(updated)
    updateFormData({ standards: updated })
    setNewStandard('')
    setShowStandardsDropdown(false)
  }

  const handleRemoveStandard = (standard) => {
    const updated = standards.filter(s => s !== standard)
    setStandards(updated)
    updateFormData({ standards: updated })
  }

  const handleFileUpload = (docType, file) => {
    if (!file) return

    const updatedDocs = [
      ...uploadedDocs.filter(d => d.docType !== docType),
      {
        docType,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      }
    ]

    setUploadedDocs(updatedDocs)
    updateFormData({ uploadedCertDocs: updatedDocs })
  }

  const handleRemoveFile = (docType) => {
    const updatedDocs = uploadedDocs.filter(d => d.docType !== docType)
    setUploadedDocs(updatedDocs)
    updateFormData({ uploadedCertDocs: updatedDocs })
  }

  const getColorClasses = (color) => {
    const colorMap = {
      red: 'bg-red-100 text-red-600',
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
    }
    return colorMap[color] || 'bg-gray-100 text-gray-600'
  }

  const getFileType = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase()
    return ext?.toUpperCase() || 'FILE'
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return ''
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Certification Submission</h1>
      </div>

      {/* Product & Region Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-bold text-gray-900">Product & Region Details</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Target Region / Country
            </label>
            <select
              value={targetRegion}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select region</option>
              {regions.map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Product Name
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => handleProductNameChange(e.target.value)}
              placeholder="Enter product name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Product Category
            </label>
            <select
              value={productCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Standards Passed
              {standards.length > 0 && (
                <span className="ml-2 text-xs text-gray-500">({standards.length})</span>
              )}
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {standards.map((standard) => (
                <motion.div
                  key={standard}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                >
                  <span>{standard}</span>
                  <button
                    onClick={() => handleRemoveStandard(standard)}
                    className="ml-1 hover:bg-indigo-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </div>
            <div className="relative">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newStandard}
                    onChange={(e) => {
                      setNewStandard(e.target.value)
                      setShowStandardsDropdown(e.target.value.trim().length > 0)
                    }}
                    onFocus={() => newStandard.trim().length > 0 && setShowStandardsDropdown(true)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddStandard()}
                    placeholder="Enter standard code (e.g., IEC, CISPR, EN)"
                    className="w-full px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  {showStandardsDropdown && filteredStandards.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredStandards.slice(0, 10).map((standard) => (
                        <button
                          key={standard}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault()
                            handleSelectStandard(standard)
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-sm border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          {standard}
                        </button>
                      ))}
                      {filteredStandards.length > 10 && (
                        <div className="px-4 py-2 text-xs text-gray-500 italic bg-gray-50">
                          + {filteredStandards.length - 10} more results. Keep typing to filter...
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleAddStandard}
                  className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1 text-sm whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Estimated Fee Range */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-blue-600" />
            <div>
              <div className="font-bold text-gray-900">$150 - $400</div>
              <div className="text-sm text-gray-600">
                Fees vary by region. Final amount is confirmed by the certification authority.
              </div>
            </div>
          </div>
          <Globe className="w-6 h-6 text-blue-600" />
        </div>
      </div>

      {/* Upload Supporting Documents */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-bold text-gray-900">Upload Supporting Documents</h2>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Upload compliance test reports, lab results, technical files, or declarations.
        </p>

        <div className="space-y-4">
          {documentTypes.map((doc) => {
            const Icon = doc.icon
            const uploaded = uploadedDocs.find(d => d.docType === doc.id)
            
            return (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getColorClasses(doc.color)}`}>
                    {uploaded ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      {doc.name}
                      {uploaded && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Uploaded
                        </span>
                      )}
                    </div>
                    {uploaded ? (
                      <div className="text-sm text-gray-600">
                        {uploaded.name} • {formatFileSize(uploaded.size)} • {getFileType(uploaded.name)}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">No file uploaded</div>
                    )}
                  </div>
                </div>

                {uploaded ? (
                  <button
                    onClick={() => handleRemoveFile(doc.id)}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                  >
                    Remove
                  </button>
                ) : (
                  <label className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer text-sm">
                    Upload
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => handleFileUpload(doc.id, e.target.files?.[0])}
                    />
                  </label>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default CertificationDocuments

