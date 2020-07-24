""" manage.py command to add default petitions to database, if none exist already. 

This way the application initialized with templates that new users will get by default.
"""

import os
import secrets
import logging
from django.core.management.base import BaseCommand, CommandError
from cleanslate.models import SealingPetitionTemplate, ExpungementPetitionTemplate
from django.core.files import File

logger = logging.getLogger(__name__)


def create_default_petition(TemplateModel, template_path, new_name):
    default_petitions = TemplateModel.objects.filter(default=True)
    if len(default_petitions) == 0:
        # if no exp. petition default, create one.
        with open(template_path, "rb") as pet:
            new_petition = File(pet)
            new_petition.name = new_name
            template_model = TemplateModel(
                name=new_name, file=new_petition, default=True
            )
            template_model.save()
            return template_model


class Command(BaseCommand):
    """ Additional commands added to manage.py. """

    help = "Initialize default petitions."

    def add_arguments(self, parser):
        pass

    def handle(self, *args, **options):
        """ If there are no default petitions in the database, add them. """
        # check if there's an expungement petition default.
        # check if there's a sealing petition default.
        create_default_petition(
            ExpungementPetitionTemplate,
            "templates/petitions/790ExpungementTemplate.docx",
            "790ExpungementTemplate",
        )
        create_default_petition(
            SealingPetitionTemplate,
            "templates/petitions/791SealingTemplate.docx",
            "791SealingTemplate",
        )
        # if no sealing petition default, create one.
