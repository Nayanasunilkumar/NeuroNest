from app import app
from database.models import User
from flask_jwt_extended import create_access_token

def test_api():
    with app.app_context():
        # Get an admin user
        admin = User.query.filter_by(role='admin').first()
        if not admin:
            print("No admin user found")
            return
        
        token = create_access_token(identity=str(admin.id))
        
        from routes.admin.manage_patients_routes import get_patients
        # Mocking a request to the route is complex, let's just call the logic
        # Or better, use app.test_client()
        
        client = app.test_client()
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/admin/patients/", headers=headers)
        
        print(f"Status: {response.status_code}")
        print(f"Data: {response.get_json()}")

if __name__ == "__main__":
    test_api()
