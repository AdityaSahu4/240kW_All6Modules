import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ArrowRight, Save, CheckCircle } from "lucide-react"

import ProductDetails from "./ProductDetails"
import DebuggingTechnicalDocuments from "./DebuggingTechnicalDocuments"
import ProductDebuggingDetails from "./ProductDebuggingDetails"
import RequestUnderReview from "./RequestUnderReview"
import IssueIdentificationReview from "./IssueIdentificationReview"
import DebuggingSubmissionSuccess from "./DebuggingSubmissionSuccess"

import {
  startDebuggingRequest,
  saveDebugProductDetails,
  uploadDebugDocuments,
  saveDebugIssueReview,
  submitDebuggingRequest,
} from "../debuggingApi"

function DebuggingFlow() {

  const [requestId, setRequestId] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)

  const [formData, setFormData] = useState({

    // Product
    eutName: "",
    eutQuantity: "",
    manufacturer: "",
    modelNo: "",
    serialNo: "",
    supplyVoltage: "",
    operatingFrequency: "",
    current: "",
    weight: "",
    dimensions: { length: "", width: "", height: "" },
    powerPorts: "",
    signalLines: "",
    softwareName: "",
    softwareVersion: "",

    industry: [],
    industryOther: "",
    preferredDate: "",
    additionalNotes: "",

    // Debugging
    selectedDebugTests: [],
    customTest: "",
    uploadedTestReports: [],
    issueDescription: "",

    engineerComments: "",
    issueCategory: "EMI / EMC Category",
    severityRating: "Low Severity",
    confidenceScore: 75,
    debugPath: "full",

    uploadedDocs: {}
  })

  const steps = [
    { id: "product", title: "Product Details", component: ProductDetails },
    { id: "documents", title: "Technical Specification Documents", component: DebuggingTechnicalDocuments },
    { id: "debugging", title: "Product Debugging Details", component: ProductDebuggingDetails },
    { id: "review", title: "Request under Review", component: RequestUnderReview },
    { id: "issue", title: "Issue Identification & Review", component: IssueIdentificationReview },
  ]

  const CurrentStepComponent = steps[currentStep]?.component

  // ------------------------------------------------
  // 🔄 Restore requestId if page was refreshed
  // ------------------------------------------------
  useEffect(() => {
    const stored = localStorage.getItem("debugging_request_id")
    if (stored && !requestId) setRequestId(stored)
  }, [requestId])

  // ------------------------------------------------
  // MAIN NEXT HANDLER
  // ------------------------------------------------
  const handleNext = async () => {
    try {
      // STEP 0 — create request + save product
      if (currentStep === 0) {

        let id = requestId

        // create request if first time
        if (!id) {
          const res = await startDebuggingRequest()
          id = res.id
          setRequestId(id)

          // 🔒 persist so submission page + reload works
          localStorage.setItem("debugging_request_id", id)
        }

        await saveDebugProductDetails(id, {
          name: formData.eutName,
          quantity: Number(formData.eutQuantity || 0),
          manufacturer: formData.manufacturer,
          model_no: formData.modelNo,
          serial_no: formData.serialNo,
          supply_voltage: formData.supplyVoltage,
          frequency: formData.operatingFrequency,
          current: formData.current,
          weight: formData.weight,
          length: formData.dimensions.length,
          width: formData.dimensions.width,
          height: formData.dimensions.height,
          ports: formData.powerPorts,
          interfaces: formData.signalLines,
          software_name: formData.softwareName,
          software_version: formData.softwareVersion,
          application: formData.industry,
          preferred_date: formData.preferredDate,
          notes: formData.additionalNotes
        })
      }

      // STEP 1 — upload docs
      if (currentStep === 1) {
        const docs = Object.values(formData.uploadedDocs || {})
          .map(d => d?.file)
          .filter(Boolean)

        if (docs.length) {
          await uploadDebugDocuments(requestId, docs)
        }
      }

      // STEP 2 — issue review + reports
      if (currentStep === 2) {
        await saveDebugIssueReview(requestId, {
          data: {
            issue_description: formData.issueDescription,
            debug_path: formData.debugPath,
            tests: formData.selectedDebugTests,
            custom_test: formData.customTest || null,
            severity: formData.severityRating
          },
          reports: (formData.uploadedTestReports || [])
            .map(f => f?.file)
            .filter(Boolean)
        })
      }

      // FINAL — submit
      if (currentStep === steps.length - 1) {
        await submitDebuggingRequest(requestId)

        // clear draft tracking after full submit
        localStorage.removeItem("debugging_request_id")

        setCurrentStep(steps.length)
        return
      }

      setCurrentStep(s => s + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })

    } catch (err) {
      console.error("Debugging flow error:", err)
      alert("Something went wrong — check console.")
    }
  }

  const handlePrevious = () =>
    currentStep > 0 && setCurrentStep(s => s - 1)

  const handleSaveDraft = () => {
    localStorage.setItem("debugging_draft", JSON.stringify(formData))
    alert("Draft saved successfully!")
  }

  const updateFormData = updates =>
    setFormData(prev => ({ ...prev, ...updates }))

  const sidebarSteps = [
    { title: "Product Details", completed: currentStep > 0 },
    { title: "Technical Specification Documents", completed: currentStep > 1 },
    { title: "Product Debugging Details", completed: currentStep > 2 },
    { title: "Request under Review", completed: currentStep > 3 },
    { title: "Issue Identification & Review", completed: currentStep > 4 },
    { title: "Submit Request", completed: currentStep > 5 },
  ]

  if (currentStep >= steps.length) {
    return <DebuggingSubmissionSuccess requestId={requestId} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">

          {/* SIDEBAR */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-gray-100 rounded-xl p-6 sticky top-8">
              <div className="space-y-4">
                {sidebarSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index === currentStep
                          ? "bg-blue-600 text-white"
                          : step.completed
                          ? "bg-green-500 text-white"
                          : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {step.completed
                        ? <CheckCircle className="w-5 h-5" />
                        : <span className="text-sm">{index + 1}</span>
                      }
                    </div>
                    <div className="flex-1 text-sm">{step.title}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* MAIN */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <CurrentStepComponent
                  formData={formData}
                  updateFormData={updateFormData}
                  requestId={requestId}
                  onNext={currentStep === 3 ? handleNext : undefined}
                />
              </motion.div>
            </AnimatePresence>

            {currentStep !== 3 && (
              <div className="mt-8 flex justify-between">

                <button onClick={handlePrevious} className="px-6 py-3 border rounded-lg">
                  <ArrowLeft /> Previous
                </button>

                <button onClick={handleSaveDraft} className="px-6 py-3 border rounded-lg">
                  <Save /> Save as Draft
                </button>

                <button onClick={handleNext} className="px-6 py-3 bg-blue-600 text-white rounded-lg">
                  {currentStep === steps.length - 1
                    ? "Submit Request"
                    : currentStep === 2
                    ? "Continue to Diagnostics →"
                    : "Next"}
                  <ArrowRight />
                </button>

              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

export default DebuggingFlow
