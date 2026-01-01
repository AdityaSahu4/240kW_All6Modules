# Calibration Review & Submit Page - Complete Fix

## ✅ ISSUES FIXED

### Issue 1: Final Document Upload Not Working
**Problem**: Final document upload field could not fetch/upload documents properly

### Issue 2: Terms & Approval Not Saving
**Problem**: Approval checkbox fields were not being stored in the database

---

## 🔧 COMPLETE IMPLEMENTATION

## ISSUE 1: FINAL DOCUMENT UPLOAD FIX

### Frontend Fixes (CalibrationReview.jsx)

#### 1. ✅ Added X Icon Import
```javascript
import { FileText, Edit, Settings, Target, List, Upload, Cloud, CheckCircle, HelpCircle, User, MapPin, Phone, Mail, Send, X } from 'lucide-react'
```

#### 2. ✅ Fixed handleFileUpload Function
```javascript
const handleFileUpload = (e) => {
  const files = Array.from(e.target.files || [])
  
  if (files.length === 0) return  // ✅ NEW: Validation
  
  const newFiles = files.map(file => ({
    id: Date.now() + Math.random(),
    name: file.name,
    size: file.size,
    type: file.type,
    file: file  // ✅ Store the actual File object
  }))
  
  const updated = [...uploadedFinalDocs, ...newFiles]
  setUploadedFinalDocs(updated)
  updateFormData({ uploadedFinalDocs: updated })
  
  // ✅ NEW: Clear the input so the same file can be selected again
  e.target.value = ''
}
```

#### 3. ✅ Enhanced UI with Visual Feedback
```javascript
<label className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer">
  Choose File(s)  {/* ✅ Changed from "Choose Files" */}
  <input
    type="file"
    multiple
    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
    onChange={handleFileUpload}
    className="hidden"
  />
</label>
{/* ✅ NEW: Immediate feedback */}
{uploadedFinalDocs && uploadedFinalDocs.length > 0 && (
  <p className="text-sm text-green-600 mt-3 font-medium">
    ✓ {uploadedFinalDocs.length} file(s) selected
  </p>
)}
```

#### 4. ✅ Improved File Display with Remove Button
```javascript
{uploadedFinalDocs.length > 0 && (
  <div className="mt-4 space-y-2">
    {uploadedFinalDocs.map((file) => (
      <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-purple-600" />
          <div>
            <p className="text-sm font-medium text-gray-900">{file.name}</p>
            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
          </div>
        </div>
        {/* ✅ NEW: Remove button */}
        <button
          onClick={() => {
            const updated = uploadedFinalDocs.filter(f => f.id !== file.id)
            setUploadedFinalDocs(updated)
            updateFormData({ uploadedFinalDocs: updated })
          }}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Remove file"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    ))}
  </div>
)}
```

### Backend Integration (CalibrationFlow.jsx)

#### ✅ Added Final Document Upload in Step 3
```javascript
// Upload final documents if any
if (formData.uploadedFinalDocs && formData.uploadedFinalDocs.length > 0) {
  console.log("Uploading final documents...")
  
  const formDataUpload = new FormData()
  
  formData.uploadedFinalDocs.forEach((fileData) => {
    if (fileData.file) {
      formDataUpload.append('files', fileData.file)
      formDataUpload.append('doc_types', 'final_document')  // ✅ doc_type for final docs
    }
  })
  
  try {
    const response = await api.post(
      `/calibration-request/${calibrationRequestId}/upload-documents`,
      formDataUpload,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    console.log('✅ Final documents uploaded successfully:', response.data)
  } catch (uploadErr) {
    console.error("Failed to upload final documents:", uploadErr)
    alert("Warning: Failed to upload final documents, but continuing submission.")
  }
}
```

---

## ISSUE 2: TERMS & APPROVAL SAVING FIX

### Database Changes

#### 1. ✅ New Model: CalibrationApproval
**File**: `backend/modules/calibration_request/models.py`

```python
class CalibrationApproval(Base):
    __tablename__ = "calibration_approvals"

    id = Column(Integer, primary_key=True)
    calibration_request_id = Column(Integer, ForeignKey("calibration_requests.id"))

    confirm_accurate = Column(String)  # "true" or "false"
    confirm_approve = Column(String)  # "true" or "false"
    confirm_understand = Column(String)  # "true" or "false"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

**Fields**:
- `confirm_accurate`: "I confirm all details provided are accurate."
- `confirm_approve`: "I approve the calibration plan."
- `confirm_understand`: "I understand additional charges may apply for repairs/adjustments."

#### 2. ✅ New Schema: CalibrationApprovalSchema
**File**: `backend/modules/calibration_request/schemas.py`

```python
class CalibrationApprovalSchema(BaseModel):
    confirm_accurate: bool
    confirm_approve: bool
    confirm_understand: bool
```

#### 3. ✅ New Service Function
**File**: `backend/modules/calibration_request/services.py`

```python
def save_calibration_approval(db: Session, calibration_request_id: int, payload: CalibrationApprovalSchema):
    """Save calibration approval checkboxes from review page"""
    approval = db.query(CalibrationApproval).filter(
        CalibrationApproval.calibration_request_id == calibration_request_id
    ).first()

    if not approval:
        approval = CalibrationApproval(calibration_request_id=calibration_request_id)
        db.add(approval)

    approval.confirm_accurate = str(payload.confirm_accurate).lower()
    approval.confirm_approve = str(payload.confirm_approve).lower()
    approval.confirm_understand = str(payload.confirm_understand).lower()

    db.commit()
    db.refresh(approval)
    return approval
```

#### 4. ✅ New Route Endpoint
**File**: `backend/modules/calibration_request/routes.py`

```python
@router.post("/{calibration_request_id}/approval")
def save_approval(
    calibration_request_id: int,
    payload: schemas.CalibrationApprovalSchema,
    db: Session = Depends(get_db)
):
    """Save calibration approval checkboxes from review page"""
    services.save_calibration_approval(db, calibration_request_id, payload)
    return {"status": "approval saved"}
```

**New Endpoint**: `POST /calibration-request/{id}/approval`

### Frontend Integration

#### 5. ✅ New API Function
**File**: `src/pages/services/calibrationApi.js`

```javascript
// Save calibration approval (from review page)
export const saveCalibrationApproval = (id, data) =>
  api.post(`/calibration-request/${id}/approval`, data)
```

#### 6. ✅ Save Approvals in CalibrationFlow.jsx
```javascript
// Import
import {
  startCalibrationRequest,
  saveCalibrationProductDetails,
  saveCalibrationRequirements,
  saveCalibrationConfirmation,
  saveCalibrationApproval,  // ✅ NEW
  submitCalibrationRequest
} from "../../services/calibrationApi"

// In Step 3 handler
// Save approval checkboxes
try {
  await saveCalibrationApproval(calibrationRequestId, {
    confirm_accurate: formData.confirmAccurate || false,
    confirm_approve: formData.confirmApprove || false,
    confirm_understand: formData.confirmUnderstand || false
  })
  console.log("✅ Approval data saved successfully")
} catch (err) {
  console.error("Failed to save approval data:", err)
  alert("Warning: Failed to save approval data, but continuing submission.")
}
```

---

## 🔄 COMPLETE SUBMISSION FLOW

### Step 3: Review & Submit

```
User on Review & Submit page
  ↓
Checks all 3 approval checkboxes:
  ☑ I confirm all details provided are accurate
  ☑ I approve the calibration plan
  ☑ I understand additional charges may apply
  ↓
Uploads final documents (optional):
  - Purchase Order
  - Previous Certificates
  - Photos
  - Diagrams
  - Access Documents
  ↓
Clicks "Submit Calibration Request"
  ↓
Frontend validates all checkboxes are checked
  ↓
1. Save Approval Data:
   POST /calibration-request/{id}/approval
   {
     confirm_accurate: true,
     confirm_approve: true,
     confirm_understand: true
   }
   ↓
2. Upload Final Documents (if any):
   POST /calibration-request/{id}/upload-documents
   FormData with files and doc_types='final_document'
   ↓
3. Submit Request:
   POST /calibration-request/{id}/submit
   ↓
Database Updates:
  - calibration_approvals table: New row with checkbox values
  - calibration_technical_documents table: Rows for each final document
  - calibration_requests.status: "submitted"
  ↓
Console Output:
  "Submitting calibration request..."
  "✅ Approval data saved successfully"
  "Uploading final documents..."
  "✅ Final documents uploaded successfully"
  "✅ Calibration request submitted successfully"
  ↓
Redirect to Success Page
```

---

## 📊 DATABASE STRUCTURE

### Table: calibration_approvals
```sql
CREATE TABLE calibration_approvals (
    id INTEGER PRIMARY KEY,
    calibration_request_id INTEGER,
    confirm_accurate VARCHAR,  -- "true" or "false"
    confirm_approve VARCHAR,   -- "true" or "false"
    confirm_understand VARCHAR, -- "true" or "false"
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (calibration_request_id) REFERENCES calibration_requests(id)
);
```

### Sample Data
```sql
INSERT INTO calibration_approvals 
(calibration_request_id, confirm_accurate, confirm_approve, confirm_understand)
VALUES 
(1, 'true', 'true', 'true');
```

### File Storage
```
backend/database/upload/calibration_requests/1/
├── calibration_certificate_cert_2024.pdf
├── additional_document_specs.pdf
└── final_document_purchase_order.pdf  ← NEW
└── final_document_photos.jpg          ← NEW
```

### Database Records
```sql
-- Final Documents
SELECT * FROM calibration_technical_documents 
WHERE calibration_request_id = 1 
AND doc_type = 'final_document';

-- Approval Data
SELECT * FROM calibration_approvals 
WHERE calibration_request_id = 1;
```

---

## 🧪 TESTING GUIDE

### Test 1: Final Document Upload UI
1. Navigate to Review & Submit page
2. Click "Choose File(s)" under "Final Document Upload"
3. Select 2-3 files (PDF, DOC, JPG)
4. **Expected**:
   - ✓ "✓ 3 file(s) selected" appears in green
   - Files listed below with names and sizes
   - Each file has remove button (X)

### Test 2: Remove Final Document
1. Upload 2 files
2. Click X on first file
3. **Expected**:
   - File removed from list
   - "✓ 1 file(s) selected"

### Test 3: Terms & Approval Checkboxes
1. Check all 3 approval checkboxes
2. **Expected**:
   - All checkboxes checked
   - Can uncheck and recheck

### Test 4: Validation
1. Leave one checkbox unchecked
2. Click "Submit Calibration Request"
3. **Expected**:
   - Alert: "Please confirm all statements before submitting."
   - Submission blocked

### Test 5: Complete Submission
1. Check all 3 approval checkboxes
2. Upload 2 final documents
3. Click "Submit Calibration Request"
4. Open browser console (F12)
5. **Expected Console Output**:
```
Submitting calibration request...
✅ Approval data saved successfully
Uploading final documents...
✅ Final documents uploaded successfully: {...}
✅ Calibration request submitted successfully
```

### Test 6: Verify Database - Approvals
```sql
SELECT * FROM calibration_approvals 
WHERE calibration_request_id = 1;
```

**Expected**:
```
id | calibration_request_id | confirm_accurate | confirm_approve | confirm_understand | created_at | updated_at
1  | 1                      | true             | true            | true               | 2026-...   | 2026-...
```

### Test 7: Verify Database - Final Documents
```sql
SELECT doc_type, file_name, file_path, file_size 
FROM calibration_technical_documents 
WHERE calibration_request_id = 1 
AND doc_type = 'final_document';
```

**Expected**:
```
doc_type        | file_name       | file_path                                              | file_size
----------------|-----------------|--------------------------------------------------------|----------
final_document  | purchase_order.pdf | database/upload/calibration_requests/1/final_document_... | 345670
final_document  | photos.jpg      | database/upload/calibration_requests/1/final_document_... | 512340
```

### Test 8: Verify File System
```
backend/database/upload/calibration_requests/1/
├── final_document_purchase_order.pdf
└── final_document_photos.jpg
```

---

## ✅ FILES MODIFIED

### Backend (4 files):
1. **backend/modules/calibration_request/models.py**
   - Added `CalibrationApproval` model

2. **backend/modules/calibration_request/schemas.py**
   - Added `CalibrationApprovalSchema`

3. **backend/modules/calibration_request/services.py**
   - Added `CalibrationApproval` to imports
   - Added `save_calibration_approval()` function

4. **backend/modules/calibration_request/routes.py**
   - Added `POST /{id}/approval` endpoint

### Frontend (3 files):
5. **src/pages/services/Calibration/CalibrationReview.jsx**
   - Added `X` icon import
   - Fixed `handleFileUpload` function
   - Added visual feedback
   - Added remove button for files

6. **src/pages/services/calibrationApi.js**
   - Added `saveCalibrationApproval()` function

7. **src/pages/services/Calibration/CalibrationFlow.jsx**
   - Added `saveCalibrationApproval` import
   - Added approval saving in Step 3
   - Added final document upload in Step 3

---

## 📝 KEY FEATURES SUMMARY

### Final Document Upload:
- ✅ Multiple file selection
- ✅ Immediate visual confirmation
- ✅ File display with name and size
- ✅ Remove individual files
- ✅ Input resets after selection
- ✅ Upload to backend on submit
- ✅ Stored with doc_type: 'final_document'

### Terms & Approval:
- ✅ New database table: `calibration_approvals`
- ✅ Stores all 3 checkbox values
- ✅ Validation before submission
- ✅ Saves to database before submit
- ✅ Error handling with user alerts
- ✅ Console logging for debugging

---

## 🎯 SUMMARY

**What was broken:**
1. Final document upload had no visual feedback or backend integration
2. Terms & Approval checkboxes were not saved to database

**What was fixed:**
1. ✅ Final document upload now works with visual feedback and backend storage
2. ✅ Terms & Approval data now saves to new `calibration_approvals` table
3. ✅ Complete submission flow with proper data persistence
4. ✅ Error handling and user feedback
5. ✅ Console logging for debugging

**User Experience:**
- Users can now upload final documents with visual confirmation
- Users can remove uploaded files before submission
- All approval checkboxes are validated and saved to database
- Complete audit trail of user confirmations
- Files properly organized in filesystem

All fixes are COMPLETE and SAVED! 🎉
