import api from "./api"

// START SIMULATION REQUEST
export const startSimulationRequest = async () => {
  const res = await api.post("/simulation-request/")
  return res.data   // { id, status }
}

// SAVE PRODUCT DETAILS
export const saveSimulationProductDetails = (id, data) =>
  api.post(`/simulation-request/${id}/product`, data)

// SAVE TECHNICAL DOCUMENTS
export const saveSimulationTechnicalDocuments = (id, data) =>
  api.post(`/simulation-request/${id}/documents`, data)

// SAVE SIMULATION DETAILS

export const saveSimulationDetails = (id, data) =>
  api.post(`/simulation-request/${id}/details`, data)

// SAVE DRAFT
export const saveSimulationDraft = (id) =>
  api.post(`/simulation-request/${id}/draft`)

// SUBMIT SIMULATION REQUEST
export const submitSimulationRequest = (id) =>
  api.post(`/simulation-request/${id}/submit`)

// FETCH FULL SIMULATION REQUEST
export const fetchFullSimulationRequest = (id) =>
  api.get(`/simulation-request/${id}/full`).then(res => res.data)
