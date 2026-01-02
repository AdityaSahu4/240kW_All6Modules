import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Save, CheckCircle } from 'lucide-react'

import CertificationDocuments from './CertificationDocuments'
import CertificationSubmissionSuccess from './CertificationSubmissionSuccess'
import SubmissionReview from './SubmissionReview'

import {
  startCertificationRequest,
  submitCertificationRequest
} from "../../services/certificationApi"

import api from "../../services/api"

function CertificationFlow() {
  const [certificationRequestId, setCertificationRequestId] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    targetRegion: '',
    productName: '',
    productCategory: '',
    standards: ['IEC 61000-4-5', 'CISPR 32', 'IEC 61851'],
    uploadedCertDocs: [],
    additionalNotes: '',
    confirmAccurate: false,
    confirmCorrect: false,
    confirmUnderstand: false,
  })

  useEffect(() => {
    let isMounted = true

    const initializeCertificationRequest = async () => {
      if (certificationRequestId) {
        console.log('Already initialized, skipping...')
        return
      }

      try {
        console.log('Checking for existing draft...')
        const response = await api.get('/certification-request/draft')
        
        if (response.data && response.data.id && isMounted) {
          console.log('✓ Found existing draft:', response.data.id)
          setCertificationRequestId(response.data.id)
          localStorage.setItem("certificationRequestId", response.data.id)
          
          if (response.data.target_region) {
            setFormData(prev => ({
              ...prev,
              targetRegion: response.data.target_region || '',
              productName: response.data.product_name || '',
              productCategory: response.data.product_category || '',
              standards: response.data.standards || prev.standards,
              additionalNotes: response.data.additional_notes || '',
            }))
          }
        }
      } catch (error) {
        if (error.response?.status === 404 && isMounted) {
          console.log('No existing draft found, creating new one...')
          try {
            const res = await startCertificationRequest()
            if (isMounted) {
              console.log('✓ Created new draft:', res.id)
              setCertificationRequestId(res.id)
              localStorage.setItem("certificationRequestId", res.id)
            }
          } catch (createError) {
            console.error('Failed to create draft:', createError)
          }
        } else {
          console.error('Error checking for draft:', error)
        }
      }
    }

    initializeCertificationRequest()

    return () => {
      isMounted = false
    }
  }, [])

  const steps = [
    { id: 'documents', title: 'Certification Documents', component: CertificationDocuments },
    { id: 'review', title: 'Submission Review', component: SubmissionReview },
  ]

  const CurrentStepComponent = steps[currentStep]?.component

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // Submit form
      handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSaveDraft = async () => {
    try {
      await api.post(
        `/certification-request/${certificationRequestId}/details`,
        {
          target_region: formData.targetRegion,
          product_name: formData.productName,
          product_category: formData.productCategory,
          standards: formData.standards,
          estimated_fee_range: "$150 - $400",
          additional_notes: formData.additionalNotes
        }
      )
      alert('Draft saved successfully!')
    } catch (error) {
      console.error('Save draft error:', error)
      alert('Failed to save draft')
    }
  }

  const uploadCertificationDocuments = async () => {
    if (!certificationRequestId) {
      throw new Error("No certification request ID")
    }

    const docs = formData.uploadedCertDocs || []
    if (docs.length === 0) {
      console.log('No documents to upload, skipping...')
      return
    }

    const fd = new FormData()

    docs.forEach(doc => {
      fd.append("files", doc.file)
    })

    docs.forEach(doc => {
      fd.append("doc_types", doc.docType)
    })

    console.log('Uploading documents...', {
      count: docs.length,
      types: docs.map(d => d.docType)
    })

    try {
      const response = await api.post(
        `/certification-request/${certificationRequestId}/upload-documents`,
        fd,
        { 
          headers: { 
            "Content-Type": "multipart/form-data" 
          }
        }
      )
      console.log('Documents uploaded successfully:', response.data)
      return response.data
    } catch (error) {
      console.error('Document upload failed:', error)
      throw error
    }
  }

  const handleSubmit = async () => {
    if (
      !formData.confirmAccurate ||
      !formData.confirmCorrect ||
      !formData.confirmUnderstand
    ) {
      alert('Please confirm all statements before submitting.')
      return
    }

    if (!certificationRequestId) {
      alert('No certification request found. Please refresh and try again.')
      return
    }

    try {
      console.log('Step 1: Saving certification details...')
      await api.post(
        `/certification-request/${certificationRequestId}/details`,
        {
          target_region: formData.targetRegion,
          product_name: formData.productName,
          product_category: formData.productCategory,
          standards: formData.standards,
          estimated_fee_range: "$150 - $400",
          additional_notes: formData.additionalNotes
        }
      )
      console.log('✓ Details saved')

      console.log('Step 2: Uploading documents...')
      await uploadCertificationDocuments()
      console.log('✓ Documents uploaded')

      console.log('Step 3: Submitting request...')
      await submitCertificationRequest(certificationRequestId, {
        selected_labs: [],
        region: { country: formData.targetRegion },
        remarks: formData.additionalNotes
      })
      console.log('✓ Request submitted')

      localStorage.removeItem("certificationRequestId")
      setCurrentStep(steps.length)

    } catch (err) {
      console.error('Submission error:', err)
      
      if (err.response?.status === 404) {
        alert("Certification request not found. The page will reload to create a new request.")
        localStorage.removeItem("certificationRequestId")
        window.location.reload()
      } else if (err.response?.status === 405) {
        alert(`Method not allowed. Please check the API endpoint configuration.`)
      } else if (err.message === 'Network Error') {
        alert(`Network error occurred. Please check:\n- Backend server is running\n- CORS is configured correctly\n- No firewall blocking the request`)
      } else {
        const errorMsg = err.response?.data?.detail || err.message || 'Unknown error'
        alert(`Certification submission failed: ${errorMsg}`)
      }
    }
  }

  const handleEdit = () => {
    setCurrentStep(0) // Go back to first step
  }

  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  // Sidebar navigation
  const sidebarSteps = [
    { title: 'Certification Documents', completed: currentStep > 0 },
    { title: 'Submission Review', completed: currentStep > 1 },
  ]

  if (!certificationRequestId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing certification request...</p>
        </div>
      </div>
    )
  }

  if (currentStep >= steps.length) {
    return <CertificationSubmissionSuccess formData={formData} />
  }

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
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
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
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${
                        index === currentStep ? 'text-gray-900' : 'text-gray-600'
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
                    onEdit={currentStep === 1 ? handleEdit : undefined}
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
                {currentStep === 1 ? (
                  <>
                    <ArrowLeft className="w-4 h-4" />
                    Go Back & Edit
                  </>
                ) : (
                  <>
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </>
                )}
              </button>

              <button
                onClick={handleSaveDraft}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save & Continue Later
              </button>

              <button
                onClick={handleNext}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                {currentStep === steps.length - 1 ? 'Submit for Review' : 'Next'}
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

export default CertificationFlow

