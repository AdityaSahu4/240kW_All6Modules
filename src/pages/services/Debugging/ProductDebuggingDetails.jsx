import { useState } from 'react'
import { Upload, Cloud, FileText, X } from 'lucide-react'

function ProductDebuggingDetails({ formData, updateFormData }) {
  const [selectedTests, setSelectedTests] = useState(formData.selectedDebugTests || [])
  const [customTest, setCustomTest] = useState(formData.customTest || '')
  const [uploadedFiles, setUploadedFiles] = useState(formData.uploadedTestReports || [])
  const [issueDescription, setIssueDescription] = useState(formData.issueDescription || '')

  const testTypes = [
    { id: 'conducted-emi', label: 'Conducted EMI' },
    { id: 'radiated-emi', label: 'Radiated EMI' },
    { id: 'esd', label: 'ESD' },
    { id: 'surge-eft', label: 'Surge / EFT' },
    { id: 'harmonics-flicker', label: 'Harmonics & Flicker' },
    { id: 'rf-emissions', label: 'RF Emissions' },
    { id: 'power-quality', label: 'Power Quality' },
    { id: 'functional', label: 'Functional Testing' },
  ]

  const toggleTest = (testId) => {
    const exists = selectedTests.includes(testId)
    const updated = exists
      ? selectedTests.filter(id => id !== testId)
      : [...selectedTests, testId]

    setSelectedTests(updated)
    updateFormData({ selectedDebugTests: updated })
  }

  const handleCustomTestChange = (value) => {
    setCustomTest(value)
    updateFormData({ customTest: value })
  }

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || [])

    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file
    }))

    const updated = [...uploadedFiles, ...newFiles]
    setUploadedFiles(updated)

    // IMPORTANT — keep real File objects
    updateFormData({ uploadedTestReports: updated })
  }

  const handleRemoveFile = (fileId) => {
    const updated = uploadedFiles.filter(f => f.id !== fileId)
    setUploadedFiles(updated)
    updateFormData({ uploadedTestReports: updated })
  }

  const handleIssueDescriptionChange = (value) => {
    setIssueDescription(value)
    updateFormData({ issueDescription: value })
  }

  return (
    <div className="space-y-6">

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Product Debugging - Targeted Testing</h1>
        <p className="text-gray-600 mt-2">
          Select the testing areas that need debugging and upload your test reports for analysis.
        </p>
      </div>

      {/* Select Testing */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-2">Select Testing to Debug</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            {testTypes.slice(0, 4).map(test => (
              <label key={test.id} className="flex gap-2 p-3 border rounded-lg">
                <input
                  type="checkbox"
                  checked={selectedTests.includes(test.id)}
                  onChange={() => toggleTest(test.id)}
                />
                <span>{test.label}</span>
              </label>
            ))}

            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <input
                type="checkbox"
                checked={selectedTests.includes('custom')}
                onChange={() => toggleTest('custom')}
              />

              <span>Custom Test:</span>

              <input
                type="text"
                value={customTest}
                disabled={!selectedTests.includes('custom')}
                onChange={(e) => handleCustomTestChange(e.target.value)}
                className="flex-1 border px-2 py-1 rounded-lg"
                placeholder="Specify custom test"
              />
            </div>
          </div>

          <div className="space-y-3">
            {testTypes.slice(4).map(test => (
              <label key={test.id} className="flex gap-2 p-3 border rounded-lg">
                <input
                  type="checkbox"
                  checked={selectedTests.includes(test.id)}
                  onChange={() => toggleTest(test.id)}
                />
                <span>{test.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Test Reports */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-xl font-bold mb-2">Upload Test Reports (Mandatory)</h2>

        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <Cloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />

          <label className="px-6 py-2 bg-blue-600 text-white rounded-lg cursor-pointer">
            Choose Files
            <input type="file" multiple className="hidden" onChange={handleFileUpload} />
          </label>

          {uploadedFiles?.length > 0 && (
            <div className="mt-4 space-y-2">
              {uploadedFiles.map(file => (
                <div key={file.id} className="flex justify-between p-2 bg-gray-50 rounded">
                  <div className="flex gap-2">
                    <FileText />
                    <span>{file.name}</span>
                  </div>
                  <button onClick={() => handleRemoveFile(file.id)}>
                    <X />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Issue description */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="text-xl font-bold mb-2">Describe Observed Issues (Optional)</h2>

        <textarea
          value={issueDescription}
          onChange={(e) => handleIssueDescriptionChange(e.target.value)}
          className="w-full border rounded-lg p-3"
          rows={6}
        />
      </div>
    </div>
  )
}

export default ProductDebuggingDetails