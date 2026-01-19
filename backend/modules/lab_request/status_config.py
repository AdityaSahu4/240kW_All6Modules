# backend/modules/lab_request/status_config.py
"""
Configuration for status mapping between lab and customer views
"""

# Detailed status definitions with customer-facing information
STATUS_DEFINITIONS = {
    # SUBMISSION & REVIEW
    "Submitted": {
        "category": "pre-testing",
        "customer_status": "Submitted",
        "message": "Your calibration request has been submitted and is awaiting lab review.",
        "progress_base": 5,
        "color": "yellow",
        "icon": "clock",
        "action_required": False
    },
    
    "Under Review": {
        "category": "pre-testing",
        "customer_status": "Under Review",
        "message": "Lab is reviewing your calibration requirements and preparing a quote.",
        "progress_base": 10,
        "color": "yellow",
        "icon": "search",
        "action_required": False
    },
    
    # QUOTING
    "Quote Preparation": {
        "category": "pre-testing",
        "customer_status": "Quote Pending",
        "message": "Lab is preparing a cost estimate for your calibration service.",
        "progress_base": 15,
        "color": "yellow",
        "icon": "dollar",
        "action_required": False
    },
    
    "Quote Sent": {
        "category": "pre-testing",
        "customer_status": "Quote Sent",
        "message": "Lab has sent a quote. Please review and approve to proceed.",
        "progress_base": 20,
        "color": "orange",
        "icon": "mail",
        "action_required": True,
        "action_type": "approve_quote"
    },
    
    "Quote Approved": {
        "category": "pre-testing",
        "customer_status": "Approved",
        "message": "Quote approved! Lab is scheduling your calibration tests.",
        "progress_base": 25,
        "color": "blue",
        "icon": "check",
        "action_required": False
    },
    
    "Quote Rejected": {
        "category": "stopped",
        "customer_status": "Quote Declined",
        "message": "You declined the quote. Request will be closed unless you contact us.",
        "progress_base": 20,
        "color": "red",
        "icon": "x",
        "action_required": False
    },
    
    # SCHEDULING
    "Scheduled": {
        "category": "preparation",
        "customer_status": "Scheduled",
        "message": "Testing scheduled. Please send product sample if not yet received by lab.",
        "progress_base": 30,
        "color": "blue",
        "icon": "calendar",
        "action_required": False
    },
    
    "Awaiting Sample": {
        "category": "preparation",
        "customer_status": "Awaiting Sample",
        "message": "Lab is waiting to receive your product sample to begin testing.",
        "progress_base": 30,
        "color": "orange",
        "icon": "package",
        "action_required": True,
        "action_type": "send_sample"
    },
    
    "Sample Received": {
        "category": "preparation",
        "customer_status": "Sample Received",
        "message": "Lab has received your product sample and will begin testing soon.",
        "progress_base": 35,
        "color": "blue",
        "icon": "check-circle",
        "action_required": False
    },
    
    # ACTIVE TESTING
    "Testing Started": {
        "category": "active-testing",
        "customer_status": "Testing Started",
        "message": "Calibration testing has begun. You'll receive updates as testing progresses.",
        "progress_base": 40,
        "color": "purple",
        "icon": "activity",
        "action_required": False
    },
    
    "In Progress": {
        "category": "active-testing",
        "customer_status": "Testing In Progress",
        "message": "Calibration tests are {progress}% complete.",
        "progress_formula": "40 + (test_progress * 0.4)",  # 40% to 80%
        "color": "purple",
        "icon": "trending-up",
        "action_required": False
    },
    
    # POST-TESTING
    "Tests Complete": {
        "category": "post-testing",
        "customer_status": "Tests Complete",
        "message": "All calibration tests completed successfully. Lab is preparing the report.",
        "progress_base": 85,
        "color": "teal",
        "icon": "check-circle",
        "action_required": False
    },
    
    "Report Review": {
        "category": "post-testing",
        "customer_status": "Report Review",
        "message": "Test report is under internal quality review before being sent to you.",
        "progress_base": 90,
        "color": "teal",
        "icon": "file-text",
        "action_required": False
    },
    
    "Report Ready": {
        "category": "post-testing",
        "customer_status": "Report Ready",
        "message": "Your calibration report is ready for review. Please download and verify.",
        "progress_base": 95,
        "color": "green",
        "icon": "download",
        "action_required": True,
        "action_type": "download_report"
    },
    
    # COMPLETION
    "Completed": {
        "category": "final",
        "customer_status": "Completed",
        "message": "Calibration completed successfully. Certificate and report are available.",
        "progress_base": 100,
        "color": "green",
        "icon": "check-circle-2",
        "action_required": False
    },
    
    "Certificate Issued": {
        "category": "final",
        "customer_status": "Certificate Issued",
        "message": "Calibration certificate has been issued. All documentation is complete.",
        "progress_base": 100,
        "color": "green",
        "icon": "award",
        "action_required": False
    },
    
    # REJECTION/CANCELLATION
    "Rejected by Lab": {
        "category": "stopped",
        "customer_status": "Rejected",
        "message": "Lab cannot accept this request. Reason: {reason}",
        "progress_base": 0,
        "color": "red",
        "icon": "x-circle",
        "action_required": False
    },
    
    "Cancelled": {
        "category": "stopped",
        "customer_status": "Cancelled",
        "message": "Request has been cancelled.",
        "progress_base": 0,
        "color": "gray",
        "icon": "slash",
        "action_required": False
    },
    
    "On Hold": {
        "category": "stopped",
        "customer_status": "On Hold",
        "message": "Request is temporarily on hold. Reason: {reason}",
        "progress_base": None,  # Keep current progress
        "color": "yellow",
        "icon": "pause",
        "action_required": False
    }
}


# Map high-level status to detailed status
HIGH_LEVEL_TO_DETAILED = {
    "Pending": ["Submitted", "Under Review", "Quote Preparation", "Quote Sent"],
    "In Progress": ["Quote Approved", "Scheduled", "Sample Received", "Testing Started", "In Progress", "Tests Complete", "Report Review"],
    "Completed": ["Report Ready", "Completed", "Certificate Issued"],
    "Rejected": ["Quote Rejected", "Rejected by Lab", "Cancelled", "On Hold"]
}


# Default milestone order
MILESTONE_ORDER = [
    "Submitted",
    "Under Review",
    "Quote Sent",
    "Quote Approved",
    "Scheduled",
    "Sample Received",
    "Testing Started",
    "In Progress",
    "Tests Complete",
    "Report Review",
    "Report Ready",
    "Completed"
]


def get_status_info(detailed_status, test_progress=None, reason=None):
    """
    Get complete status information for customer display
    
    Args:
        detailed_status: The detailed status string
        test_progress: Optional test progress percentage (0-100)
        reason: Optional reason for rejection/hold
    
    Returns:
        Dictionary with status information
    """
    if detailed_status not in STATUS_DEFINITIONS:
        # Fallback for unknown status
        return {
            "category": "unknown",
            "customer_status": detailed_status,
            "message": f"Status: {detailed_status}",
            "progress": 0,
            "color": "gray",
            "icon": "help-circle",
            "action_required": False
        }
    
    info = STATUS_DEFINITIONS[detailed_status].copy()
    
    # Calculate progress
    if "progress_formula" in info and test_progress is not None:
        # Dynamic progress calculation for "In Progress" status
        progress = 40 + (test_progress * 0.4)
        info["progress"] = int(progress)
    else:
        info["progress"] = info.get("progress_base", 0)
    
    # Format message with variables
    message = info["message"]
    if "{progress}" in message and test_progress is not None:
        message = message.format(progress=test_progress)
    if "{reason}" in message and reason:
        message = message.format(reason=reason)
    
    info["message"] = message
    
    return info


def get_customer_timeline(current_detailed_status):
    """
    Get the timeline of milestones for customer view
    
    Args:
        current_detailed_status: Current detailed status
    
    Returns:
        List of milestone dictionaries with status (completed, current, pending)
    """
    timeline = []
    current_reached = False
    
    for milestone in MILESTONE_ORDER:
        if milestone == current_detailed_status:
            status = "current"
            current_reached = True
        elif not current_reached:
            status = "completed"
        else:
            status = "pending"
        
        milestone_info = STATUS_DEFINITIONS.get(milestone, {})
        timeline.append({
            "name": milestone,
            "customer_name": milestone_info.get("customer_status", milestone),
            "status": status,
            "icon": milestone_info.get("icon", "circle"),
            "color": milestone_info.get("color", "gray")
        })
    
    return timeline