from django.urls import path

from . import views


urlpatterns = [
    path("health/", views.health),
    path("csrf/", views.csrf),
    path("auth/me/", views.me),
    path("auth/login/", views.login_view),
    path("auth/logout/", views.logout_view),
    path("auth/signup/", views.signup_view),
    path("auth/trainer-signup/", views.trainer_signup_view),
    path("auth/password-reset/", views.password_reset_request),
    path("auth/password-reset/confirm/", views.password_reset_confirm),
    path("dashboard/", views.dashboard),
    path("programs/", views.program_list),
    path("applications/", views.application_list),
    path("applications/create/", views.application_create),
    path("manage/users/", views.manage_users),
    path("manage/users/<int:user_id>/", views.manage_user_detail),
    path("manage/programs/", views.manage_programs),
    path("manage/programs/<int:program_id>/", views.manage_program_detail),
    path("manage/applications/", views.manage_applications),
    path("manage/applications/<int:application_id>/", views.manage_application_detail),
]
