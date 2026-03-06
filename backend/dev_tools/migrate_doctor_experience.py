import os
from flask import Flask
from dotenv import load_dotenv

load_dotenv()

# Remote NEON database URL
REMOTE_DB_URL = "postgresql://neondb_owner:npg_iA8dhqTLUMj1@ep-old-waterfall-a1xzxd6q.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# Minimal App for migration
app = Flask(__name__)
# Use remote URL if DATABASE_URL is localhost or not set to something remote
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL') if "localhost" not in (os.getenv('DATABASE_URL') or "localhost") else REMOTE_DB_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Import db FROM models so it's the correct instance
from database.models import db, DoctorExperience, DoctorProfile

# Initialize the db with this app
db.init_app(app)

def migrate():
    with app.app_context():
        # This will create any missing tables, including our new doctor_experiences table
        db.create_all()
        print("DoctorExperience table created successfully.")
        
        # Check if we should seed default data
        doctors = DoctorProfile.query.all()
        for doctor in doctors:
            if not doctor.experience:
                print(f"Seeding experience for doctor ID: {doctor.id}")
                experiences = [
                    {
                        "title": "Senior Consultant, Neurology",
                        "hospital": doctor.hospital_name or "NeuroNest Central Hospital",
                        "period": "2020 - Present",
                        "description": "Leading the advanced department, focusing on scalable patient methodologies and overseeing clinical trials."
                    },
                    {
                        "title": "Attending Specialist",
                        "hospital": "City Medical Center",
                        "period": "2015 - 2020",
                        "description": "Managed complex inpatient and outpatient cases. Contributed to significant clinical research and resident education."
                    },
                    {
                        "title": "Residency Program",
                        "hospital": "State University Hospital",
                        "period": "2012 - 2015",
                        "description": "Completed comprehensive clinical training in diagnostics and advanced treatment planning."
                    }
                ]
                for exp_data in experiences:
                    new_exp = DoctorExperience(
                        doctor_id=doctor.id,
                        title=exp_data["title"],
                        hospital=exp_data["hospital"],
                        period=exp_data["period"],
                        description=exp_data["description"]
                    )
                    db.session.add(new_exp)
        
        db.session.commit()
        print("Migration and seeding completed.")

if __name__ == "__main__":
    migrate()
