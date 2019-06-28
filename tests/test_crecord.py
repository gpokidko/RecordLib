from RecordLib.crecord import CRecord
from RecordLib.common import Person
import pytest
from datetime import date
from dateutil.relativedelta import relativedelta

def test_init():
    dob = date(2010, 1,1)
    person = Person(**{
        "first_name": "Joe",
        "last_name": "Smith",
        "date_of_birth": dob
    })
    rec = CRecord(**{
        "person": person
    })
    assert rec.person.first_name == "Joe"
    rec = CRecord(
        person = Person(
            first_name="Joan",
            last_name="Smythe",
            date_of_birth=dob
        )
    )
    assert rec.person.last_name == "Smythe"


def test_add_summary(example_summary):
    rec = CRecord(Person("Dummy", "Name", None))
    rec.add_summary(example_summary)
    assert rec.person.first_name == example_summary.get_defendant().first_name
    assert ((len(rec.cases) == len(example_summary.get_cases())) and
            (len(rec.cases) > 0))



def test_years_since_last_arrested_or_prosecuted(example_crecord):
    example_crecord.cases[0].arrest_date = date(2010, 1, 1)
    example_crecord.cases[0].disposition_date = date(2010, 1, 1)
    assert example_crecord.years_since_last_arrested_or_prosecuted() > 5


def test_years_since_final_release(example_crecord):
    example_crecord.years_since_final_release()

def test_init_empty_fails():
    """ Fail without a Person to relate the record to. """
    with pytest.raises(TypeError):
        rec = CRecord()


def test_invalid_schema():
    with pytest.raises(TypeError):
        CRecord(**{
            "persons": {
                "first_name": "Blank"
            }
        })
