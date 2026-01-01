import api from "./api"

// Start new simulation request
export const startSimulationRequest = async () => {
  const res = await api.post("/simulation-request/")
  return res.data   // { id, status }
}

// Save product details
export const saveSimulationProductDetails = (id, data) =>
  api.post(`/simulation-request/${id}/product`, data)

// Save technical documents
export const saveSimulationTechnicalDocuments = (id, data) =>
  api.post(`/simulation-request/${id}/documents`, data)

// Save simulation requirements
export const saveSimulationRequirements = (id, data) =>
  api.post(`/simulation-request/${id}/requirements`, data)

// Save simulation standards
export const saveSimulationStandards = (id, data) =>
  api.post(`/simulation-request/${id}/standards`, data)

// Save lab selection as draft
export const saveSimulationLabSelectionDraft = (id, data) =>
  api.post(`/simulation-request/${id}/lab-selection/draft`, data)

// Submit request (labs)
export const submitSimulationRequest = (id, data) =>
  api.post(`/simulation-request/${id}/submit`, data)

export const fetchFullSimulationRequest = (id) =>
  api.get(`/simulation-request/${id}/full`).then(res => res.data)
