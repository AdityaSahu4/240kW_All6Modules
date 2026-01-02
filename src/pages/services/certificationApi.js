import api from "./api"

// Start new certification request
export const startCertificationRequest = async () => {
  const res = await api.post("/certification-request/")
  return res.data   // { id, status }
}

// Save certification details (region, product, category, standards)
export const saveCertificationDetails = (id, data) =>
  api.post(`/certification-request/${id}/details`, data)

// Upload certification documents (multipart file upload)
export const uploadCertificationDocuments = (id, formData) =>
  api.post(
    `/certification-request/${id}/upload-documents`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  )

// Save lab selection as draft
export const saveCertificationLabSelectionDraft = (id, data) =>
  api.post(`/certification-request/${id}/lab-selection/draft`, data)

// Submit request (final submission)
export const submitCertificationRequest = (id, data) =>
  api.post(`/certification-request/${id}/submit`, data)

// Fetch full certification request
export const fetchFullCertificationRequest = (id) =>
  api.get(`/certification-request/${id}/full`).then(res => res.data)
