import api from "./api"

// Start new debugging request
export const startDebuggingRequest = async () => {
  const res = await api.post("/debugging-request/")
  return res.data   // { id, status }
}

// Save product details
export const saveDebuggingProductDetails = (id, data) =>
  api.post(`/debugging-request/${id}/product`, data)

// Save technical documents
export const saveDebuggingTechnicalDocuments = (id, data) =>
  api.post(`/debugging-request/${id}/documents`, data)

// Save debugging requirements
export const saveDebuggingRequirements = (id, data) =>
  api.post(`/debugging-request/${id}/requirements`, data)

// Save debugging standards
export const saveDebuggingStandards = (id, data) =>
  api.post(`/debugging-request/${id}/standards`, data)

// Save lab selection as draft
export const saveDebuggingLabSelectionDraft = (id, data) =>
  api.post(`/debugging-request/${id}/lab-selection/draft`, data)

// Submit request (labs)
export const submitDebuggingRequest = (id, data) =>
  api.post(`/debugging-request/${id}/submit`, data)

export const fetchFullDebuggingRequest = (id) =>
  api.get(`/debugging-request/${id}/full`).then(res => res.data)
