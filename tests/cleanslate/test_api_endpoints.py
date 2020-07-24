"""Testing API endpoints """

import os
import pytest
from django.core.files import File
from cleanslate.models import SourceRecord
from cleanslate.serializers import SourceRecordSerializer, CRecordSerializer
from cleanslate.management.commands.init_petitions import create_default_petition
from cleanslate.models import SealingPetitionTemplate, ExpungementPetitionTemplate
from RecordLib.crecord import CRecord
from RecordLib.petitions import Expungement
from RecordLib.utilities.serializers import to_serializable


@pytest.mark.django_db
def test_integrate_sources_with_crecord(dclient, admin_user, example_crecord):
    """
    User can post source records and an empty crecord to the server and receive a 
    crecord with the cases from the source record incorporated.
    """
    dclient.force_authenticate(user=admin_user)
    docket = os.listdir("tests/data/dockets/")[0]
    with open(f"tests/data/dockets/{docket}", "rb") as d:
        doc_1 = SourceRecord.objects.create(
            caption="Hello v. World",
            docket_num="MC-1234",
            court=SourceRecord.Courts.CP,
            url="https://abc.def",
            record_type=SourceRecord.RecTypes.DOCKET_PDF,
            file=File(d),
            owner=admin_user,
        )
    summary = os.listdir("tests/data/summaries")[0]
    with open(f"tests/data/summaries/{summary}", "rb") as s:
        doc_2 = SourceRecord.objects.create(
            caption="Hello v. Goodbye",
            docket_num="MC-1235",
            court=SourceRecord.Courts.MDJ,
            url="https://def.ghi",
            record_type=SourceRecord.RecTypes.SUMMARY_PDF,
            file=File(s),
            owner=admin_user,
        )

    # when sent to api, serialized document data won't have a file included.
    # The request is asking to do stuff using the file that is on the server.
    doc_1_data = SourceRecordSerializer(doc_1).data
    # doc_1_data.pop("file")

    doc_2_data = SourceRecordSerializer(doc_2).data
    # doc_2_data.pop("file")
    source_records = [doc_1_data, doc_2_data]
    data = {
        "crecord": CRecordSerializer(example_crecord).data,
        "source_records": source_records,
    }

    resp = dclient.put("/api/record/cases/", data=data)
    assert resp.status_code == 200
    assert "crecord" in resp.data
    assert "source_records" in resp.data
    # the response source_records list might include new source records, so will be at
    # least as long as the original source records list.
    assert len(resp.data["source_records"]) >= len(source_records)
    try:

        CRecord.from_dict(resp.data["crecord"])
    except Exception as err:
        pytest.fail(err)


@pytest.mark.django_db
def test_download_ujs_docs(admin_client):
    """
    post a couple of documents with urls to the server. Server creates objects to store the downloaded files and then 
    returns uuids of the document objects in the database.
    """
    doc_1 = {
        "docket_num": "CP-12345",
        "court": "CP",
        "url": "https://ujsportal.pacourts.us/DocketSheets/CPReport.ashx?docketNumber=CP-25-CR-1234567-2010&dnh=12345",
        "caption": "Comm. v. SillyKitty",
        "record_type": SourceRecord.RecTypes.DOCKET_PDF,
    }
    doc_2 = {
        "docket_num": "CP-54321",
        "court": "CP",
        "url": "https://ujsportal.pacourts.us/DocketSheets/CourtSummaryReport.ashx?docketNumber=CP-25-CR-1234567-2010&dnh=12345",
        "caption": "Comm. v. SillyKitty",
        "record_type": SourceRecord.RecTypes.SUMMARY_PDF,
    }
    resp = admin_client.post(
        "/api/record/sourcerecords/fetch/",
        data={"source_records": [doc_1, doc_2]},
        follow=True,
        content_type="application/json",
    )
    assert resp.status_code == 200
    for rec in resp.data["source_records"]:
        try:
            rec["id"]
        except Exception:
            pytest.fail("rec in response didn't have an id")


@pytest.fixture()
def admin_user(admin_user):
    """
    Modify the pytest-django admin user fixture.

    Register petition templates with the admin_user so that 
    it can generate petitions.
    """
    exp_template = create_default_petition(
        ExpungementPetitionTemplate,
        "templates/petitions/790ExpungementTemplate.docx",
        "790ExpungementTemplate",
    )
    sealing_template = create_default_petition(
        SealingPetitionTemplate,
        "templates/petitions/791SealingTemplate.docx",
        "791SealingTemplate",
    )

    admin_user.userprofile.expungement_petition_template = exp_template
    admin_user.userprofile.sealing_petition_template = sealing_template
    admin_user.userprofile.save()

    return admin_user


def test_download_petition(admin_client, admin_user, example_case):
    """
    Post a set of Petitions to the server to generate them and download the docx files. 
    """
    data = {
        "petitions": [
            {
                "attorney": {
                    "organization": "Legal Aid Org",
                    "full_name": "Abraham Lincoln",
                    "organization_address": {
                        "line_one": "1234 S. St.",
                        "city_state_zip": "Phila PA",
                    },
                    "organization_phone": "123-123-1234",
                    "bar_id": "11222",
                },
                "client": {
                    "first_name": "Suzy",
                    "last_name": "Smith",
                    "aliases": ["Joe"],
                },
                "cases": [to_serializable(example_case)],
                "expungement_type": Expungement.ExpungementTypes.FULL_EXPUNGEMENT,
                "petition_type": "Expungment",  # as opposed to "Sealing",
                "summary_expuntement_language": "and Petitioner is over 70 years old and has been free of arrest for more than ten years since this summary conviction.",
                "service_agencies": ["The Zoo", "Jims Pizza Palace"],
                "include_crim_hist_report": "",
                "ifp_message": "Please allow this petition.",
            }
        ]
    }
    resp = admin_client.post(
        "/api/record/petitions/", data=data, content_type="application/json"
    )
    assert resp.status_code == 200


def test_petition_endpoint_strips_none_values(admin_client, admin_user, example_case):
    """
    The endpoint that accepts petitions should strip None values from fields.

    So far, this is limited to stripping None values in the list of aliases.
    """
    data = {
        "petitions": [
            {
                "attorney": {
                    "organization": "Legal Aid Org",
                    "full_name": "Abraham Lincoln",
                    "organization_address": {
                        "line_one": "1234 S. St.",
                        "city_state_zip": "Phila PA",
                    },
                    "organization_phone": "123-123-1234",
                    "bar_id": "11222",
                },
                "client": {
                    "first_name": "Suzy",
                    "last_name": "Smith",
                    "aliases": ["Joe", None],
                },
                "cases": [to_serializable(example_case)],
                "expungement_type": Expungement.ExpungementTypes.FULL_EXPUNGEMENT,
                "petition_type": "Expungment",  # as opposed to "Sealing",
                "summary_expuntement_language": "and Petitioner is over 70 years old and has been free of arrest for more than ten years since this summary conviction.",
                "service_agencies": ["The Zoo", "Jims Pizza Palace"],
                "include_crim_hist_report": "",
                "ifp_message": "Please allow this petition.",
            }
        ]
    }
    resp = admin_client.post(
        "/api/record/petitions/", data=data, content_type="application/json"
    )
    assert resp.status_code == 200
