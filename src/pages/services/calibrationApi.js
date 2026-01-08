import api from "./api"

// Get all calibration requests
export const getAllCalibrationRequests = async () => {
  const res = await api.get("/calibration-request/")
  return res.data.requests
}

// Get single calibration request by CAL-{id}
export const getCalibrationRequestById = async (calId) => {
  const res = await api.get(`/calibration-request/by-id/${calId}`)
  return res.data
}

// Start new calibration request
export const startCalibrationRequest = async () => {
  const res = await api.post("/calibration-request/")
  return res.data   // { id, status }
}

// Save product details
export const saveCalibrationProductDetails = (id, data) =>
  api.post(`/calibration-request/${id}/product`, data)

// ✅ NEW: Update product details
export const updateCalibrationProductDetails = async (calId, data) => {
  try {
    // Extract numeric ID from CAL-{id} format
    const requestId = calId.replace("CAL-", "")
    const res = await api.put(`/calibration-request/${requestId}/product`, data)
    return res.data
  } catch (error) {
    console.error('Update error:', error)
    throw error
  }
}

// Save technical documents
export const saveCalibrationTechnicalDocuments = (id, data) =>
  api.post(`/calibration-request/${id}/documents`, data)

// Save calibration requirements
export const saveCalibrationRequirements = (id, data) =>
  api.post(`/calibration-request/${id}/requirements`, data)

// Save calibration standards
export const saveCalibrationStandards = (id, data) =>
  api.post(`/calibration-request/${id}/standards`, data)

// Save calibration confirmation (from details page)
export const saveCalibrationConfirmation = (id, data) =>
  api.post(`/calibration-request/${id}/confirmation`, data)

// Save calibration approval (from review page)
export const saveCalibrationApproval = (id, data) =>
  api.post(`/calibration-request/${id}/approval`, data)

// Save lab selection as draft
export const saveCalibrationLabSelectionDraft = (id, data) =>
  api.post(`/calibration-request/${id}/lab-selection/draft`, data)

// Submit request (labs)
export const submitCalibrationRequest = (id, data) =>
  api.post(`/calibration-request/${id}/submit`, data)

// Get full calibration request details
export const fetchFullCalibrationRequest = (id) =>
  api.get(`/calibration-request/${id}/full`).then(res => res.data)

// ✅ NEW: Delete calibration request
export const deleteCalibrationRequest = async (calId) => {
  try {
    // Extract numeric ID from CAL-{id} format
    const requestId = calId.replace("CAL-", "")
    const res = await api.delete(`/calibration-request/${requestId}`)
    return res.data
  } catch (error) {
    console.error('Delete error:', error)
    throw error
  }
}

// ✅ NEW: Delete specific document
export const deleteDocument = async (documentId) => {
  try {
    const res = await api.delete(`/calibration-request/documents/${documentId}`)
    return res.data
  } catch (error) {
    console.error('Delete document error:', error)
    throw error
  }
}

// Get document info
export const getDocumentInfo = async (documentId) => {
  const res = await api.get(`/calibration-request/documents/${documentId}`)
  return res.data
}

// Download document
export const downloadDocument = async (documentId, fileName) => {
  try {
    const response = await api.get(
      `/calibration-request/documents/${documentId}/download`,
      {
        responseType: 'blob', // Important for file download
      }
    )

    // Create a blob URL and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName || 'document')
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    return { success: true }
  } catch (error) {
    console.error('Download error:', error)
    throw error
  }
}

// View document (opens in new tab)
export const viewDocument = (documentId) => {
  // Get the base URL from the api instance
  const baseURL = api.defaults.baseURL || ''
  const url = `${baseURL}/calibration-request/documents/${documentId}/view`
  window.open(url, '_blank')
}

// Get document download URL (for direct linking)
export const getDocumentDownloadUrl = (documentId) => {
  const baseURL = api.defaults.baseURL || ''
  return `${baseURL}/calibration-request/documents/${documentId}/download`
}

// Get document view URL (for direct linking)
export const getDocumentViewUrl = (documentId) => {
  const baseURL = api.defaults.baseURL || ''
  return `${baseURL}/calibration-request/documents/${documentId}/view`
}