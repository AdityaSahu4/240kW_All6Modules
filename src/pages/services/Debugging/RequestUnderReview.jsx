import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import {
  Search,
  ArrowLeft,
  Eye,
  AlertCircle,
  ArrowRight,
  Info
} from "lucide-react"

import { fetchFullDebuggingRequest } from "../debuggingApi"

function RequestUnderReview({ onNext, requestId }) {
  const navigate = useNavigate()

  const [showSubmitted, setShowSubmitted] = useState(false)
  const [submitted, setSubmitted] = useState({})
  const [loading, setLoading] = useState(false)

  // 🔄 Fetch data when toggling submitted view ON
  useEffect(() => {
    if (!showSubmitted || !requestId) return

    const load = async () => {
      try {
        setLoading(true)

        const data = await fetchFullDebuggingRequest(requestId)

        setSubmitted({
          ...data.product,
          uploadedDocs: data.documents || [],
          issueDescription: data.issue_review?.data?.issue_description || "",
          uploadedTestReports: data.issue_review?.reports || [],
        })
      } catch (err) {
        console.error("Failed to load submission:", err)
      }

      setLoading(false)
    }

    load()
  }, [showSubmitted, requestId])

  return (
    <div className="space-y-6">

      {/* ================== STATUS VIEW ================== */}
      {!showSubmitted && (
        <>
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-blue-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Your Debugging Request is Under Review
            </h1>

            {requestId && (
              <p className="text-sm text-gray-500 mt-1">
                Request ID: <strong>{requestId}</strong>
              </p>
            )}

            <p className="text-lg text-gray-600 mt-3">
              Our engineers are analyzing your test reports and identifying the root cause of the issue.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800">
                <strong>No action needed from your side.</strong> We'll notify you when diagnostics is complete.
              </p>
            </div>
          </div>
        </>
      )}

      {/* ================== SUBMITTED DATA VIEW ================== */}
      {showSubmitted && (
        <div className="bg-gray-50 border rounded-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="text-blue-600" />
            <h3 className="font-bold text-gray-900">Submitted Project Details</h3>
          </div>

          {loading ? (
            <p className="text-sm">Loading…</p>
          ) : (
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

              <div className="bg-white border rounded-lg p-4">
                <p className="font-semibold">Submitted Documents</p>
                {submitted?.uploadedDocs?.length
                  ? submitted.uploadedDocs.map((d, i) => (
                      <p key={i} className="text-sm">
                        • {d.filename || d.name || "Document"}
                      </p>
                    ))
                  : <p className="text-sm text-gray-500">No documents uploaded</p>}
              </div>

              <div className="bg-white border rounded-lg p-4">
                <p className="font-semibold">Debug Issue & Reports</p>

                <p className="text-sm mb-2">
                  Issue: {submitted?.issueDescription || "—"}
                </p>

                {submitted?.uploadedTestReports?.length
                  ? submitted.uploadedTestReports.map((r, i) => (
                      <p key={i} className="text-sm">
                        • {r.filename || r.name || "Report"}
                      </p>
                    ))
                  : <p className="text-sm text-gray-500">No reports uploaded</p>}
              </div>

            </div>
          )}
        </div>
      )}

      {/* ================== FOOTER BUTTONS ================== */}
      <div className="flex items-center justify-between">

        <button
          onClick={() => navigate("/customer/dashboard")}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="flex items-center gap-4">

          <button
            className="px-6 py-3 border rounded-lg flex items-center gap-2"
            onClick={() => setShowSubmitted(prev => !prev)}
            disabled={!requestId}
          >
            <Eye className="w-4 h-4" />
            {showSubmitted ? "View Project Status" : "View Submitted Data"}
          </button>

          {onNext && (
            <button
              onClick={onNext}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center gap-2"
            >
              Proceed to Diagnostics
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default RequestUnderReview
