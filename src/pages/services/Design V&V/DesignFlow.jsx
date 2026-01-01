import {
  startDesignRequest,
  saveDesignProductDetails,
  saveDesignTechnicalDocuments,
  saveDesignRequirements,
  saveDesignStandards,
  saveDesignLabSelectionDraft,
  submitDesignRequest
} from "../../services/designApi"
import { fetchFullDesignRequest } from "../../services/designApi"
import api from "../../services/api"
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Save, CheckCircle } from 'lucide-react'
import ProductDetails from './ProductDetails'
import TechnicalDocuments from './TechnicalDocuments'
import TestingRequirementsForm from './TestingRequirementsForm'
import TestingStandardsForm from './TestingStandardsForm'
import LabSelection from './LabSelection'


function DesignFlow() {
  const navigate = useNavigate()
  const [designRequestId, setDesignRequestId] = useState(null)
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

    // Testing Requirements
    testType: 'final',
    selectedTests: [],

    // Testing Standards
    selectedRegions: [],
    selectedStandards: [],

    // Lab Selection
    selectedLabs: [],
    region: { country: null, state: null, city: null },

    // Documents
    uploadedDocs: {}
  })

  const steps = [
    { id: 'product', title: 'Product Details', component: ProductDetails },
    { id: 'documents', title: 'Technical Specification Documents', component: TechnicalDocuments },
    { id: 'requirements', title: 'Design Testing Requirements', component: TestingRequirementsForm },
    { id: 'standards', title: 'Design Testing Standards', component: TestingStandardsForm },
    { id: 'lab', title: 'Lab selection and Review', component: LabSelection },
  ]
  const stepPaths = [
    'product-details',
    'technical-documents',
    'design-requirements',
    'design-standards',
    'lab-selection',
  ]
  const { step } = useParams()

  // Create / restore design request
  useEffect(() => {
    const init = async () => {
      const storedId = localStorage.getItem("designRequestId")

      if (storedId) {
        try {
          await api.get(`/design-request/${storedId}`)
          setDesignRequestId(Number(storedId))
          return
        } catch {
          localStorage.removeItem("designRequestId")
        }
      }

      const res = await startDesignRequest()
      setDesignRequestId(res.id)
      localStorage.setItem("designRequestId", res.id)
    }

    init()
  }, [])



  // Sync URL step ↔ currentStep (MANDATORY)
  useEffect(() => {
    if (!step) return

    const index = stepPaths.indexOf(step)
    if (index !== -1) {
      setCurrentStep(index)
    }
  }, [step])



  const CurrentStepComponent = steps[currentStep]?.component

  const handleNext = async () => {
    if (!designRequestId) return

    try {
      // STEP 1 – Product
      if (currentStep === 0) {
        await saveDesignProductDetails(designRequestId, {
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
          preferred_date: formData.preferredDate,
          notes: formData.additionalNotes
        })

      }

      // STEP 2 – Technical Documents
      if (currentStep === 1) {
        try {
          // Check if there are any documents to upload
          const uploadedDocs = formData.uploadedDocs || {}
          const docEntries = Object.entries(uploadedDocs)

          if (docEntries.length > 0) {
            // Create FormData for file upload
            const formData = new FormData()

            // Add files and their types
            docEntries.forEach(([docType, docData]) => {
              if (docData.file) {
                formData.append('files', docData.file)
                formData.append('doc_types', docType)
              }
            })

            // Upload files to the new endpoint
            const response = await api.post(
              `/design-request/${designRequestId}/upload-documents`,
              formData,
              {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
              }
            )

            console.log('Files uploaded successfully:', response.data)
          }
        } catch (err) {
          console.error("Failed to upload technical documents", err)
          alert("Failed to upload documents. Please try again.")
          return
        }
      }

      // STEP 3 – Requirements
      if (currentStep === 2) {
        try {
          await saveDesignRequirements(designRequestId, {
            test_type: formData.testType,
            selected_tests: formData.selectedTests
          })
        } catch (err) {
          console.error("Failed to save design requirements", err)
          alert("Failed to save design requirements")
          return
        }
      }

      // STEP 4 – Design Standards
      if (currentStep === 3) {
        try {
          await saveDesignStandards(designRequestId, {
            regions: formData.selectedRegions,
            standards: formData.selectedStandards
          })
        } catch (err) {
          console.error("Failed to save design standards", err)
          alert("Failed to save design standards")
          return
        }
      }

      // STEP 5 – Lab Selection
      if (currentStep === 4) {
        try {
          console.log("DEBUG selectedLabs:", formData.selectedLabs)
          console.log("DEBUG region:", formData.region)

          if (!formData.selectedLabs || formData.selectedLabs.length === 0) {
            alert("Please select at least one lab")
            return
          }

          // Prepare region data - only send if at least one field has a value
          const regionData = formData.region &&
            (formData.region.country || formData.region.state || formData.region.city)
            ? formData.region
            : null

          await submitDesignRequest(designRequestId, {
            selected_labs: formData.selectedLabs,
            region: regionData,
            remarks: formData.additionalNotes
          })

          navigate("/services/design/submission-success")
          return

        } catch (err) {
          console.error("Failed to submit design request", err)
          alert("Failed to submit design request")
          return
        }
      }



      // Navigate
      if (currentStep === steps.length - 1) {
        await handleSubmit()
        return
      }

      const next = currentStep + 1
      setCurrentStep(next)
      navigate(`/services/design/${stepPaths[next]}`)

    } catch (err) {
      console.error(err)
      alert("Failed to save step")
    }
  }


  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1
      setCurrentStep(prevStep)
      navigate(`/services/design/${stepPaths[prevStep]}`)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSaveDraft = async () => {
    if (!designRequestId) {
      alert('No design request ID found. Please start a new request.')
      return
    }

    try {
      // Prepare region data - only send if at least one field has a value
      const regionData = formData.region &&
        (formData.region.country || formData.region.state || formData.region.city)
        ? formData.region
        : null

      // Save lab selection data if we're on the lab selection step
      if (currentStep === 4) {
        await saveDesignLabSelectionDraft(designRequestId, {
          selected_labs: formData.selectedLabs || [],
          region: regionData,
          remarks: formData.additionalNotes || null
        })
      }

      // Also save to localStorage as backup
      localStorage.setItem('design_draft', JSON.stringify(formData))
      alert('Draft saved successfully!')
    } catch (err) {
      console.error('Failed to save draft:', err)
      alert('Failed to save draft. Please try again.')
    }
  }

  const handleSubmit = async () => {
    // Prepare region data - only send if at least one field has a value
    const regionData = formData.region &&
      (formData.region.country || formData.region.state || formData.region.city)
      ? formData.region
      : null

    await submitDesignRequest(designRequestId, {
      selected_labs: formData.selectedLabs,
      region: regionData,
      remarks: formData.additionalNotes
    })

    navigate("/services/design/submission-success")
  }


  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  // Sidebar navigation
  const sidebarSteps = [
    { title: 'Product Details', completed: currentStep > 0 },
    { title: 'Technical Specification Documents', completed: currentStep > 1 },
    { title: 'Design Testing Requirements', completed: currentStep > 2 },
    { title: 'Design Testing Standards', completed: currentStep > 3 },
    { title: 'Lab selection and Review', completed: currentStep > 4 },
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
                  <div
                    key={index}
                    className="flex items-start gap-3"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${index === currentStep
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
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${index === currentStep ? 'text-gray-900' : 'text-gray-600'
                        }`}>
                        {step.title}
                      </div>
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
                    designRequestId={designRequestId}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>

              <button
                onClick={handleSaveDraft}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save as Draft
              </button>

              <button
                onClick={handleNext}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                {currentStep === steps.length - 1 ? 'Get Quotation' : 'Next'}
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

export default DesignFlow

