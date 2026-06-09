from django.contrib.auth.models import User
from django.core.management.base import BaseCommand

from saed.models import Profile, Program


PROGRAMS = [
    {
        "title": "Agro Allied Practices",
        "category": "agro_allied",
        "description": "Intro to agro-allied trades: post-harvest handling, basic mechanization and value chains.",
        "duration_weeks": 6,
        "capacity": 50,
        "trainer_name": "AgriSAED",
        "location": "Farm Training Centre",
    },
    {
        "title": "Automobile Maintenance Essentials",
        "category": "automobile",
        "description": "Basic vehicle maintenance, diagnostics, and light repair skills for motorcycles and cars.",
        "duration_weeks": 6,
        "capacity": 40,
        "trainer_name": "AutoCraft Institute",
        "location": "Motor Skill Hub",
    },
    {
        "title": "Beautification & Personal Care",
        "category": "beautification",
        "description": "Skin care, makeup basics, manicure/pedicure and customer service for beauticians.",
        "duration_weeks": 4,
        "capacity": 35,
        "trainer_name": "GlowUp Academy",
        "location": "Yaba Studio",
    },
    {
        "title": "Construction Skills Fundamentals",
        "category": "construction",
        "description": "Hands-on introduction to masonry, carpentry, basic site safety and small-works estimating.",
        "duration_weeks": 8,
        "capacity": 45,
        "trainer_name": "BuildRight Trainers",
        "location": "Construction Yard",
    },
    {
        "title": "Cosmetology & Hairdressing",
        "category": "cosmetology",
        "description": "Hair styling, cutting, chemical treatments and salon business basics.",
        "duration_weeks": 6,
        "capacity": 30,
        "trainer_name": "StyleWorks",
        "location": "Beauty Centre",
    },
    {
        "title": "Culture & Tourism Entrepreneurship",
        "category": "culture_tourism",
        "description": "Tourism fundamentals, cultural events planning and small tourism business setup.",
        "duration_weeks": 4,
        "capacity": 40,
        "trainer_name": "Heritage Connect",
        "location": "Hybrid",
    },
    {
        "title": "Teaching & Education Methods",
        "category": "education",
        "description": "Foundations of teaching, lesson planning, adult learning techniques and classroom management.",
        "duration_weeks": 6,
        "capacity": 50,
        "trainer_name": "EduBridge",
        "location": "Orientation Camp Hall",
    },
    {
        "title": "Environmental Management Basics",
        "category": "environment",
        "description": "Practical waste management, sanitation, and small-scale environmental protection techniques.",
        "duration_weeks": 4,
        "capacity": 40,
        "trainer_name": "Greenfield Initiative",
        "location": "Camp Environment Unit",
    },
    {
        "title": "Film & Photography Production",
        "category": "film_photography",
        "description": "Camera basics, lighting, composition and short-form production workflows for beginners.",
        "duration_weeks": 8,
        "capacity": 30,
        "trainer_name": "FrameLab",
        "location": "Media Studio",
    },
    {
        "title": "Food Processing & Preservation",
        "category": "food_processing",
        "description": "Processing, preservation techniques and small-scale packaging for local food products.",
        "duration_weeks": 6,
        "capacity": 40,
        "trainer_name": "SafeFoods Academy",
        "location": "Food Tech Lab",
    },
    {
        "title": "ICT Fundamentals & Web",
        "category": "ict",
        "description": "Basic ICT skills, office tools, and an introduction to web development and online services.",
        "duration_weeks": 8,
        "capacity": 60,
        "trainer_name": "Dunis Technologies",
        "location": "Computer Lab",
    },
    {
        "title": "Power & Energy Basics",
        "category": "power_energy",
        "description": "Intro to renewable energy, basic electrical safety, and small-scale installations.",
        "duration_weeks": 5,
        "capacity": 30,
        "trainer_name": "PowerSkills Academy",
        "location": "Main Camp Workshop",
    },
]


class Command(BaseCommand):
    help = "Seed the local SAED IMS database with demo users and programs."

    def handle(self, *args, **options):
        admin, _ = User.objects.get_or_create(
            username="admin@saed.test",
            defaults={"email": "admin@saed.test", "is_staff": True, "is_superuser": True},
        )
        admin.set_password("password123")
        admin.email = "admin@saed.test"
        admin.is_active = True
        admin.is_staff = True
        admin.is_superuser = True
        admin.save()
        admin_profile, _ = Profile.objects.get_or_create(user=admin, defaults={"role": "admin"})
        admin_profile.role = "admin"
        admin_profile.save(update_fields=["role"])

        trainer, _ = User.objects.get_or_create(
            username="trainer@saed.test",
            defaults={"email": "trainer@saed.test", "first_name": "SAED", "last_name": "Trainer"},
        )
        trainer.set_password("password123")
        trainer.email = "trainer@saed.test"
        trainer.is_active = True
        trainer.save()
        trainer_profile, _ = Profile.objects.get_or_create(user=trainer, defaults={"role": "trainer", "phone": "08000000000"})
        trainer_profile.role = "trainer"
        trainer_profile.phone = trainer_profile.phone or "08000000000"
        trainer_profile.save(update_fields=["role", "phone"])

        for item in PROGRAMS:
            Program.objects.update_or_create(title=item["title"], defaults={**item, "trainer": trainer})

        self.stdout.write(self.style.SUCCESS("Seeded SAED IMS demo data."))
