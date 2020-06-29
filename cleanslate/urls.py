"""
 Map urls for the app to view controllers.
"""

from django.urls import path
from .views import (
    FileUploadView,
    SourceRecordsFetchView,
    IntegrateCRecordWithSources,
    AnalysisView,
    PetitionsView,
    UserProfileView,
)

urlpatterns = [
    path("sourcerecords/upload/", FileUploadView.as_view()),
    path("sourcerecords/fetch/", SourceRecordsFetchView.as_view()),
    path("cases/", IntegrateCRecordWithSources.as_view()),
    path("analysis/", AnalysisView.as_view()),
    path("petitions/", PetitionsView.as_view()),
    path("profile/", UserProfileView.as_view()),
]
