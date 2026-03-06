import sqlite3
import pandas as pd
import json

conn = sqlite3.connect('/Users/nayanasp/Desktop/NEURO/backend/instance/neuronest.db')

# Check medications
meds = pd.read_sql_query("SELECT * FROM patient_medications", conn)
print("Patient Medications:")
print(meds.to_dict(orient='records'))

rx = pd.read_sql_query("SELECT * FROM prescriptions", conn)
print("Prescriptions:")
print(rx.to_dict(orient='records'))
