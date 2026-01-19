// src/pages/lab/labRequests.js

import axios from "axios"

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
})

// ------------------------------
// CREATE NEW LAB REQUEST 
// ------------------------------
export async function createLabRequest(productName, serviceType) {
  console.log('Creating lab request:', { productName, serviceType });
  
  try {
    const response = await api.post('/lab-requests/', {
      product_name: productName,
      service_type: serviceType,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating lab request:', error);
    throw new Error(error.response?.data?.detail || 'Failed to create lab request');
  }
}

// ------------------------------
// GET all lab requests
// ------------------------------
export async function fetchLabRequests() {
  console.log('Fetching lab requests from:', `${api.defaults.baseURL}/lab-requests/`);
  
  try {
    const response = await api.get('/lab-requests/');
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Fetch lab requests error:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch lab requests');
  }
}

// ------------------------------
// GET one request with full details
// ------------------------------
export async function fetchFullRequest(id) {
  console.log('Fetching full request:', id);
  
  try {
    const response = await api.get(`/lab-requests/${id}/full`);
    return response.data;
  } catch (error) {
    console.error('Error fetching full request:', error);
    throw new Error(error.response?.data?.detail || 'Failed to fetch full request');
  }
}

// ------------------------------
// UPDATE STATUS
// ------------------------------
export async function updateStatus(id, newStatus, userId) {
  console.log('Updating status:', { id, newStatus, userId });
  
  try {
    const response = await api.put(`/lab-requests/${id}/status`, {
      new_status: newStatus,
      changed_by: userId,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating status:', error);
    throw new Error(error.response?.data?.detail || 'Failed to update status');
  }
}

// ------------------------------
// ADD PROGRESS
// ------------------------------
export async function addProgress(id, percent, notes, userId) {
  console.log('Adding progress:', { id, percent, notes, userId });
  
  try {
    const response = await api.post(`/lab-requests/${id}/progress`, {
      progress_percent: percent,
      notes,
      updated_by: userId,
    });
    return response.data;
  } catch (error) {
    console.error('Error adding progress:', error);
    throw new Error(error.response?.data?.detail || 'Failed to add progress');
  }
}

// ------------------------------
// ASSIGN ENGINEER
// ------------------------------
export async function assignEngineer(id, engineerId, userId) {
  console.log('Assigning engineer:', { id, engineerId, userId });
  
  try {
    const response = await api.put(`/lab-requests/${id}/assign`, {
      engineer_id: engineerId,
      assigned_by: userId,
    });
    return response.data;
  } catch (error) {
    console.error('Error assigning engineer:', error);
    throw new Error(error.response?.data?.detail || 'Failed to assign engineer');
  }
}

// ------------------------------
// CREATE SCHEDULE ENTRY
// ------------------------------
export async function createSchedule(id, payload) {
  console.log('Creating schedule:', { id, payload });
  
  try {
    const response = await api.post(`/lab-requests/${id}/schedule`, payload);
    return response.data;
  } catch (error) {
    console.error('Error creating schedule:', error);
    throw new Error(error.response?.data?.detail || 'Failed to create schedule');
  }
}

// ------------------------------
// UPLOAD DOCUMENTS
// ------------------------------
export async function uploadDocuments(id, files, docTypes, uploadedBy = "system") {
  console.log('Uploading documents:', { id, filesCount: files.length, docTypes });
  
  try {
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('files', file);
    });
    
    docTypes.forEach(type => {
      formData.append('doc_types', type);
    });
    
    formData.append('uploaded_by', uploadedBy);

    const response = await api.post(`/lab-requests/${id}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading documents:', error);
    throw new Error(error.response?.data?.detail || 'Failed to upload documents');
  }
}

// ------------------------------
// DELETE DOCUMENT
// ------------------------------
export async function deleteDocument(documentId) {
  console.log('Deleting document:', documentId);
  
  try {
    const response = await api.delete(`/lab-requests/documents/${documentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting document:', error);
    throw new Error(error.response?.data?.detail || 'Failed to delete document');
  }
}