from django.conf import settings
from django.db import models


class Profile(models.Model):
    ROLE_CHOICES = [
        ("corps_member", "Corps Member"),
        ("trainer", "Trainer"),
        ("admin", "Admin"),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    role = models.CharField(max_length=24, choices=ROLE_CHOICES, default="corps_member")
    phone = models.CharField(max_length=32, blank=True)
    nysc_state_code = models.CharField(max_length=32, blank=True)
    state_of_deployment = models.CharField(max_length=80, blank=True)

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} ({self.role})"


class Program(models.Model):
    CATEGORY_CHOICES = [
        ("agro_allied", "Agro Allied"),
        ("automobile", "Automobile"),
        ("beautification", "Beautification"),
        ("construction", "Construction"),
        ("cosmetology", "Cosmetology"),
        ("culture_tourism", "Culture & Tourism"),
        ("education", "Education"),
        ("environment", "Environment"),
        ("film_photography", "Film & Photography"),
        ("food_processing", "Food Processing/Preservation"),
        ("ict", "ICT"),
        ("power_energy", "Power & Energy"),
    ]

    title = models.CharField(max_length=120)
    category = models.CharField(max_length=32, choices=CATEGORY_CHOICES)
    description = models.TextField()
    duration_weeks = models.PositiveSmallIntegerField(default=4)
    capacity = models.PositiveIntegerField(default=40)
    trainer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="training_programs",
    )
    trainer_name = models.CharField(max_length=120)
    location = models.CharField(max_length=120)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["title"]

    def __str__(self):
        return self.title


class Application(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("completed", "Completed"),
        ("declined", "Declined"),
    ]

    applicant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    program = models.ForeignKey(Program, on_delete=models.CASCADE)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="pending")
    motivation = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["applicant", "program"]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.applicant.username} -> {self.program.title}"
