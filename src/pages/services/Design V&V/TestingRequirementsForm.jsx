import { X } from 'lucide-react'

function TestingRequirementsForm({ formData, updateFormData }) {
  const testTypes = [
    { id: 'pre-compliance', label: 'Pre-Compliance Test' },
    { id: 'final', label: 'Final Testing / Compliance Testing' },
    { id: 'ilc', label: 'ILC (Inter Laboratory Comparison)' },
  ]

  const testCategories = {
    'EMC Test': [
      { id: 'esd-immunity', label: 'ESD immunity', expandable: true },
      { id: 'radiated-rf', label: 'Radiated RF immunity', expandable: true },
      { id: 'eft-burst', label: 'EFT/Burst immunity', expandable: true },
      { id: 'surge', label: 'Surge immunity', expandable: true },
      { id: 'conducted-rf', label: 'Conducted RF immunity', expandable: true },
      { id: 'power-freq', label: 'Power-frequency magnetic field immunity', expandable: true },
    ],
    'Environmental Test': [
      { id: 'cold-test', label: 'Cold test', expandable: true },
      { id: 'dry-heat', label: 'Dry heat test', expandable: true },
      { id: 'damp-heat-steady', label: 'Damp heat (steady state)', expandable: true },
      { id: 'damp-heat-cyclic', label: 'Damp heat (cyclic)', expandable: true },
      { id: 'thermal-cycling', label: 'Thermal cycling', expandable: true },
      { id: 'temp-shock', label: 'Temperature shock', expandable: true },
      { id: 'vibration', label: 'Vibration (sinusoidal)', expandable: true },
    ],
    'Safety Test (Electrical & Mechanical)': [
      { id: 'insulation', label: 'Insulation resistance test', expandable: true },
      { id: 'dielectric', label: 'Dielectric withstand / Hi-pot test', expandable: true },
      { id: 'clearance', label: 'Clearance & creepage distance check', expandable: true },
      { id: 'leakage', label: 'Leakage current test', expandable: true },
      { id: 'overcurrent', label: 'Overcurrent protection verification', expandable: true },
      { id: 'overvoltage', label: 'Overvoltage protection verification', expandable: true },
    ],
    'Functional Safety Test': [
      { id: 'safety-function', label: 'Safety function verification', expandable: true },
      { id: 'fault-injection', label: 'Fault injection test (hardware)', expandable: true },
      { id: 'diagnostic', label: 'Diagnostic coverage validation', expandable: true },
      { id: 'redundancy', label: 'Redundancy/safe state behavior test', expandable: true },
      { id: 'software-self', label: 'Software self-test verification', expandable: true },
      { id: 'lifecycle', label: 'Safety lifecycle documentation review', expandable: true },
    ],
  }

  const handleTestTypeChange = (typeId) => {
    updateFormData({ testType: typeId })
  }

  const toggleTest = (testId) => {
    const current = formData.selectedTests || []
    if (current.includes(testId)) {
      updateFormData({ selectedTests: current.filter(id => id !== testId) })
    } else {
      updateFormData({ selectedTests: [...current, testId] })
    }
  }

  const removeTest = (testId) => {
    const current = formData.selectedTests || []
    updateFormData({ selectedTests: current.filter(id => id !== testId) })
  }

  const getTestLabel = (testId) => {
    for (const category of Object.values(testCategories)) {
      const test = category.find(t => t.id === testId)
      if (test) return test.label
    }
    return testId
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Design Testing Requirements</h1>
      </div>

      {/* Test Type Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-center font-medium text-gray-700 mb-4">---------- select test type ----------</h3>
        
        <div className="flex flex-wrap gap-4 justify-center">
          {testTypes.map((type) => (
            <label
              key={type.id}
              className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={formData.testType === type.id}
                onChange={() => handleTestTypeChange(type.id)}
                className="w-4 h-4"
              />
              <span className="font-medium">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Test Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-center font-medium text-gray-700 mb-6">---------- select tests ----------</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {Object.entries(testCategories).map(([category, tests]) => (
            <div key={category} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">{category}</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {tests.map((test) => (
                  <label
                    key={test.id}
                    className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.selectedTests?.includes(test.id) || false}
                      onChange={() => toggleTest(test.id)}
                      className="w-4 h-4 mt-0.5"
                    />
                    <span className="text-sm flex-1">{test.label}</span>
                    {test.expandable && (
                      <span className="text-gray-400 text-xs">▼</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Tests */}
      {formData.selectedTests && formData.selectedTests.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-center font-medium text-gray-700 mb-4">---------- selected tests ----------</h3>
          
          <div className="flex flex-wrap gap-2">
            {formData.selectedTests.map((testId) => (
              <div
                key={testId}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full"
              >
                <span className="text-sm">{getTestLabel(testId)}</span>
                <button
                  onClick={() => removeTest(testId)}
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

export default TestingRequirementsForm

