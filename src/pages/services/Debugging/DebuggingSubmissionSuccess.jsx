import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  CheckCircle,
  Settings,
  FileText,
  Eye,
  ArrowLeft,
  Clock,
  Info,
} from "lucide-react"

import { fetchFullDebuggingRequest } from "../debuggingApi"

function DebuggingSubmissionSuccess({ requestId }) {
  const navigate = useNavigate()

  const [showSubmitted, setShowSubmitted] = useState(false)
  const [submitted, setSubmitted] = useState({})
  const [loading, setLoading] = useState(true)

  // =====================================================
  // 📥 FETCH REAL DATA FROM BACKEND
  // =====================================================
  useEffect(() => {
    const load = async () => {
      try {
        if (!requestId) {
          setLoading(false)
          return
        }

        const data = await fetchFullDebuggingRequest(requestId)

        setSubmitted({
          ...data.product,

          uploadedDocs: data.documents || [],

          // ✅ FIX: correct nested backend path
          issueDescription:
            data.issue_review?.data?.issue_description || "",

          uploadedTestReports: data.issue_review?.reports || [],
        })
      } catch (err) {
        console.error("Failed to load submission:", err)
      }

      setLoading(false)
    }

    load()
  }, [requestId])

  // ---------------- Dummy status UI (unchanged) ----------------
  const detectedIssues = [
    { id: 1, text: "Memory leak in user authentication module", color: "red" },
    { id: 2, text: "Database connection timeout errors", color: "orange" },
    { id: 3, text: "API response delays in payment gateway", color: "yellow" },
    { id: 4, text: "Frontend rendering inconsistencies", color: "blue" },
  ]

  const submittedReports = [
    { id: 1, name: "error_logs_2024_11_28.json" },
    { id: 2, name: "performance_metrics.csv" },
    { id: 3, name: "user_feedback_report.pdf" },
  ]

  const nextSteps = [
    { title: "Diagnostics Completed", status: "completed", icon: CheckCircle },
    { title: "Debugging & Implementation", status: "in-progress", icon: Settings },
    { title: "Retesting", status: "pending", icon: FileText },
    { title: "Final Report Delivery", status: "pending", icon: FileText },
  ]

  const getStatusColor = (status) =>
    status === "completed"
      ? "text-green-600"
      : status === "in-progress"
      ? "text-blue-600"
      : "text-gray-400"

  const getStatusText = (status) =>
    status === "completed"
      ? "✓ Finished"
      : status === "in-progress"
      ? "In Progress"
      : "Pending"

  if (loading) return <div className="p-6">Loading…</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">

          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-gray-100 rounded-xl p-6 sticky top-8">
              <div className="space-y-4">
                {[
                  { title: "Product Details", completed: true },
                  { title: "Technical Specification Documents", completed: true },
                  { title: "Product Debugging Details", completed: true },
                  { title: "Request under Review", completed: true },
                  { title: "Issue Identification & Review", completed: true },
                  { title: "Submit Request", completed: true, active: true },
                ].map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.active
                          ? "bg-blue-600 text-white"
                          : "bg-green-500 text-white"
                      }`}
                    >
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <p className={`text-sm ${step.active ? "text-gray-900" : "text-gray-600"}`}>
                      {step.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <div className="flex-1">

            {/* ================= VIEW SUBMITTED DATA ================= */}
            {showSubmitted && (
              <div className="bg-gray-50 border rounded-lg p-6 mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="text-blue-600" />
                  <h3 className="font-bold text-gray-900">Submitted Project Details</h3>
                </div>

                <div className="grid md:grid-cols-3 gap-4">

                  <div className="bg-white border rounded-lg p-4">
                    <p className="font-semibold">Product Overview</p>
                    <p className="text-sm">Name: {submitted?.name || "—"}</p>
                    <p className="text-sm">Model: {submitted?.model_no || "—"}</p>
                    <p className="text-sm">Quantity: {submitted?.quantity || "—"}</p>
                  </div>

                  <div className="bg-white border rounded-lg p-4">
                    <p className="font-semibold">Manufacturer</p>
                    <p className="text-sm">{submitted?.manufacturer || "—"}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Serial: {submitted?.serial_no || "—"}
                    </p>
                  </div>

                  <div className="bg-white border rounded-lg p-4">
                    <p className="font-semibold">Electrical Specs</p>
                    <p className="text-sm">Voltage: {submitted?.supply_voltage || "—"}</p>
                    <p className="text-sm">Frequency: {submitted?.frequency || "—"}</p>
                    <p className="text-sm">Current: {submitted?.current || "—"}</p>
                  </div>

                  <div className="bg-white border rounded-lg p-4">
                    <p className="font-semibold">Mechanical Specs</p>
                    <p className="text-sm">Weight: {submitted?.weight || "—"}</p>
                    <p className="text-sm">
                      Dimensions:{" "}
                      {submitted?.length
                        ? `${submitted.length} x ${submitted.width} x ${submitted.height}`
                        : "—"}
                    </p>
                  </div>

                  {/* Submitted files */}
                  <div className="bg-white border rounded-lg p-4">
                    <p className="font-semibold">Submitted Documents</p>

                    {submitted?.uploadedDocs?.length ? (
                      submitted.uploadedDocs.map((d, i) => (
                        <p key={i} className="text-sm">
                          • {d.filename || d.file_name || d.name || "Document"}
                        </p>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No documents uploaded</p>
                    )}
                  </div>

                  {/* Issue + reports */}
                  <div className="bg-white border rounded-lg p-4">
                    <p className="font-semibold">Debug Issue & Reports</p>

                    <p className="text-sm mb-2">
                      Issue: {submitted?.issueDescription || "—"}
                    </p>

                    {submitted?.uploadedTestReports?.length ? (
                      submitted.uploadedTestReports.map((r, i) => (
                        <p key={i} className="text-sm">
                          • {r.filename || r.file_name || r.name || "Report"}
                        </p>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No reports uploaded</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ============ ORIGINAL STATUS PAGE (unchanged) ============ */}
            {!showSubmitted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl border border-gray-200 p-8 mb-8"
              >
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-green-500 rounded-full mx-auto flex items-center justify-center mb-4 shadow-lg">
                    <CheckCircle className="w-12 h-12 text-white" />
                  </div>

                  <h1 className="text-3xl font-bold mb-2">
                    Diagnostics & Debugging Initiated
                  </h1>

                  <p className="text-gray-600">
                    Our engineering team has begun evaluating the issues identified from your test reports.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gray-50 border rounded-xl p-6">
                    <h3 className="font-bold mb-3">Detected Issues</h3>
                    {detectedIssues.map(issue => (
                      <div key={issue.id} className="flex gap-2 mb-1 text-sm">
                        <span
                          className={`w-2 h-2 rounded-full mt-2 ${
                            issue.color === "red"
                              ? "bg-red-500"
                              : issue.color === "orange"
                              ? "bg-orange-500"
                              : issue.color === "yellow"
                              ? "bg-yellow-500"
                              : "bg-blue-500"
                          }`}
                        />
                        {issue.text}
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Settings className="text-blue-600" />
                      <h3 className="font-bold">Service Path Selected</h3>
                    </div>
                    <div className="bg-white border p-3 rounded mb-2">
                      <p className="font-semibold">Full Debugging + Fix Implementation</p>
                    </div>
                    <p className="text-sm text-gray-600">
                      Complete analysis with code fixes and optimization.
                    </p>
                  </div>

                  <div className="bg-gray-50 border rounded-xl p-6">
                    <h3 className="font-bold mb-3">Your Submitted Reports</h3>
                    {submittedReports.map(rep => (
                      <div
                        key={rep.id}
                        className="flex gap-2 border p-2 rounded mb-2 bg-white text-sm"
                      >
                        <FileText />
                        {rep.name}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
                  <div className="flex gap-3">
                    <Clock className="text-blue-600" />
                    <div>
                      <p className="text-sm text-blue-800">
                        You don't need to take any further action.
                      </p>
                      <p className="text-xs text-blue-700">
                        Our engineers will notify you once your debugging report is ready.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex justify-between">
              <button
                onClick={() => navigate("/customer/dashboard")}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg"
              >
                <ArrowLeft className="inline w-4 h-4 mr-2" />
                Back to Dashboard
              </button>

              <button
                onClick={() => setShowSubmitted(prev => !prev)}
                className="px-6 py-3 border rounded-lg"
              >
                <Eye className="inline w-4 h-4 mr-2" />
                {showSubmitted ? "View Project Status" : "View Submitted Data"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DebuggingSubmissionSuccess
