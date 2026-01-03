import { useState } from 'react'
import { Plus, RefreshCw, Waves, Thermometer, Zap, Shield, FileText, Cpu, HelpCircle, Settings, X, DollarSign } from 'lucide-react'

function SimulationDetails({ formData, updateFormData }) {
  const [selectedSimulations, setSelectedSimulations] = useState(formData.selectedSimulations || [])

  const productTypes = [
    {
      id: 'new',
      title: 'New Product',
      icon: Plus,
      description: 'Start simulation for a brand-new design.',
      color: 'blue'
    },
    {
      id: 'retesting',
      title: 'Retesting Existing Product',
      icon: RefreshCw,
      description: 'Upload previous lab failure reports to help us run targeted simulations.',
      color: 'purple'
    }
  ]

  const simulationRequirements = [
    { id: 'emc', label: 'EMC Simulation', icon: Waves, color: 'blue' },
    { id: 'thermal', label: 'Thermal Simulation', icon: Thermometer, color: 'red' },
    { id: 'power-signal', label: 'Power Integrity / Signal Integrity', icon: Zap, color: 'yellow' },
    { id: 'safety', label: 'Safety Margin Checks', icon: Shield, color: 'green' },
    { id: 'compliance', label: 'Compliance Pre-Checks (based on earlier standards)', icon: FileText, color: 'indigo' },
  ]

  const additionalSimulations = [
    { id: 'pcb-emi', label: 'PCB-level EMI Analysis', icon: Cpu, color: 'blue' },
    { id: 'surge', label: 'High-Power Surge Simulation', icon: HelpCircle, color: 'orange' },
    { id: 'mechanical', label: 'Mechanical Stress FEA', icon: Settings, color: 'gray' },
  ]

  const handleProductTypeChange = (typeId) => {
    updateFormData({ productType: typeId })
  }

  const toggleSimulation = (simId) => {
    const current = selectedSimulations
    if (current.includes(simId)) {
      const newSelection = current.filter(id => id !== simId)
      setSelectedSimulations(newSelection)
      updateFormData({ selectedSimulations: newSelection })
    } else {
      const newSelection = [...current, simId]
      setSelectedSimulations(newSelection)
      updateFormData({ selectedSimulations: newSelection })
    }
  }

  const removeSimulation = (simId) => {
    const newSelection = selectedSimulations.filter(id => id !== simId)
    setSelectedSimulations(newSelection)
    updateFormData({ selectedSimulations: newSelection })
  }

  const getSimulationLabel = (simId) => {
    const allSims = [...simulationRequirements, ...additionalSimulations]
    const sim = allSims.find(s => s.id === simId)
    return sim ? sim.label : simId
  }

  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-600 border-blue-200',
      red: 'bg-red-100 text-red-600 border-red-200',
      yellow: 'bg-yellow-100 text-yellow-600 border-yellow-200',
      green: 'bg-green-100 text-green-600 border-green-200',
      indigo: 'bg-indigo-100 text-indigo-600 border-indigo-200',
      orange: 'bg-orange-100 text-orange-600 border-orange-200',
      purple: 'bg-purple-100 text-purple-600 border-purple-200',
      gray: 'bg-gray-100 text-gray-600 border-gray-200',
    }
    return colorMap[color] || 'bg-gray-100 text-gray-600 border-gray-200'
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Simulation Details</h1>
        <p className="text-gray-600 mt-2">Configure your EMC & Safety simulation parameters</p>
      </div>

      {/* Product Type Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Product Type Selection</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {productTypes.map((type) => {
            const Icon = type.icon
            const isSelected = formData.productType === type.id
            return (
              <button
                key={type.id}
                onClick={() => handleProductTypeChange(type.id)}
                className={`p-6 border-2 rounded-xl text-left transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{type.title}</h3>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Simulation Requirements Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Simulation Requirements Overview</h2>
        <p className="text-sm text-gray-600 mb-6">Core simulations recommended based on your selected standards and EUT parameters.</p>
        <div className="grid md:grid-cols-2 gap-4">
          {simulationRequirements.map((req) => {
            const Icon = req.icon
            const isSelected = selectedSimulations.includes(req.id)
            return (
              <button
                key={req.id}
                onClick={() => toggleSimulation(req.id)}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getColorClasses(req.color)}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-gray-900">{req.label}</span>
                </div>
              </button>
            )
          })}
        </div>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            These requirements were automatically generated based on your selected standards and EUT parameters. You can view the detailed breakdown on the next page.
          </p>
        </div>
      </div>

      {/* Additional Simulation Options */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Additional Simulation Options</h2>
        <p className="text-sm text-gray-600 mb-6">Optional simulations that can provide additional insights into your design.</p>
        
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {additionalSimulations.map((sim) => {
            const Icon = sim.icon
            const isSelected = selectedSimulations.includes(sim.id)
            return (
              <button
                key={sim.id}
                onClick={() => toggleSimulation(sim.id)}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getColorClasses(sim.color)}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-sm text-gray-900">{sim.label}</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Selected Simulations */}
        {selectedSimulations.length > 0 && (
          <>
            <div className="text-center font-medium text-gray-700 mb-4">---------- selected Simulations ----------</div>
            <div className="flex flex-wrap gap-2">
              {selectedSimulations.map((simId) => (
                <div
                  key={simId}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full"
                >
                  <span className="text-sm">{getSimulationLabel(simId)}</span>
                  <button
                    onClick={() => removeSimulation(simId)}
                    className="p-0.5 hover:bg-blue-200 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Estimated Price */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-600 mb-1">Estimated Price</div>
            <div className="text-3xl font-bold text-gray-900">$ 4000</div>
            <div className="text-xs text-gray-500 mt-1">
              This is an automatically generated estimate to help you plan your design verification journey. Final pricing may vary based on simulation complexity and additional testing requirements.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SimulationDetails

