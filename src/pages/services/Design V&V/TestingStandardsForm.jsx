import { useState } from 'react'
import { Search, X, ChevronDown } from 'lucide-react'

function TestingStandardsForm({ formData, updateFormData }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)

  const regions = [
    { id: 'india', label: 'India', countries: ['India'] },
    { id: 'europe', label: 'Europe', countries: ['Germany', 'France', 'UK', 'Italy'] },
    { id: 'asia', label: 'Asia', countries: ['China', 'Japan', 'Korea', 'Singapore'] },
  ]

  const recommendedStandards = [
    { id: 'esd-immunity', label: 'ESD immunity: IEC 61000-4-2' },
    { id: 'conducted-rf', label: 'Conducted RF immunity: IEC 61000-4-6' },
  ]

  const preferredStandards = [
    { id: 'cold-test', label: 'Cold Test: IEC 60068-2-1' },
    { id: 'dry-heat', label: 'Dry Heat Test: IEC 60068-2-2' },
    { id: 'damp-steady', label: 'Damp Heat (Steady State): IEC 60068-2-78' },
    { id: 'damp-cyclic', label: 'Damp Heat (Cyclic): IEC 60068-2-30' },
    { id: 'thermal', label: 'Thermal Cycling: IEC 60068-2-14' },
  ]

  const toggleRegion = (regionId) => {
    const current = formData.selectedRegions || []
    if (current.includes(regionId)) {
      updateFormData({ selectedRegions: current.filter(id => id !== regionId) })
    } else {
      updateFormData({ selectedRegions: [...current, regionId] })
    }
  }

  const toggleStandard = (standardId) => {
    const current = formData.selectedStandards || []
    if (current.includes(standardId)) {
      updateFormData({ selectedStandards: current.filter(id => id !== standardId) })
    } else {
      updateFormData({ selectedStandards: [...current, standardId] })
    }
  }

  const removeStandard = (standardId) => {
    const current = formData.selectedStandards || []
    updateFormData({ selectedStandards: current.filter(id => id !== standardId) })
  }

  const getStandardLabel = (standardId) => {
    const allStandards = [...recommendedStandards, ...preferredStandards]
    const standard = allStandards.find(s => s.id === standardId)
    return standard ? standard.label : standardId
  }

  const filteredPreferred = preferredStandards.filter(s =>
    s.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Design Testing Standards</h1>
      </div>

      {/* Region Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-medium text-gray-700 mb-4">Region ---</h3>
        
        <div className="mb-6">
          <div className="relative">
            <button
              onClick={() => setShowCountryDropdown(!showCountryDropdown)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-left flex items-center justify-between hover:bg-gray-50"
            >
              <span className="text-gray-700">Country</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            
            {showCountryDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                {regions.map((region) => (
                  <label
                    key={region.id}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.selectedRegions?.includes(region.id) || false}
                      onChange={() => toggleRegion(region.id)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{region.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <h3 className="text-center font-medium text-gray-700 mb-4">---------- selected Country ----------</h3>
        
        <div className="flex flex-wrap gap-2 justify-center min-h-[40px]">
          {formData.selectedRegions && formData.selectedRegions.length > 0 ? (
            formData.selectedRegions.map((regionId) => {
              const region = regions.find(r => r.id === regionId)
              return (
                <div
                  key={regionId}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg"
                >
                  <span className="font-medium">{region?.label}</span>
                  <button
                    onClick={() => toggleRegion(regionId)}
                    className="p-0.5 hover:bg-purple-200 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )
            })
          ) : (
            <p className="text-gray-400 text-sm">No regions selected</p>
          )}
        </div>
      </div>

      {/* Standards Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-center font-medium text-gray-700 mb-6">---------- Select Standards ----------</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recommended Standards */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Recommended Standards</h4>
            <div className="space-y-2">
              {recommendedStandards.map((standard) => (
                <label
                  key={standard.id}
                  className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.selectedStandards?.includes(standard.id) || false}
                    onChange={() => toggleStandard(standard.id)}
                    className="w-4 h-4 mt-0.5"
                  />
                  <span className="text-sm flex-1">{standard.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Preferred Standards */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Preferred Standards</h4>
            
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {filteredPreferred.map((standard) => (
                <label
                  key={standard.id}
                  className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.selectedStandards?.includes(standard.id) || false}
                    onChange={() => toggleStandard(standard.id)}
                    className="w-4 h-4 mt-0.5"
                  />
                  <span className="text-sm flex-1">{standard.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Standards */}
      {formData.selectedStandards && formData.selectedStandards.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-center font-medium text-gray-700 mb-4">---------- selected Standards ----------</h3>
          
          <div className="flex flex-wrap gap-2">
            {formData.selectedStandards.map((standardId) => (
              <div
                key={standardId}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full"
              >
                <span className="text-sm">{getStandardLabel(standardId)}</span>
                <button
                  onClick={() => removeStandard(standardId)}
                  className="p-0.5 hover:bg-blue-200 rounded-full transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default TestingStandardsForm

