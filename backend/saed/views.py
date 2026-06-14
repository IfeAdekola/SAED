import json

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.models import User
from django.utils.crypto import get_random_string
from django.utils.timezone import now
from django.db import IntegrityError
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.views.decorators.http import require_http_methods, require_POST

from .models import Application, Profile, Program


PROGRAM_FIELDS = {
    "title": "title",
    "category": "category",
    "description": "description",
    "durationWeeks": "duration_weeks",
    "capacity": "capacity",
    "location": "location",
    "isActive": "is_active",
}


def read_json(request):
    if not request.body:
        return {}
    try:
        return json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return {}


def api_login_required(view_func):
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({"error": "Authentication required."}, status=401)
        return view_func(request, *args, **kwargs)

    return wrapper


def role_for(user):
    profile = getattr(user, "profile", None)
    return profile.role if profile else "corps_member"


def require_roles(*roles):
    def decorator(view_func):
        @api_login_required
        def wrapper(request, *args, **kwargs):
            if role_for(request.user) not in roles:
                return JsonResponse({"error": "You do not have permission to perform this action."}, status=403)
            return view_func(request, *args, **kwargs)

        return wrapper

    return decorator


def validation_error(message, fields=None, status=400):
    return JsonResponse({"error": message, "fields": fields or {}}, status=status)


def clean_email(value):
    email = value.strip().lower()
    try:
        validate_email(email)
    except ValidationError:
        return ""
    return email


def is_authorized(user):
    profile = getattr(user, "profile", None)
    return profile.is_authorized if profile else False


def require_authorized_trainer(view_func):
    @api_login_required
    def wrapper(request, *args, **kwargs):
        if role_for(request.user) == "trainer" and not is_authorized(request.user):
            return JsonResponse(
                {"error": "Your account is pending authorization. Contact an administrator.", "authorized": False},
                status=403,
            )
        return view_func(request, *args, **kwargs)
    return wrapper


def user_payload(user):
    profile = getattr(user, "profile", None)
    return {
        "id": user.id,
        "email": user.email,
        "fullName": user.get_full_name() or user.username,
        "role": profile.role if profile else "corps_member",
        "phone": profile.phone if profile else "",
        "nyscStateCode": profile.nysc_state_code if profile else "",
        "stateOfDeployment": profile.state_of_deployment if profile else "",
        "isActive": user.is_active,
        "isAuthorized": profile.is_authorized if profile else False,
        "hasPaid": profile.has_paid if profile else False,
    }


def program_payload(program):
    approved_count = program.application_set.filter(status="approved").count()
    return {
        "id": program.id,
        "title": program.title,
        "category": program.category,
        "description": program.description,
        "durationWeeks": program.duration_weeks,
        "capacity": program.capacity,
        "trainerId": program.trainer_id,
        "trainerName": program.trainer_name,
        "location": program.location,
        "availableSlots": max(program.capacity - approved_count, 0),
        "isActive": program.is_active,
    }


def application_payload(application):
    return {
        "id": application.id,
        "status": application.status,
        "motivation": application.motivation,
        "createdAt": application.created_at.isoformat(),
        "applicant": user_payload(application.applicant),
        "program": program_payload(application.program),
    }


def program_categories_payload():
    return [{"value": value, "label": label} for value, label in Program.CATEGORY_CHOICES]


def trainer_payload(user):
    return {
        "id": user.id,
        "fullName": user.get_full_name() or user.email or user.username,
        "email": user.email,
    }


def trainers_payload():
    trainers = User.objects.select_related("profile").filter(
        is_active=True,
        profile__role="trainer",
        profile__is_authorized=True,
    ).order_by("first_name", "last_name", "email")
    return [trainer_payload(user) for user in trainers]


def managed_programs_for(user):
    programs = Program.objects.select_related("trainer")
    if role_for(user) == "trainer":
        return programs.filter(trainer=user)
    return programs


def managed_applications_for(user):
    applications = Application.objects.select_related("applicant", "applicant__profile", "program", "program__trainer")
    if role_for(user) == "trainer":
        return applications.filter(program__trainer=user)
    return applications


def trainer_program_payload(program):
    applications = program.application_set.select_related("applicant", "applicant__profile", "program", "program__trainer")
    payload = program_payload(program)
    payload["applications"] = [application_payload(item) for item in applications]
    return payload


def health(_request):
    return JsonResponse({"status": "ok", "service": "SAED IMS API"})


@ensure_csrf_cookie
def csrf(request):
    return JsonResponse({"csrfToken": get_token(request)})


def me(request):
    if not request.user.is_authenticated:
        return JsonResponse({"user": None})
    return JsonResponse({"user": user_payload(request.user)})


@csrf_exempt
@require_POST
def login_view(request):
    data = read_json(request)
    email = clean_email(data.get("email", ""))
    password = data.get("password", "")
    role = data.get("role")

    if not email or not password:
        return validation_error(
            "Enter a valid email address and password.",
            {"email": "Use a valid email address.", "password": "Password is required."},
        )

    user = authenticate(request, username=email, password=password)
    if user is None:
        return JsonResponse({"error": "Invalid email or password."}, status=400)

    profile = getattr(user, "profile", None)
    if role and profile and profile.role != role:
        return JsonResponse({"error": "This account is registered for a different role."}, status=400)

    login(request, user)
    return JsonResponse({"user": user_payload(user)})


@csrf_exempt
@require_POST
def logout_view(request):
    logout(request)
    return JsonResponse({"ok": True})


@csrf_exempt
@require_POST
def signup_view(request):
    data = read_json(request)
    full_name = data.get("fullName", "").strip()
    email = clean_email(data.get("email", ""))
    password = data.get("password", "")
    role = data.get("role", "corps_member")
    fields = {}

    if len(full_name.split()) < 2:
        fields["fullName"] = "Enter first and last name."
    if not email:
        fields["email"] = "Enter a valid email address."
    if role != "corps_member":
        fields["role"] = "Public signup is only available for corps members."
    if role == "corps_member":
        if not data.get("phone", "").strip():
            fields["phone"] = "Phone number is required."
        if not data.get("nyscStateCode", "").strip():
            fields["nyscStateCode"] = "NYSC state code is required."
        if not data.get("stateOfDeployment", "").strip():
            fields["stateOfDeployment"] = "State of deployment is required."
    try:
        validate_password(password)
    except ValidationError as exc:
        fields["password"] = " ".join(exc.messages)

    if fields:
        return validation_error("Please correct the highlighted fields.", fields)

    try:
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=full_name.split(" ", 1)[0],
            last_name=full_name.split(" ", 1)[1] if " " in full_name else "",
        )
    except IntegrityError:
        return validation_error("An account with this email already exists.", {"email": "Email is already registered."})

    Profile.objects.create(
        user=user,
        role=role,
        phone=data.get("phone", "").strip(),
        nysc_state_code=data.get("nyscStateCode", "").strip(),
        state_of_deployment=data.get("stateOfDeployment", "").strip(),
    )
    login(request, user)
    return JsonResponse({"user": user_payload(user)}, status=201)


@csrf_exempt
@require_POST
def trainer_signup_view(request):
    data = read_json(request)
    full_name = data.get("fullName", "").strip()
    email = clean_email(data.get("email", ""))
    password = data.get("password", "")
    phone = data.get("phone", "").strip()
    fields = {}

    if len(full_name.split()) < 2:
        fields["fullName"] = "Enter first and last name."
    if not email:
        fields["email"] = "Enter a valid email address."
    if not phone:
        fields["phone"] = "Phone number is required."
    try:
        validate_password(password)
    except ValidationError as exc:
        fields["password"] = " ".join(exc.messages)

    if fields:
        return validation_error("Please correct the highlighted fields.", fields)

    try:
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=full_name.split(" ", 1)[0],
            last_name=full_name.split(" ", 1)[1] if " " in full_name else "",
        )
    except IntegrityError:
        return validation_error("An account with this email already exists.", {"email": "Email is already registered."})

    Profile.objects.create(user=user, role="trainer", phone=phone, is_authorized=False, has_paid=False)
    login(request, user)
    return JsonResponse({"user": user_payload(user)}, status=201)


@require_http_methods(["GET"])
def program_list(_request):
    programs = Program.objects.filter(is_active=True)
    return JsonResponse({"programs": [program_payload(program) for program in programs], "categories": program_categories_payload()})


@require_roles("corps_member")
def application_list(request):
    applications = Application.objects.filter(applicant=request.user).select_related("program")
    return JsonResponse({"applications": [application_payload(item) for item in applications]})


@csrf_exempt
@api_login_required
@require_POST
def application_create(request):
    if role_for(request.user) != "corps_member":
        return JsonResponse({"error": "Only corps members can submit program applications."}, status=403)

    data = read_json(request)
    program_id = data.get("programId")
    motivation = data.get("motivation", "")
    if not program_id:
        return validation_error("Choose a program before applying.", {"programId": "Program is required."})

    try:
        program = Program.objects.get(id=program_id, is_active=True)
    except Program.DoesNotExist:
        return JsonResponse({"error": "Program not found."}, status=404)

    application, created = Application.objects.get_or_create(
        applicant=request.user,
        program=program,
        defaults={"motivation": motivation},
    )
    if not created:
        return JsonResponse({"error": "You already applied for this program."}, status=400)

    return JsonResponse({"application": application_payload(application)}, status=201)


@csrf_exempt
@require_POST
def password_reset_request(request):
    data = read_json(request)
    email = clean_email(data.get("email", ""))
    reset_payload = {}

    if not email:
        return validation_error("Enter a valid email address.", {"email": "Use a valid email address."})

    user = User.objects.filter(email=email, is_active=True).first()
    if user:
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_payload = {"uid": uid, "token": token}

    return JsonResponse(
        {
            "ok": True,
            "message": "If that email exists, password reset instructions are available.",
            **reset_payload,
        }
    )


@csrf_exempt
@require_POST
def password_reset_confirm(request):
    data = read_json(request)
    uid = data.get("uid", "")
    token = data.get("token", "")
    password = data.get("password", "")

    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id, is_active=True)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user is None or not default_token_generator.check_token(user, token):
        return validation_error("This password reset link is invalid or has expired.", {"token": "Request a new reset link."})

    try:
        validate_password(password, user)
    except ValidationError as exc:
        return validation_error("Choose a stronger password.", {"password": " ".join(exc.messages)})

    user.set_password(password)
    user.save(update_fields=["password"])
    return JsonResponse({"ok": True})


@require_roles("admin")
@require_http_methods(["GET", "POST"])
@csrf_exempt
def manage_users(request):
    if request.method == "GET":
        users = User.objects.select_related("profile").order_by("first_name", "email")
        return JsonResponse({"users": [user_payload(user) for user in users]})

    data = read_json(request)
    full_name = data.get("fullName", "").strip()
    email = clean_email(data.get("email", ""))
    role = data.get("role", "trainer")
    password = data.get("password", "")
    fields = {}

    if len(full_name.split()) < 2:
        fields["fullName"] = "Enter first and last name."
    if not email:
        fields["email"] = "Enter a valid email address."
    if role != "trainer":
        fields["role"] = "Admins can create trainer accounts only."
    if password:
        try:
            validate_password(password)
        except ValidationError as exc:
            fields["password"] = " ".join(exc.messages)
    if fields:
        return validation_error("Please correct the highlighted fields.", fields)

    try:
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password or get_random_string(20),
            first_name=full_name.split(" ", 1)[0],
            last_name=full_name.split(" ", 1)[1],
        )
    except IntegrityError:
        return validation_error("An account with this email already exists.", {"email": "Email is already registered."})

    Profile.objects.create(user=user, role="trainer", phone=data.get("phone", "").strip(), is_authorized=True)
    return JsonResponse({"user": user_payload(user)}, status=201)


@require_roles("admin")
@require_http_methods(["PATCH"])
@csrf_exempt
def manage_user_detail(request, user_id):
    try:
        user = User.objects.select_related("profile").get(id=user_id)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found."}, status=404)

    data = read_json(request)
    profile = getattr(user, "profile", None)
    if not profile:
        profile = Profile.objects.create(user=user)

    if "fullName" in data:
        full_name = data.get("fullName", "").strip()
        if len(full_name.split()) < 2:
            return validation_error("Enter first and last name.", {"fullName": "First and last name are required."})
        user.first_name = full_name.split(" ", 1)[0]
        user.last_name = full_name.split(" ", 1)[1]
    if "role" in data:
        if user.id == request.user.id:
            return validation_error("You cannot change your own role.", {"role": "Self role changes are not allowed."})
        if data["role"] not in {"corps_member", "trainer"}:
            return validation_error("Choose a valid account role.", {"role": "Admins can only assign corps member or trainer roles."})
        profile.role = data["role"]
    if "phone" in data:
        profile.phone = data.get("phone", "").strip()
    if "isActive" in data:
        if user.id == request.user.id and not bool(data["isActive"]):
            return validation_error("You cannot deactivate your own admin account.", {"isActive": "Self deactivation is not allowed."})
        user.is_active = bool(data["isActive"])
    if "isAuthorized" in data:
        profile.is_authorized = bool(data["isAuthorized"])
        if profile.is_authorized:
            profile.authorized_at = now()
        else:
            profile.authorized_at = None
    if "hasPaid" in data:
        profile.has_paid = bool(data["hasPaid"])

    user.save()
    profile.save()
    return JsonResponse({"user": user_payload(user)})


def apply_program_data(program, data):
    fields = {}
    values = {}
    for frontend_key, model_key in PROGRAM_FIELDS.items():
        if frontend_key in data:
            values[model_key] = data[frontend_key]

    if "trainerId" in data:
        try:
            trainer_id = int(data.get("trainerId"))
            trainer = User.objects.select_related("profile").get(id=trainer_id, is_active=True, profile__role="trainer")
        except (TypeError, ValueError, User.DoesNotExist):
            fields["trainerId"] = "Choose a valid trainer."
        else:
            values["trainer"] = trainer
            values["trainer_name"] = trainer.get_full_name() or trainer.email or trainer.username

    for field in ["title", "description", "trainer_name", "location"]:
        if field in values:
            values[field] = str(values[field]).strip()
            if not values[field]:
                fields[field] = "This field is required."
    if "category" in values and values["category"] not in dict(Program.CATEGORY_CHOICES):
        fields["category"] = "Choose a valid program category."
    for field in ["duration_weeks", "capacity"]:
        if field in values:
            try:
                values[field] = int(values[field])
            except (TypeError, ValueError):
                fields[field] = "Enter a number."
            else:
                if values[field] < 1:
                    fields[field] = "Enter a value greater than zero."

    required = ["title", "category", "description", "duration_weeks", "capacity", "location"]
    if program is None:
        for field in required:
            if field not in values:
                fields[field] = "This field is required."
        if "trainer" not in values:
            fields["trainerId"] = "Choose a trainer."

    if fields:
        return None, fields

    if program is None:
        program = Program()
    for key, value in values.items():
        setattr(program, key, value)
    program.save()
    return program, {}


@require_roles("admin", "trainer")
@require_authorized_trainer
@require_http_methods(["GET", "POST"])
@csrf_exempt
def manage_programs(request):
    if request.method == "GET":
        programs = managed_programs_for(request.user)
        return JsonResponse(
            {
                "programs": [program_payload(program) for program in programs],
                "categories": program_categories_payload(),
                "trainers": trainers_payload(),
            }
        )

    if role_for(request.user) != "admin":
        return JsonResponse({"error": "Only admins can create programs."}, status=403)

    program, fields = apply_program_data(None, read_json(request))
    if fields:
        return validation_error("Please correct the highlighted fields.", fields)
    return JsonResponse({"program": program_payload(program)}, status=201)


@require_roles("admin")
@require_http_methods(["PATCH"])
@csrf_exempt
def manage_program_detail(request, program_id):
    try:
        program = managed_programs_for(request.user).get(id=program_id)
    except Program.DoesNotExist:
        return JsonResponse({"error": "Program not found."}, status=404)

    program, fields = apply_program_data(program, read_json(request))
    if fields:
        return validation_error("Please correct the highlighted fields.", fields)
    return JsonResponse({"program": program_payload(program)})


@require_roles("admin", "trainer")
@require_authorized_trainer
@require_http_methods(["GET"])
def manage_applications(request):
    applications = managed_applications_for(request.user)
    return JsonResponse({"applications": [application_payload(item) for item in applications]})


@require_roles("admin", "trainer")
@require_authorized_trainer
@require_http_methods(["PATCH"])
@csrf_exempt
def manage_application_detail(request, application_id):
    data = read_json(request)
    status = data.get("status")
    if status not in {"approved", "declined", "completed"}:
        return validation_error("Choose approve, decline, or complete.", {"status": "Invalid application status."})

    try:
        application = managed_applications_for(request.user).get(id=application_id)
    except Application.DoesNotExist:
        return JsonResponse({"error": "Application not found."}, status=404)

    # Completed applications can only be changed by admins. Trainers (and any
    # other non-admin role) are blocked so that completion is effectively final
    # for staff except when an admin explicitly overrides it.
    if application.status == "completed" and role_for(request.user) != "admin":
        return validation_error(
            "Only admins can change the status of a completed application.",
            {"status": "Completed applications can only be modified by an admin."},
        )

    application.status = status
    application.save(update_fields=["status"])
    return JsonResponse({"application": application_payload(application)})


@api_login_required
@require_authorized_trainer
def dashboard(request):
    user_role = role_for(request.user)
    programs = Program.objects.filter(is_active=True)
    applications = Application.objects.filter(applicant=request.user).select_related("program", "applicant", "applicant__profile")
    trainer_programs = Program.objects.none()

    if user_role == "admin":
        applications = managed_applications_for(request.user)
    elif user_role == "trainer":
        programs = managed_programs_for(request.user).filter(is_active=True)
        trainer_programs = managed_programs_for(request.user).prefetch_related("application_set")
        applications = managed_applications_for(request.user)

    payload = {
        "stats": {
            "programs": programs.count(),
            "applications": applications.count(),
            "pending": applications.filter(status="pending").count(),
            "completed": applications.filter(status="completed").count(),
        },
        "featuredPrograms": [program_payload(program) for program in programs[:4]],
        "applications": [application_payload(item) for item in applications[:5]],
    }
    if user_role == "trainer":
        payload["trainerPrograms"] = [trainer_program_payload(program) for program in trainer_programs]
    return JsonResponse(payload)
