import re
from RecordLib.sourcerecords.docket.re_parse_cp_pdf import (
    parse_cp_pdf_text as re_parse_cp_pdf_text,
)
from RecordLib.sourcerecords.docket.re_parse_mdj_pdf import (
    parse_mdj_pdf_text as re_parse_mdj_pdf_text,
)
from typing import Tuple, List
from RecordLib.crecord import Person, Case
from RecordLib.sourcerecords.parsingutilities import get_text_from_pdf


def which_court(txt: str) -> str:
    """
    given the text of a docket, 
    """
    if re.search("common pleas", txt, re.I):
        return "CP"
    if re.search("magisterial district", txt, re.I):
        return "MDJ"
    return ""


def re_parse_pdf_text(txt: str) -> Tuple[Person, List[Case], List[str]]:
    court = which_court(txt)
    if court == "MDJ":
        return re_parse_mdj_pdf_text(txt)
    if court == "CP":
        return re_parse_cp_pdf_text(txt)


def re_parse_pdf(path: str) -> Tuple[Person, List[Case], List[str]]:
    """
    Parse, using regex parsers, a pdf of a docket. This function doesn't care what court the docket relates to. It will figure it out.
    """
    # pdf to raw text
    txt = get_text_from_pdf(path)
    if txt == "":
        return None, None, ["could not extract text from pdf"]

    return re_parse_pdf_text(txt)
