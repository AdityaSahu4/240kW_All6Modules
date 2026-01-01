import api from "./api"

// Start new calibration request
export const startCalibrationRequest = async () => {
  const res = await api.post("/calibration-request/")
  return res.data   // { id, status }
}

// Save product details
export const saveCalibrationProductDetails = (id, data) =>
  api.post(`/calibration-request/${id}/product`, data)

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

export const fetchFullCalibrationRequest = (id) =>
  api.get(`/calibration-request/${id}/full`).then(res => res.data)

