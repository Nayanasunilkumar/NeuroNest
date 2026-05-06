import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(backend_dir))

from app import app
from database.models import db, User, Appointment, DoctorProfile, AppointmentSlot

def reassign_data():
    with app.app_context():
        print("--- CLINICAL DATA RE-ALIGNMENT ---")
        
        # 1. Target User
        target_email = "nayanasunukumar8@gmail.com"
        current_user = User.query.filter_by(email=target_email).first()
        
        if not current_user:
            print(f"User {target_email} not found.")
            return
            
        print(f"Current User: {current_user.full_name} (ID: {current_user.id})")

        # 2. Find Orphaned Appointments
        # We look for appointments where the doctor email matches but the ID might be different
        # Or just find all appointments where the doctor name or something matches?
        # Actually, let's just find ALL appointments and check if they belong to ANY doctor
        
        all_appts = Appointment.query.all()
        reassigned_count = 0
        
        for appt in all_appts:
            # If the appointment's doctor_id doesn't exist in the User table, it's orphaned
            doctor_exists = User.query.get(appt.doctor_id)
            if not doctor_exists:
                print(f"  Found orphaned appointment {appt.id} (Old Doctor ID: {appt.doctor_id})")
                appt.doctor_id = current_user.id
                reassigned_count += 1
            elif doctor_exists.email == target_email and doctor_exists.id != current_user.id:
                # This shouldn't happen if emails are unique, but just in case
                print(f"  Reassigning from old ID {doctor_exists.id} to new ID {current_user.id}")
                appt.doctor_id = current_user.id
                reassigned_count += 1

        # 3. Handle Slots too
        all_slots = AppointmentSlot.query.all()
        for slot in all_slots:
            if not User.query.get(slot.doctor_user_id):
                slot.doctor_user_id = current_user.id

        if reassigned_count > 0:
            try:
                db.session.commit()
                print(f"\n✅ Successfully reassigned {reassigned_count} appointments to your current account.")
            except Exception as e:
                db.session.rollback()
                print(f"\n❌ Error committing changes: {e}")
        else:
            print("\nNo orphaned data found that needs reassigning.")
            print("If your dashboard is still 0, it means the Appointment table itself might be empty.")

if __name__ == "__main__":
    reassign_data()
