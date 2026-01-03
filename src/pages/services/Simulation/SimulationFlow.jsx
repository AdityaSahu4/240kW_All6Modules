import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Save, CheckCircle } from 'lucide-react'
import ProductDetails from './ProductDetails'
import TechnicalDocuments from './TechnicalDocuments'
import SimulationDetails from './SimulationDetails'
import api from "../../services/api"
import {
  startSimulationRequest,
  saveSimulationProductDetails,
  saveSimulationTechnicalDocuments,
  saveSimulationDetails,
  submitSimulationRequest
} from "../../services/simulationApi"

function SimulationFlow() {
  const navigate = useNavigate()
  const { step } = useParams()

  const [simulationRequestId, setSimulationRequestId] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    // Product Details
    eutName: '',
    eutQuantity: '',
    manufacturer: '',
    modelNo: '',
    serialNo: '',
    supplyVoltage: '',
    operatingFrequency: '',
    current: '',
    weight: '',
    dimensions: { length: '', width: '', height: '' },
    powerPorts: '',
    signalLines: '',
    softwareName: '',
    softwareVersion: '',
    
    // Industry/Application
    industry: [],
    industryOther: '',
    
    // Testing dates
    preferredDate: '',
    additionalNotes: '',
    
    // Simulation Details
    productType: 'new',
    selectedSimulations: [],
    
    // Documents
    uploadedDocs: {}
  })

  const steps = [
    { id: 'product', title: 'Product Details', component: ProductDetails },
    { id: 'documents', title: 'Technical Specification Documents', component: TechnicalDocuments },
    { id: 'simulation', title: 'Simulation Details', component: SimulationDetails },
  ]

  const stepPaths = [
    'product-details',
    'technical-documents',
    'simulation-details',
  ]

  useEffect(() => {
    const init = async () => {
      const storedId = localStorage.getItem("simulationRequestId")

      if (storedId) {
        try {
          await api.get(`/simulation-request/${storedId}`)
          setSimulationRequestId(Number(storedId))
          return
        } catch {
          localStorage.removeItem("simulationRequestId")
        }
      }

      const res = await startSimulationRequest()
      setSimulationRequestId(res.id)
      localStorage.setItem("simulationRequestId", res.id)
    }

    init()
  }, [])

  useEffect(() => {
    if (!step) return
    const index = stepPaths.indexOf(step)
    if (index !== -1) setCurrentStep(index)
  }, [step])

  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleNext = async () => {
    if (!simulationRequestId) return

    if (currentStep === 0) {
      await saveSimulationProductDetails(simulationRequestId, {
        eut_name: formData.eutName,
        eut_quantity: formData.eutQuantity,
        manufacturer: formData.manufacturer,
        model_no: formData.modelNo,
        serial_no: formData.serialNo,
        supply_voltage: formData.supplyVoltage,
        operating_frequency: formData.operatingFrequency,
        current: formData.current,
        weight: formData.weight,
        dimensions: formData.dimensions,
        power_ports: formData.powerPorts,
        signal_lines: formData.signalLines,
        software_name: formData.softwareName,
        software_version: formData.softwareVersion,
        industry: formData.industry,
        industry_other: formData.industryOther,
        notes: formData.additionalNotes
      })
    }

    if (currentStep === 1) {
      const documentsPayload = Object.entries(formData.uploadedDocs).map(
        ([docType, file]) => ({
          doc_type: docType,
          file_name: file.name || file,
          file_path: "",
          file_size: file.size || 0
        })
      )

      await saveSimulationTechnicalDocuments(simulationRequestId, {
        documents: documentsPayload
      })
    }

    if (currentStep === 2) {
      await saveSimulationDetails(simulationRequestId, {
        product_type: formData.productType,
        selected_simulations: formData.selectedSimulations
      })

      await submitSimulationRequest(simulationRequestId)
      localStorage.setItem(
        "lastSubmittedSimulationRequestId",
        simulationRequestId
      )

      navigate("/services/simulation/submission-success", {
        state: { simulationRequestId }
      })
      localStorage.removeItem("simulationRequestId")
      return
    }
    const next = currentStep + 1
    setCurrentStep(next)
    navigate(`/services/simulation/${stepPaths[next]}`)
  }

  const handlePrevious = () => {
    if (currentStep === 0) return
    const prev = currentStep - 1
    setCurrentStep(prev)
    navigate(`/services/simulation/${stepPaths[prev]}`)
  }

  const handleSaveDraft = () => {
    localStorage.setItem('simulation_draft', JSON.stringify(formData))
  }

  const CurrentStepComponent = steps[currentStep]?.component
    // Sidebar navigation
  const sidebarSteps = [
    { title: 'Product Details', completed: currentStep > 0 },
    { title: 'Technical Specification Documents', completed: currentStep > 1 },
    { title: 'Simulation Details', completed: currentStep > 2 },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-gray-100 rounded-xl p-6 sticky top-8">
              <div className="space-y-4">
                {sidebarSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index === currentStep
                        ? 'bg-blue-600 text-white'
                        : step.completed
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {step.completed ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div className="text-sm font-medium">
                      {step.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {CurrentStepComponent && (
                  <CurrentStepComponent
                    formData={formData}
                    updateFormData={updateFormData}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="px-6 py-3 border border-gray-300 rounded-lg flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>

              <button
                onClick={handleSaveDraft}
                className="px-6 py-3 border border-gray-300 rounded-lg flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save as Draft
              </button>

              <button
                onClick={handleNext}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center gap-2"
              >
                {currentStep === steps.length - 1 ? 'Submit for Simulation' : 'Next'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Footer */}
            <div className="mt-8 flex items-center justify-end gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-gray-900">Help</a>
              <a href="#" className="hover:text-gray-900">Privacy</a>
              <a href="#" className="hover:text-gray-900">Terms</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SimulationFlow

