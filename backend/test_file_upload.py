"""
Test script to verify file upload path resolution
"""
from pathlib import Path

# Simulate the path resolution in services.py
current_file = Path(__file__).resolve()
backend_dir = current_file.parent  # This file is in backend/

print(f"Current file: {current_file}")
print(f"Backend directory: {backend_dir}")

# Test testing_requests path
testing_upload_dir = backend_dir / "database" / "upload" / "testing_requests" / "1"
print(f"\nTesting upload directory: {testing_upload_dir}")
print(f"Testing upload directory exists: {testing_upload_dir.parent.parent.exists()}")

# Test design_requests path
design_upload_dir = backend_dir / "database" / "upload" / "design_requests" / "1"
print(f"\nDesign upload directory: {design_upload_dir}")
print(f"Design upload directory exists: {design_upload_dir.parent.parent.exists()}")

# Create test directories
testing_upload_dir.mkdir(parents=True, exist_ok=True)
design_upload_dir.mkdir(parents=True, exist_ok=True)

print("\n✅ Directories created successfully!")
print(f"Testing: {testing_upload_dir.exists()}")
print(f"Design: {design_upload_dir.exists()}")

# Test file creation
test_file = testing_upload_dir / "test.txt"
test_file.write_text("Test content")
print(f"\n✅ Test file created: {test_file.exists()}")

# Test relative path
relative = test_file.relative_to(backend_dir)
print(f"Relative path: {relative}")
print(f"Relative path (forward slashes): {str(relative).replace(chr(92), '/')}")
