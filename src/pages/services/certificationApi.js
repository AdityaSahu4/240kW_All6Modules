import api from "./api"

// Start new certification request
export const startCertificationRequest = async () => {
  const res = await api.post("/certification-request/")
  return res.data   // { id, status }
}

// Save product details
export const saveCertificationProductDetails = (id, data) =>
  api.post(`/certification-request/${id}/product`, data)

// Save technical documents
export const saveCertificationTechnicalDocuments = (id, data) =>
  api.post(`/certification-request/${id}/documents`, data)

// Save certification requirements
export const saveCertificationRequirements = (id, data) =>
  api.post(`/certification-request/${id}/requirements`, data)

// Save certification standards
export const saveCertificationStandards = (id, data) =>
  api.post(`/certification-request/${id}/standards`, data)

// Save lab selection as draft
export const saveCertificationLabSelectionDraft = (id, data) =>
  api.post(`/certification-request/${id}/lab-selection/draft`, data)

// Submit request (labs)
export const submitCertificationRequest = (id, data) =>
  api.post(`/certification-request/${id}/submit`, data)

export const fetchFullCertificationRequest = (id) =>
  api.get(`/certification-request/${id}/full`).then(res => res.data)
