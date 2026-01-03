// src/pages/services/debuggingApi.js
import api from "./api"

/**
 * -------------------------------------------------------------
 * 1️⃣ CREATE NEW DEBUGGING REQUEST
 * -------------------------------------------------------------
 */
export const startDebuggingRequest = async () => {
  const res = await api.post("/debugging-request/")
  return res.data        // -> { id, status }
}

/**
 * -------------------------------------------------------------
 * 2️⃣ SAVE PRODUCT DETAILS (JSON)
 * -------------------------------------------------------------
 */
export const saveDebugProductDetails = (id, data) =>
  api.post(`/debugging-request/${id}/product`, data)

/**
 * -------------------------------------------------------------
 * 3️⃣ UPLOAD TECHNICAL DOCUMENTS (multipart/form-data)
 * -------------------------------------------------------------
 * Important: DO NOT manually set Content-Type.
 * The browser must set boundary headers automatically.
 */
export const uploadDebugDocuments = (id, files) => {
  const formData = new FormData()

  files.forEach(file => {
    if (file) formData.append("files", file, file.name)
  })

  return api.post(`/debugging-request/${id}/documents`, formData)
}

/**
 * -------------------------------------------------------------
 * 4️⃣ ISSUE REVIEW + TEST REPORT UPLOAD
 * -------------------------------------------------------------
 */
export const saveDebugIssueReview = (id, issue) => {
  const formData = new FormData()

  formData.append("data", JSON.stringify(issue.data || {}))

  if (issue.reports && issue.reports.length) {
    issue.reports.forEach(f => {
      if (f) formData.append("reports", f, f.name)
    })
  }

  return api.post(`/debugging-request/${id}/issue-review`, formData)
}

/**
 * -------------------------------------------------------------
 * 5️⃣ SUBMIT REQUEST
 * -------------------------------------------------------------
 */
export const submitDebuggingRequest = (id) =>
  api.post(`/debugging-request/${id}/submit`)

/**
 * -------------------------------------------------------------
 * 6️⃣ FETCH A FULL DEBUGGING REQUEST
 * -------------------------------------------------------------
 * Used by review / submitted pages to display real backend data.
 */
export const fetchDebugRequest = async (id) => {
  const res = await api.get(`/debugging-request/${id}`)
  return res.data
}

// 🚀 FETCH FULL REQUEST (product + docs + issue review)
export const fetchFullDebuggingRequest = async (id) => {
  const res = await api.get(`/debugging-request/${id}/full`)
  return res.data
}

/**
 * -------------------------------------------------------------
 * 7️⃣ SAVE / LOAD DRAFTS
 * -------------------------------------------------------------
 */
export const saveDebugDraft = (id, data) =>
  api.post(`/debugging-request/${id}/draft`, data)

export const loadDebugDraft = async (id) => {
  const res = await api.get(`/debugging-request/${id}/draft`)
  return res.data
}
