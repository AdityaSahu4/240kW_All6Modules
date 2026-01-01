import { useState } from 'react'
import { Settings, Building2, Upload, Cloud, Zap, ChevronDown, FileText, X } from 'lucide-react'

function CalibrationRequest({ formData, updateFormData }) {
  const [calibrationType, setCalibrationType] = useState(formData.calibrationType || 'instrument')
  const [instrumentType, setInstrumentType] = useState(formData.instrumentType || '')
  const [chamberType, setChamberType] = useState(formData.chamberType || '')
  const [equipmentCondition, setEquipmentCondition] = useState(formData.equipmentCondition || 'Good')
  const [modelNumber, setModelNumber] = useState(formData.modelNumber || '')
  const [serialNumber, setSerialNumber] = useState(formData.serialNumber || '')
  const [manufacturer, setManufacturer] = useState(formData.manufacturer || '')
  const [calibrationServices, setCalibrationServices] = useState(formData.calibrationServices || ['full'])
  const [specificParameters, setSpecificParameters] = useState(formData.specificParameters || [])
  const [chamberParameters, setChamberParameters] = useState(formData.chamberParameters || [])
  const [workOrderNumber, setWorkOrderNumber] = useState(formData.workOrderNumber || `WO-2024-${String(Math.floor(Math.random() * 100000)).padStart(6, '0')}`)
  const [jobId, setJobId] = useState(formData.jobId || `JOB-CAL-${String(Math.floor(Math.random() * 100000)).padStart(6, '0')}`)
  const [preferredDate, setPreferredDate] = useState(formData.preferredDate || '')
  const [urgentService, setUrgentService] = useState(formData.urgentService || false)
  const [specialInstructions, setSpecialInstructions] = useState(formData.specialInstructions || '')
  const [uploadedFiles, setUploadedFiles] = useState(formData.uploadedCalibrationFiles || [])
  const [additionalDocuments, setAdditionalDocuments] = useState(formData.additionalDocuments || [])

  // Chamber-specific state
  const [emcFrequencyRange, setEmcFrequencyRange] = useState(formData.emcFrequencyRange || '30 MHz - 6 GHz')
  const [nsaRange, setNsaRange] = useState(formData.nsaRange || '')
  const [svswrLimits, setSvswrLimits] = useState(formData.svswrLimits || '')
  const [fieldUniformityRange, setFieldUniformityRange] = useState(formData.fieldUniformityRange || '')
  const [antennaHeightRange, setAntennaHeightRange] = useState(formData.antennaHeightRange || '')
  const [measurementDistance, setMeasurementDistance] = useState(formData.measurementDistance || '3m')
  const [tempRange, setTempRange] = useState(formData.tempRange || '-40°C to +180°C')
  const [tempUniformity, setTempUniformity] = useState(formData.tempUniformity || '')
  const [humidityRange, setHumidityRange] = useState(formData.humidityRange || '10% - 98% RH')
  const [rampRate, setRampRate] = useState(formData.rampRate || '')
  const [vibrationFreqRange, setVibrationFreqRange] = useState(formData.vibrationFreqRange || '')
  const [amplitudeLevel, setAmplitudeLevel] = useState(formData.amplitudeLevel || '')
  const [vibrationAxis, setVibrationAxis] = useState(formData.vibrationAxis || 'X-axis')
  const [loadCapacity, setLoadCapacity] = useState(formData.loadCapacity || '')
  const [additionalChamberConditions, setAdditionalChamberConditions] = useState(formData.additionalChamberConditions || '')

  const instrumentTypes = [
    'Spectrum Analyzer',
    'Signal Generator',
    'Network Analyzer',
    'Oscilloscope',
    'Multimeter',
    'Power Supply',
    'Frequency Counter',
    'Other',
  ]

  const chamberTypes = [
    'EMC / RF Chamber',
    'Environmental Chamber',
    'Vibration Chamber',
    'Thermal Chamber',
    'Combined Environmental & Vibration',
    'Other',
  ]

  const conditions = ['Good', 'Fair', 'Poor', 'Needs Repair']

  const parameterOptions = [
    'Frequency Accuracy',
    'Amplitude Accuracy',
    'Phase Noise',
    'Harmonic Distortion',
    'Return Loss',
    'Power Level Accuracy',
  ]

  const chamberParameterOptions = [
    'Field Uniformity',
    'SVSWR Measurement',
    'Antenna Factor Validation',
    'Temperature Profile Validation',
    'Vibration Spectrum Verification',
    'NSA Validation',
    'Ambient RF Noise Check',
    'Absorber Performance',
    'Humidity Stability Check',
  ]

  const handleCalibrationTypeChange = (type) => {
    setCalibrationType(type)
    updateFormData({ calibrationType: type })
  }

  const handleServiceToggle = (service) => {
    const current = calibrationServices
    if (current.includes(service)) {
      const updated = current.filter(s => s !== service)
      setCalibrationServices(updated)
      updateFormData({ calibrationServices: updated })
    } else {
      const updated = [...current, service]
      setCalibrationServices(updated)
      updateFormData({ calibrationServices: updated })
    }
  }

  const handleParameterToggle = (param) => {
    const current = specificParameters
    if (current.includes(param)) {
      const updated = current.filter(p => p !== param)
      setSpecificParameters(updated)
      updateFormData({ specificParameters: updated })
    } else {
      const updated = [...current, param]
      setSpecificParameters(updated)
      updateFormData({ specificParameters: updated })
    }
  }

  const handleChamberParameterToggle = (param) => {
    const current = chamberParameters
    if (current.includes(param)) {
      const updated = current.filter(p => p !== param)
      setChamberParameters(updated)
      updateFormData({ chamberParameters: updated })
    } else {
      const updated = [...current, param]
      setChamberParameters(updated)
      updateFormData({ chamberParameters: updated })
    }
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

    const updated = [...uploadedFiles, ...newFiles]
    setUploadedFiles(updated)
    updateFormData({ uploadedCalibrationFiles: updated })

    // Clear the input so the same file can be selected again
    e.target.value = ''
  }

  const handleAdditionalDocumentsUpload = (e) => {
    const files = Array.from(e.target.files || [])

    if (files.length === 0) return

    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file  // Store the actual File object
    }))

    const updated = [...additionalDocuments, ...newFiles]
    setAdditionalDocuments(updated)
    updateFormData({ additionalDocuments: updated })

    // Clear the input so the same file can be selected again
    e.target.value = ''
  }

  const updateField = (field, value) => {
    updateFormData({ [field]: value })
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Calibration Request</h1>
      </div>

      {/* Select Calibration Type */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Select Calibration Type</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => handleCalibrationTypeChange('instrument')}
            className={`p-6 border-2 rounded-xl text-left transition-all ${calibrationType === 'instrument'
              ? 'border-blue-600 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
              }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${calibrationType === 'instrument' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                <Settings className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900 mb-2">Instrument Calibration</h3>
                <p className="text-sm text-gray-600">
                  Calibrate measurement instruments and testing equipment.
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleCalibrationTypeChange('chamber')}
            className={`p-6 border-2 rounded-xl text-left transition-all ${calibrationType === 'chamber'
              ? 'border-blue-600 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
              }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${calibrationType === 'chamber' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                <Building2 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900 mb-2">Chamber Calibration</h3>
                <p className="text-sm text-gray-600">
                  Validate testing chambers and controlled environments.
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Equipment/Chamber Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            {calibrationType === 'instrument' ? 'Equipment Information' : 'Chamber Information'}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {calibrationType === 'instrument' ? (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Instrument Type *
              </label>
              <select
                value={instrumentType}
                onChange={(e) => {
                  setInstrumentType(e.target.value)
                  updateField('instrumentType', e.target.value)
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select instrument type</option>
                {instrumentTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Chamber Type *
              </label>
              <select
                value={chamberType}
                onChange={(e) => {
                  setChamberType(e.target.value)
                  updateField('chamberType', e.target.value)
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select Chamber type</option>
                {chamberTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Equipment Condition *
            </label>
            <select
              value={equipmentCondition}
              onChange={(e) => {
                setEquipmentCondition(e.target.value)
                updateField('equipmentCondition', e.target.value)
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {conditions.map((condition) => (
                <option key={condition} value={condition}>{condition}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Model Number *
            </label>
            <input
              type="text"
              value={modelNumber}
              onChange={(e) => {
                setModelNumber(e.target.value)
                updateField('modelNumber', e.target.value)
              }}
              placeholder="e.g., N9020A"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Serial Number *
            </label>
            <input
              type="text"
              value={serialNumber}
              onChange={(e) => {
                setSerialNumber(e.target.value)
                updateField('serialNumber', e.target.value)
              }}
              placeholder="e.g., SG12345678"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Manufacturer *
            </label>
            <input
              type="text"
              value={manufacturer}
              onChange={(e) => {
                setManufacturer(e.target.value)
                updateField('manufacturer', e.target.value)
              }}
              placeholder="e.g., Keysight Technologies"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Previous Calibration Certificate (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
              <Cloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
              <p className="text-sm text-gray-500 mb-4">PDF, DOC up to 10MB • Multiple files supported</p>
              <label className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer">
                Choose File(s)
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  multiple
                  className="hidden"
                />
              </label>
              {uploadedFiles && uploadedFiles.length > 0 && (
                <p className="text-sm text-green-600 mt-3 font-medium">
                  ✓ {uploadedFiles.length} file(s) selected
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Uploaded Files Display */}
      {uploadedFiles && uploadedFiles.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Uploaded Files</h2>
          </div>

          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const updated = uploadedFiles.filter(f => f.id !== file.id)
                    setUploadedFiles(updated)
                    updateFormData({ uploadedCalibrationFiles: updated })
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Define Calibration Scope */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Define Calibration Scope</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              Calibration Services Required *
            </label>
            <div className="space-y-2">
              {['Full Calibration', 'Functional Verification', 'Adjustment Required'].map((service) => (
                <label key={service} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={calibrationServices.includes(service.toLowerCase().replace(' ', '-'))}
                    onChange={() => handleServiceToggle(service.toLowerCase().replace(' ', '-'))}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">{service}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              Specific Parameters (Optional)
            </label>
            <div className="grid md:grid-cols-3 gap-2">
              {(calibrationType === 'instrument' ? parameterOptions : chamberParameterOptions).map((param) => (
                <label key={param} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={calibrationType === 'instrument'
                      ? specificParameters.includes(param)
                      : chamberParameters.includes(param)}
                    onChange={() => calibrationType === 'instrument'
                      ? handleParameterToggle(param)
                      : handleChamberParameterToggle(param)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">{param}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Instrument/Chamber Calibration Parameters */}
      {calibrationType === 'instrument' ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Instrument Calibration Parameters</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">General Electrical Parameters</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Voltage Range (AC & DC)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 0-1000V"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    onChange={(e) => updateField('voltageRange', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Current Range (AC & DC)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 0-10A"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    onChange={(e) => updateField('currentRange', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Frequency Range
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 10Hz-1MHz"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    onChange={(e) => updateField('frequencyRange', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Power Range (W/VA/VAR)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 0-10kW"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    onChange={(e) => updateField('powerRange', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Chamber Calibration Parameters</h2>

          <div className="space-y-6">
            {/* EMC / RF Chamber Parameters */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  EMC / RF Chamber Parameters
                </h3>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Frequency Range for Calibration
                  </label>
                  <input
                    type="text"
                    value={emcFrequencyRange}
                    onChange={(e) => {
                      setEmcFrequencyRange(e.target.value)
                      updateField('emcFrequencyRange', e.target.value)
                    }}
                    placeholder="30 MHz - 6 GHz"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    NSA Range / Tolerance
                  </label>
                  <input
                    type="text"
                    value={nsaRange}
                    onChange={(e) => {
                      setNsaRange(e.target.value)
                      updateField('nsaRange', e.target.value)
                    }}
                    placeholder="Enter NSA range"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    SVSWR Limits
                  </label>
                  <input
                    type="text"
                    value={svswrLimits}
                    onChange={(e) => {
                      setSvswrLimits(e.target.value)
                      updateField('svswrLimits', e.target.value)
                    }}
                    placeholder="Enter SVSWR limits"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Field Uniformity Range (80 MHz - 6 GHz)
                  </label>
                  <input
                    type="text"
                    value={fieldUniformityRange}
                    onChange={(e) => {
                      setFieldUniformityRange(e.target.value)
                      updateField('fieldUniformityRange', e.target.value)
                    }}
                    placeholder="Enter uniformity range"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Antenna Reference Height Range
                  </label>
                  <input
                    type="text"
                    value={antennaHeightRange}
                    onChange={(e) => {
                      setAntennaHeightRange(e.target.value)
                      updateField('antennaHeightRange', e.target.value)
                    }}
                    placeholder="Min-Max height"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Measurement Distance
                  </label>
                  <select
                    value={measurementDistance}
                    onChange={(e) => {
                      setMeasurementDistance(e.target.value)
                      updateField('measurementDistance', e.target.value)
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="3m">3m</option>
                    <option value="10m">10m</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Environmental Chamber Parameters */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Environmental Chamber Parameters
                </h3>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Temperature Range Validation
                  </label>
                  <input
                    type="text"
                    value={tempRange}
                    onChange={(e) => {
                      setTempRange(e.target.value)
                      updateField('tempRange', e.target.value)
                    }}
                    placeholder="-40°C to +180°C"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Temperature Uniformity Requirement
                  </label>
                  <input
                    type="text"
                    value={tempUniformity}
                    onChange={(e) => {
                      setTempUniformity(e.target.value)
                      updateField('tempUniformity', e.target.value)
                    }}
                    placeholder="*C variation allowed"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Humidity Range Validation (%RH)
                  </label>
                  <input
                    type="text"
                    value={humidityRange}
                    onChange={(e) => {
                      setHumidityRange(e.target.value)
                      updateField('humidityRange', e.target.value)
                    }}
                    placeholder="10% - 98% RH"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Ramp Rate Requirement
                  </label>
                  <input
                    type="text"
                    value={rampRate}
                    onChange={(e) => {
                      setRampRate(e.target.value)
                      updateField('rampRate', e.target.value)
                    }}
                    placeholder="*C/min"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Vibration Chamber Parameters */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Vibration Chamber Parameters
                </h3>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Frequency Range (Hz)
                  </label>
                  <input
                    type="text"
                    value={vibrationFreqRange}
                    onChange={(e) => {
                      setVibrationFreqRange(e.target.value)
                      updateField('vibrationFreqRange', e.target.value)
                    }}
                    placeholder="Enter frequency range"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Amplitude / Acceleration Level
                  </label>
                  <input
                    type="text"
                    value={amplitudeLevel}
                    onChange={(e) => {
                      setAmplitudeLevel(e.target.value)
                      updateField('amplitudeLevel', e.target.value)
                    }}
                    placeholder="Enter amplitude level"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Axis of Vibration
                  </label>
                  <select
                    value={vibrationAxis}
                    onChange={(e) => {
                      setVibrationAxis(e.target.value)
                      updateField('vibrationAxis', e.target.value)
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="X-axis">X-axis</option>
                    <option value="Y-axis">Y-axis</option>
                    <option value="Z-axis">Z-axis</option>
                    <option value="Multi-axis">Multi-axis</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Load Capacity
                  </label>
                  <input
                    type="text"
                    value={loadCapacity}
                    onChange={(e) => {
                      setLoadCapacity(e.target.value)
                      updateField('loadCapacity', e.target.value)
                    }}
                    placeholder="Enter load capacity"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Additional Chamber Conditions */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Additional Chamber Conditions
              </label>
              <textarea
                value={additionalChamberConditions}
                onChange={(e) => {
                  setAdditionalChamberConditions(e.target.value)
                  updateField('additionalChamberConditions', e.target.value)
                }}
                placeholder="Please include absorber type, chamber layout, cable routing requirements, special RF shielding considerations, EUT positioning requirements..."
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Work Order & Job Registration */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Work Order & Job Registration</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Work Order Number
            </label>
            <input
              type="text"
              value={workOrderNumber}
              onChange={(e) => {
                setWorkOrderNumber(e.target.value)
                updateField('workOrderNumber', e.target.value)
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Job ID
            </label>
            <input
              type="text"
              value={jobId}
              onChange={(e) => {
                setJobId(e.target.value)
                updateField('jobId', e.target.value)
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Preferred Calibration Date *
            </label>
            <input
              type="date"
              value={preferredDate}
              onChange={(e) => {
                setPreferredDate(e.target.value)
                updateField('preferredDate', e.target.value)
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="font-semibold text-gray-900">Urgent Service Required?</p>
              <p className="text-sm text-gray-600">Priority processing with expedited timeline</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={urgentService}
              onChange={(e) => {
                setUrgentService(e.target.checked)
                updateField('urgentService', e.target.checked)
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Special Instructions or Site Guidelines
            </label>
            <textarea
              value={specialInstructions}
              onChange={(e) => {
                setSpecialInstructions(e.target.value)
                updateField('specialInstructions', e.target.value)
              }}
              placeholder="Please include any special handling requirements, safety protocols, or site-specific guidelines our team should be aware of..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Additional Documents
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
              <Cloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
              <p className="text-sm text-gray-500 mb-4">PDF, DOC up to 10MB • Multiple files supported</p>
              <label className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer">
                Choose File(s)
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx"
                  onChange={handleAdditionalDocumentsUpload}
                  className="hidden"
                />
              </label>
              {additionalDocuments && additionalDocuments.length > 0 && (
                <p className="text-sm text-green-600 mt-3 font-medium">
                  ✓ {additionalDocuments.length} file(s) selected
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Documents Display */}
      {additionalDocuments && additionalDocuments.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Additional Documents</h2>
          </div>

          <div className="space-y-2">
            {additionalDocuments.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const updated = additionalDocuments.filter(f => f.id !== file.id)
                    setAdditionalDocuments(updated)
                    updateFormData({ additionalDocuments: updated })
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CalibrationRequest
