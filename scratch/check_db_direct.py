import sqlite3
import os

db_path = 'backend/neuronest.db'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print("Tables:", [t[0] for t in tables])
    
    # Check prescriptions
    if ('prescriptions',) in tables:
        cursor.execute("SELECT COUNT(*) FROM prescriptions")
        count = cursor.fetchone()[0]
        print(f"Prescriptions count: {count}")
        
        cursor.execute("SELECT * FROM prescriptions WHERE patient_id = 3")
        nezrin_rx = cursor.fetchall()
        print(f"Nezrin prescriptions: {nezrin_rx}")
    else:
        print("Table 'prescriptions' not found")
        
    conn.close()
else:
    print(f"Database {db_path} not found")
