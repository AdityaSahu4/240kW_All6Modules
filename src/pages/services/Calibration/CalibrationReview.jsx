import { useState } from 'react'
import { FileText, Edit, Settings, Target, List, Upload, Cloud, CheckCircle, HelpCircle, User, MapPin, Phone, Mail, Send, X } from 'lucide-react'

function CalibrationReview({ formData, updateFormData, onEdit }) {
  const [confirmations, setConfirmations] = useState({
    accurate: formData.confirmAccurate || false,
    approve: formData.confirmApprove || false,
    understand: formData.confirmUnderstand || false,
  })
  const [uploadedFinalDocs, setUploadedFinalDocs] = useState(formData.uploadedFinalDocs || [])

  const handleConfirmationChange = (key, value) => {
    const updated = { ...confirmations, [key]: value }
    setConfirmations(updated)
    updateFormData({
      confirmAccurate: updated.accurate,
      confirmApprove: updated.approve,
      confirmUnderstand: updated.understand,
    })
  }

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || [])

    if (files.length === 0) return

    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file  // Store the actual File object
    }))

    const updated = [...uploadedFinalDocs, ...newFiles]
    setUploadedFinalDocs(updated)
    updateFormData({ uploadedFinalDocs: updated })

    // Clear the input so the same file can be selected again
    e.target.value = ''
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return ''
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Review & Submission</h1>
      </div>

      {/* Work Order Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-bold text-gray-900">Work Order Summary</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Work Order Number</label>
            <div className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-semibold">
              {formData.workOrderNumber || 'N/A'}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Job ID</label>
            <div className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-semibold flex items-center gap-2">
              <Settings className="w-4 h-4" />
              {formData.jobId || 'N/A'}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Calibration Type</label>
            <div className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {formData.calibrationType === 'instrument' ? 'Instrument' : 'Chamber'}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Calibration Scope</label>
            <div className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-semibold flex items-center gap-2">
              <List className="w-4 h-4" />
              {formData.calibrationServices?.includes('full') ? 'Full' : 'Partial'}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Preferred Date</label>
            <div className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {formData.preferredDate ? new Date(formData.preferredDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set'}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Service Mode</label>
            <div className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              On-Site
            </div>
          </div>
        </div>
      </div>

      {/* Customer & Location Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">Customer & Location Details</h2>
          </div>
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
            >
              <Edit className="w-4 h-4" />
              Edit Details
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Customer Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-700">Name</label>
                <div className="mt-1 text-gray-900">John Anderson</div>
              </div>
              <div>
                <label className="text-sm text-gray-700">Company</label>
                <div className="mt-1 text-gray-900">TechCorp Solutions</div>
              </div>
              <div>
                <label className="text-sm text-gray-700">Email</label>
                <div className="mt-1 text-gray-900">j.anderson@techcorp.com</div>
              </div>
              <div>
                <label className="text-sm text-gray-700">Phone</label>
                <div className="mt-1 text-gray-900">+1 (555) 123-4567</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Calibration Location</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-700">Site Address</label>
                <div className="mt-1 text-gray-900">
                  1234 Industrial Blvd, Suite 200, Shivajinagar, Pune - 78701
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-700">Contact Person</label>
                <div className="mt-1 text-gray-900">Mike Thompson - Lab Manager</div>
              </div>
              <div>
                <label className="text-sm text-gray-700">Access Notes</label>
                <div className="mt-1 text-gray-900">
                  Building access requires badge. Contact security at front desk.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Equipment Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-bold text-gray-900">Equipment Details</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-700">
                {formData.calibrationType === 'instrument' ? 'Instrument Type' : 'Chamber Type'}
              </label>
              <div className="mt-1 text-gray-900">
                {formData.calibrationType === 'instrument'
                  ? (formData.instrumentType || 'Not specified')
                  : (formData.chamberType || 'Not specified')}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-700">Model Number</label>
              <div className="mt-1 text-gray-900">{formData.modelNumber || 'N/A'}</div>
            </div>
            <div>
              <label className="text-sm text-gray-700">Serial Number</label>
              <div className="mt-1 text-gray-900">{formData.serialNumber || 'N/A'}</div>
            </div>
            <div>
              <label className="text-sm text-gray-700">Manufacturer</label>
              <div className="mt-1 text-gray-900">{formData.manufacturer || 'N/A'}</div>
            </div>
            <div>
              <label className="text-sm text-gray-700">Equipment Condition</label>
              <div className="mt-1 text-gray-900">{formData.equipmentCondition || 'N/A'} - Minor cosmetic wear</div>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-700">Previous Certificate</label>
            {formData.uploadedCalibrationFiles && formData.uploadedCalibrationFiles.length > 0 ? (
              <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-600" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {formData.uploadedCalibrationFiles[0].name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatFileSize(formData.uploadedCalibrationFiles[0].size)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-2 text-sm text-gray-400">No previous certificate uploaded</div>
            )}
          </div>
        </div>
      </div>

      {/* Calibration Scope Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Target className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-bold text-gray-900">Calibration Scope Summary</h2>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-700">Scope Selected</label>
            <div className="mt-2">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                {formData.calibrationServices?.includes('full') ? 'Full Calibration' : 'Partial Calibration'}
              </span>
            </div>
          </div>
          {formData.specialInstructions && (
            <div>
              <label className="text-sm text-gray-700">Special Instructions</label>
              <div className="mt-1 text-gray-900">{formData.specialInstructions}</div>
            </div>
          )}
        </div>
      </div>

      {/* Tests to Be Performed */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <List className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-bold text-gray-900">Tests to Be Performed</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {(formData.calibrationType === 'chamber' ? [
            'Field Uniformity Measurement',
            'SVSWR (Site Voltage Standing Wave Ratio)',
            'NSA (Normalized Site Attenuation) Validation',
            'Antenna Factor Calibration',
            'Temperature Profile Validation',
            'Humidity Stability Check',
            'Vibration Spectrum Verification',
            'Absorber Performance Test',
            'Ambient RF Noise Check',
          ] : [
            'Frequency Accuracy',
            'Amplitude Accuracy',
            'RBW / Bandwidth Verification',
            'Linearity Checks',
            'Noise Floor Measurement',
            'Trigger / Time-Base Accuracy',
            'Functional Checks',
          ]).map((test, index) => (
            <div key={index} className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-700">{test}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Final Document Upload */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Upload className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-bold text-gray-900">Final Document Upload</h2>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
          <Cloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Drop files here or click to browse</p>
          <p className="text-sm text-gray-500 mb-4">
            Purchase Order (PO) • Previous Calibration Certificate • Device/Chamber Photos • Layout/Setup Diagrams • Site Access Documents (Gate Pass, NDA) • Special Instructions (PDF/Doc)
          </p>
          <p className="text-xs text-gray-400 mb-4">
            Supported formats: PDF, DOC, JPG, PNG (Max 10MB each)
          </p>
          <label className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer">
            Choose File(s)
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          {uploadedFinalDocs && uploadedFinalDocs.length > 0 && (
            <p className="text-sm text-green-600 mt-3 font-medium">
              ✓ {uploadedFinalDocs.length} file(s) selected
            </p>
          )}
        </div>

        {uploadedFinalDocs.length > 0 && (
          <div className="mt-4 space-y-2">
            {uploadedFinalDocs.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const updated = uploadedFinalDocs.filter(f => f.id !== file.id)
                    setUploadedFinalDocs(updated)
                    updateFormData({ uploadedFinalDocs: updated })
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Terms & Approval */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Terms & Approval</h2>
        </div>

        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmations.accurate}
              onChange={(e) => handleConfirmationChange('accurate', e.target.checked)}
              className="w-5 h-5 mt-0.5"
            />
            <span className="text-sm text-gray-700">
              I confirm all details provided are accurate.
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmations.approve}
              onChange={(e) => handleConfirmationChange('approve', e.target.checked)}
              className="w-5 h-5 mt-0.5"
            />
            <span className="text-sm text-gray-700">
              I approve the calibration plan.
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
              I understand additional charges may apply for repairs/adjustments.
            </span>
          </label>
        </div>
      </div>
    </div>
  )
}

export default CalibrationReview

