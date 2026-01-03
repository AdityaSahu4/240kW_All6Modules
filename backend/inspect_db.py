#!/usr/bin/env python3
"""
Script to inspect the database and check what data exists for testing_request_id 137
"""
import sqlite3
from pathlib import Path
import json

db_path = Path(__file__).parent / "database" / "app.db"

if not db_path.exists():
    print(f"Database not found at {db_path}")
    exit(1)

print(f"Connecting to database: {db_path}\n")

conn = sqlite3.connect(str(db_path))
cursor = conn.cursor()

testing_request_id = 137

print("="*80)
print(f"Inspecting data for testing_request_id: {testing_request_id}")
print("="*80)

# Check testing_requests table
print("\n--- Testing Request ---")
cursor.execute("SELECT * FROM testing_requests WHERE id = ?", (testing_request_id,))
columns = [description[0] for description in cursor.description]
row = cursor.fetchone()
if row:
    for col, val in zip(columns, row):
        print(f"{col}: {val}")
else:
    print("No testing request found!")

# Check product_details table
print("\n--- Product Details ---")
cursor.execute("SELECT * FROM testing_product_details WHERE testing_request_id = ?", (testing_request_id,))
columns = [description[0] for description in cursor.description]
row = cursor.fetchone()
if row:
    for col, val in zip(columns, row):
        print(f"{col}: {val}")
else:
    print("No product details found!")

# Check testing_requirements table
print("\n--- Testing Requirements ---")
cursor.execute("SELECT * FROM testing_requirements WHERE testing_request_id = ?", (testing_request_id,))
columns = [description[0] for description in cursor.description]
row = cursor.fetchone()
if row:
    for col, val in zip(columns, row):
        if col == 'selected_tests':
            try:
                val = json.loads(val) if val else []
            except:
                pass
        print(f"{col}: {val}")
else:
    print("No testing requirements found!")

# Check testing_standards table
print("\n--- Testing Standards ---")
cursor.execute("SELECT * FROM testing_standards WHERE testing_request_id = ?", (testing_request_id,))
columns = [description[0] for description in cursor.description]
row = cursor.fetchone()
if row:
    for col, val in zip(columns, row):
        if col in ['regions', 'standards']:
            try:
                val = json.loads(val) if val else []
            except:
                pass
        print(f"{col}: {val}")
else:
    print("No testing standards found!")

# Check lab_selection table
print("\n--- Lab Selection ---")
cursor.execute("SELECT * FROM lab_selection WHERE testing_request_id = ?", (testing_request_id,))
columns = [description[0] for description in cursor.description]
row = cursor.fetchone()
if row:
    for col, val in zip(columns, row):
        if col in ['selected_labs', 'region']:
            try:
                val = json.loads(val) if val else None
            except:
                pass
        print(f"{col}: {val}")
else:
    print("No lab selection found!")

# List all testing requests
print("\n" + "="*80)
print("All Testing Requests in Database:")
print("="*80)
cursor.execute("SELECT id, status, created_at FROM testing_requests ORDER BY id DESC LIMIT 10")
for row in cursor.fetchall():
    print(f"ID: {row[0]}, Status: {row[1]}, Created: {row[2]}")

conn.close()
