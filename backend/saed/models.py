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
    state_of_origin = models.CharField(max_length=80, blank=True)
    lga_of_deployment = models.CharField(max_length=80, blank=True)
    skill_interest = models.CharField(max_length=80, blank=True)
    is_authorized = models.BooleanField(default=False)
    has_paid = models.BooleanField(default=False)
    authorized_at = models.DateTimeField(null=True, blank=True)

    specialization = models.CharField(max_length=120, blank=True)
    partner_lgas = models.JSONField(default=list, blank=True)
    years_experience = models.PositiveSmallIntegerField(default=0)
    bio = models.TextField(blank=True)
    company_name = models.CharField(max_length=120, blank=True)
    number_trained = models.PositiveIntegerField(default=0)
    partnership_letter = models.FileField(upload_to="partnership_letters/", blank=True)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} ({self.role})"


class Course(models.Model):
    trainer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="courses",
    )
    title = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=32, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    duration_weeks = models.PositiveSmallIntegerField(default=4)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    max_students = models.PositiveIntegerField(default=40)
    is_active = models.BooleanField(default=True)
    has_fast_track = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class FastTrackVideo(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="videos")
    title = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    video_url = models.URLField(blank=True)
    duration_seconds = models.PositiveIntegerField(default=0)
    order = models.PositiveSmallIntegerField(default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_free_preview = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class Connection(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("active", "Active"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    corps_member = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="connections",
    )
    trainer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="corpers",
    )
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="pending")
    connected_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ["corps_member", "trainer"]
        ordering = ["-connected_at"]

    def __str__(self):
        return f"{self.corps_member.username} -> {self.trainer.username}"


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
