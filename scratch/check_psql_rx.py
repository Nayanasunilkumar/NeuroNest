import psycopg2
import os
from dotenv import load_dotenv

load_dotenv('backend/.env')
db_url = os.getenv('DATABASE_URL')

def check_psql():
    if not db_url:
        print("DATABASE_URL not found")
        return
        
    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        # Check tables
        cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
        tables = [t[0] for t in cur.fetchall()]
        print("Tables:", tables)
        
        if 'prescriptions' in tables:
            cur.execute("SELECT COUNT(*) FROM prescriptions")
            count = cur.fetchone()[0]
            print(f"Total Prescriptions in Postgres: {count}")
            
            cur.execute("SELECT id, diagnosis, status, is_deleted FROM prescriptions WHERE patient_id = 3")
            rows = cur.fetchall()
            print(f"Prescriptions for Patient 3: {rows}")
        else:
            print("Table 'prescriptions' not found in Postgres")
            
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error connecting to Postgres: {e}")

if __name__ == "__main__":
    check_psql()
