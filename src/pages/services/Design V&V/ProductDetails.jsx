import { Code, Zap, Cable } from 'lucide-react'

function ProductDetails({ formData, updateFormData }) {
  const handleChange = (field, value) => {
    updateFormData({ [field]: value })
  }

  const handleDimensionChange = (axis, value) => {
    updateFormData({
      dimensions: { ...formData.dimensions, [axis]: value }
    })
  }

  const industries = [
    'Telecommunication',
    'Medical',
    'Automotive',
    'Industrial',
    'Consumer Electronics',
    'IoT',
    'Aerospace & Defense',
    'Energy & Power',
    'Others'
  ]

  const toggleIndustry = (industry) => {
    const current = formData.industry || []
    if (current.includes(industry)) {
      updateFormData({ industry: current.filter(i => i !== industry) })
    } else {
      updateFormData({ industry: [...current, industry] })
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Design V&V Details</h1>
      </div>

      {/* Basic Equipment Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Cable className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Basic Equipment Information</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Name of EUT *
            </label>
            <input
              type="text"
              value={formData.eutName || ''}
              onChange={(e) => handleChange('eutName', e.target.value)}
              placeholder="Exact product name or identifier"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Quantity of EUT *
            </label>
            <input
              type="text"
              value={formData.eutQuantity || ''}
              onChange={(e) => handleChange('eutQuantity', e.target.value)}
              placeholder="Number of units"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Manufacturer / Make & Address *
            </label>
            <textarea
              value={formData.manufacturer || ''}
              onChange={(e) => handleChange('manufacturer', e.target.value)}
              placeholder="Official manufacturer details and complete address"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Model No. *
            </label>
            <input
              type="text"
              value={formData.modelNo || ''}
              onChange={(e) => handleChange('modelNo', e.target.value)}
              placeholder="Model number or variant"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Serial No. *
            </label>
            <input
              type="text"
              value={formData.serialNo || ''}
              onChange={(e) => handleChange('serialNo', e.target.value)}
              placeholder="Serial or batch number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Technical Specifications */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-yellow-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Technical Specifications</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Supply Voltage *
            </label>
            <input
              type="text"
              value={formData.supplyVoltage || ''}
              onChange={(e) => handleChange('supplyVoltage', e.target.value)}
              placeholder="e.g., 220V AC ± 10%"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Operating Frequency
            </label>
            <input
              type="text"
              value={formData.operatingFrequency || ''}
              onChange={(e) => handleChange('operatingFrequency', e.target.value)}
              placeholder="e.g., 2.4 GHz - 2.5 GHz"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Current *
            </label>
            <input
              type="text"
              value={formData.current || ''}
              onChange={(e) => handleChange('current', e.target.value)}
              placeholder="e.g., 2.5A max"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Weight (Kg) *
            </label>
            <input
              type="text"
              value={formData.weight || ''}
              onChange={(e) => handleChange('weight', e.target.value)}
              placeholder="Physical weight"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Dimensions (L x W x H) *
            </label>
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                value={formData.dimensions?.length || ''}
                onChange={(e) => handleDimensionChange('length', e.target.value)}
                placeholder="Length (mm)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                value={formData.dimensions?.width || ''}
                onChange={(e) => handleDimensionChange('width', e.target.value)}
                placeholder="Width (mm)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                value={formData.dimensions?.height || ''}
                onChange={(e) => handleDimensionChange('height', e.target.value)}
                placeholder="Height (mm)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Connectivity & Interfaces */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <Cable className="w-5 h-5 text-purple-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Connectivity & Interfaces</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              No. of Power Ports & Connector Type *
            </label>
            <input
              type="text"
              value={formData.powerPorts || ''}
              onChange={(e) => handleChange('powerPorts', e.target.value)}
              placeholder="e.g., 1x IEC C14 inlet, 1x DC barrel jack (5.5mm)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              No. of Signal Lines & Connector Type *
            </label>
            <input
              type="text"
              value={formData.signalLines || ''}
              onChange={(e) => handleChange('signalLines', e.target.value)}
              placeholder="e.g., 2x USB-A, 1x Ethernet RJ-45, 1x HDMI"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Software Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <Code className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Software Information</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Name of the Software
            </label>
            <input
              type="text"
              value={formData.softwareName || ''}
              onChange={(e) => handleChange('softwareName', e.target.value)}
              placeholder="Software/firmware name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Software Version No.
            </label>
            <input
              type="text"
              value={formData.softwareVersion || ''}
              onChange={(e) => handleChange('softwareVersion', e.target.value)}
              placeholder="e.g., v2.1.4 or build 20251201"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Industry / Application */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Cable className="w-5 h-5 text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Industry / Application</h2>
        </div>
        
        <p className="text-sm text-gray-600 mb-6">
          Select the industry or application category where the EUT will be used. This helps identify relevant standards and testing requirements.
        </p>

        <div className="grid grid-cols-3 gap-4">
          {industries.map((industry) => (
            <label
              key={industry}
              className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={formData.industry?.includes(industry) || false}
                onChange={() => toggleIndustry(industry)}
                className="w-4 h-4"
              />
              <span className="text-sm">{industry}</span>
            </label>
          ))}
        </div>

        {formData.industry?.includes('Others') && (
          <div className="mt-4">
            <input
              type="text"
              value={formData.industryOther || ''}
              onChange={(e) => handleChange('industryOther', e.target.value)}
              placeholder="If Others, please specify..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}
      </div>

      {/* Preferable Testing Dates */}
      {/* <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Code className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Preferable Testing Dates</h2>
        </div>
        
        <p className="text-sm text-gray-600 mb-6">
          Select your preferred dates for testing or submission. These dates help the lab schedule resources and allocate test slots.
        </p>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Preferred Testing Date
          </label>
          <input
            type="date"
            value={formData.preferredDate || ''}
            onChange={(e) => handleChange('preferredDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Additional Requirements / Notes
          </label>
          <textarea
            value={formData.additionalNotes || ''}
            onChange={(e) => handleChange('additionalNotes', e.target.value)}
            placeholder="Any special requirements, rush processing needs, or additional notes..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div> */}
    </div>
  )
}

export default ProductDetails

