import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from core.app_factory import create_app
from database.models import User, Appointment, db

app = create_app()
with app.app_context():
    naina = User.query.filter_by(email="nayanasunilkumar8@gmail.com").first()
    if not naina:
        print("ERROR: Dr. Naina not found in database.")
    else:
        print(f"Found Dr. Naina: ID={naina.id}, Role={naina.role}")
        appts = Appointment.query.filter_by(doctor_id=naina.id).all()
        print(f"Appointments linked to ID {naina.id}: {len(appts)}")
        
        statuses = {}
        for a in appts:
            statuses[a.status] = statuses.get(a.status, 0) + 1
        print(f"Status distribution: {statuses}")
        
        # Check for any other appointments in the system
        total = Appointment.query.count()
        print(f"Total system appointments: {total}")
        
        others = Appointment.query.filter(Appointment.doctor_id != naina.id).all()
        if others:
            print(f"Orphaned/Other appointments: {len(others)}")
            dist = {}
            for o in others:
                dist[o.doctor_id] = dist.get(o.doctor_id, 0) + 1
            print(f"Remaining Distribution: {dist}")
