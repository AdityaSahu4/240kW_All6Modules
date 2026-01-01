import {
    startCalibrationRequest,
    saveCalibrationProductDetails,
    saveCalibrationRequirements,
    saveCalibrationStandards,
    saveCalibrationLabSelectionDraft,
    submitCalibrationRequest
} from "../../services/calibrationApi"
import api from "../../services/api"
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Save, CheckCircle } from 'lucide-react'
import CalibrationRequest from './CalibrationRequest'
import CalibrationDetails from './CalibrationDetails'
import CalibrationReview from './CalibrationReview'

function CalibrationFlow() {
    const navigate = useNavigate()
    const [calibrationRequestId, setCalibrationRequestId] = useState(null)
    const [currentStep, setCurrentStep] = useState(0)
    const [formData, setFormData] = useState({
        // Calibration Request Data
        calibrationType: 'instrument',
        instrumentType: '',
        chamberType: '',
        equipmentCondition: 'Good',
        modelNumber: '',
        serialNumber: '',
        manufacturer: '',
        calibrationServices: ['full'],
        specificParameters: [],
        chamberParameters: [],
        workOrderNumber: `WO-2024-${String(Math.floor(Math.random() * 100000)).padStart(6, '0')}`,
        jobId: `JOB-CAL-${String(Math.floor(Math.random() * 100000)).padStart(6, '0')}`,
        preferredDate: '',
        urgentService: false,
        specialInstructions: '',
        uploadedCalibrationFiles: [],

        // Additional chamber parameters
        emcFrequencyRange: '30 MHz - 6 GHz',
        nsaRange: '',
        svswrLimits: '',
        fieldUniformityRange: '',
        antennaHeightRange: '',
        measurementDistance: '3m',
        tempRange: '-40°C to +180°C',
        tempUniformity: '',
        humidityRange: '10% - 98% RH',
        rampRate: '',
        vibrationFreqRange: '',
        amplitudeLevel: '',
        vibrationAxis: 'X-axis',
        loadCapacity: '',
        additionalChamberConditions: '',

        // Review confirmations
        approvePlan: false,
        understandTests: false,
        confirmAccurate: false,
        confirmApprove: false,
        confirmUnderstand: false,
        uploadedFinalDocs: [],
    })

    const steps = [
        { id: 'request', title: 'Calibration Request', component: CalibrationRequest },
        { id: 'details', title: 'Calibration Details', component: CalibrationDetails },
        { id: 'review', title: 'Review & Submit', component: CalibrationReview },
    ]

    const stepPaths = [
        'calibration-request',
        'calibration-details',
        'review-submit',
    ]

    const { step } = useParams()

    // Create / restore calibration request
    useEffect(() => {
        const init = async () => {
            const storedId = localStorage.getItem("calibrationRequestId")

            if (storedId) {
                try {
                    await api.get(`/calibration-request/${storedId}`)
                    setCalibrationRequestId(Number(storedId))
                    return
                } catch {
                    localStorage.removeItem("calibrationRequestId")
                }
            }

            const res = await startCalibrationRequest()
            setCalibrationRequestId(res.id)
            localStorage.setItem("calibrationRequestId", res.id)
        }

        init()
    }, [])

    // Sync URL step ↔ currentStep
    useEffect(() => {
        if (!step) return

        const index = stepPaths.indexOf(step)
        if (index !== -1) {
            setCurrentStep(index)
        }
    }, [step])

    const CurrentStepComponent = steps[currentStep]?.component

    const handleNext = async () => {
        if (!calibrationRequestId) return

        try {
            // STEP 1 – Calibration Request (save as product details)
            if (currentStep === 0) {
                await saveCalibrationProductDetails(calibrationRequestId, {
                    eut_name: formData.instrumentType || formData.chamberType,
                    eut_quantity: "1",
                    manufacturer: formData.manufacturer,
                    model_no: formData.modelNumber,
                    serial_no: formData.serialNumber,
                    supply_voltage: "",
                    operating_frequency: formData.emcFrequencyRange || "",
                    current: "",
                    weight: "",
                    dimensions: { length: "", width: "", height: "" },
                    power_ports: "",
                    signal_lines: "",
                    software_name: "",
                    software_version: "",
                    industry: [formData.calibrationType],
                    industry_other: formData.equipmentCondition,
                    preferred_date: formData.preferredDate,
                    notes: formData.specialInstructions
                })

                // Save calibration requirements
                await saveCalibrationRequirements(calibrationRequestId, {
                    test_type: formData.calibrationType,
                    selected_tests: formData.calibrationServices
                })
            }

            // STEP 2 – Calibration Details
            if (currentStep === 1) {
                // Save any additional details if needed
                console.log("Calibration details saved")
            }

            // STEP 3 – Review & Submit
            if (currentStep === 2) {
                // Validate confirmations
                if (!formData.confirmAccurate || !formData.confirmApprove || !formData.confirmUnderstand) {
                    alert('Please confirm all statements before submitting.')
                    return
                }

                await submitCalibrationRequest(calibrationRequestId, {
                    selected_labs: [],
                    region: null,
                    remarks: formData.specialInstructions
                })

                navigate("/services/calibration/submission-success")
                return
            }

            // Navigate to next step
            if (currentStep === steps.length - 1) {
                return
            }

            const next = currentStep + 1
            setCurrentStep(next)
            navigate(`/services/calibration/${stepPaths[next]}`)

        } catch (err) {
            console.error(err)
            alert("Failed to save step")
        }
    }

    const handlePrevious = () => {
        if (currentStep > 0) {
            const prevStep = currentStep - 1
            setCurrentStep(prevStep)
            navigate(`/services/calibration/${stepPaths[prevStep]}`)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    const handleSaveDraft = async () => {
        if (!calibrationRequestId) {
            alert('No calibration request ID found. Please start a new request.')
            return
        }

        try {
            // Save to localStorage as backup
            localStorage.setItem('calibration_draft', JSON.stringify(formData))
            alert('Draft saved successfully!')
        } catch (err) {
            console.error('Failed to save draft:', err)
            alert('Failed to save draft. Please try again.')
        }
    }

    const updateFormData = (updates) => {
        setFormData(prev => ({ ...prev, ...updates }))
    }

    // Sidebar navigation
    const sidebarSteps = [
        { title: 'Calibration Request', completed: currentStep > 0 },
        { title: 'Calibration Details', completed: currentStep > 1 },
        { title: 'Review & Submit', completed: currentStep > 2 },
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
                                                ? 'bg-purple-600 text-white'
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
                                        calibrationRequestId={calibrationRequestId}
                                        onEdit={currentStep === 2 ? () => setCurrentStep(0) : undefined}
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
                                Save & Continue Later
                            </button>

                            <button
                                onClick={handleNext}
                                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                            >
                                {currentStep === steps.length - 1 ? 'Submit Calibration Request' : 'Next'}
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

export default CalibrationFlow
