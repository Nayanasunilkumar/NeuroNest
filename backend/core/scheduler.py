from apscheduler.schedulers.background import BackgroundScheduler

from modules.doctor.services.scheduler_service import check_upcoming_consultations


def start_scheduler(app):
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        func=check_upcoming_consultations,
        trigger="interval",
        minutes=1,
        args=[app],
    )
    scheduler.start()
    app.extensions["appointment_scheduler"] = scheduler
    return scheduler
