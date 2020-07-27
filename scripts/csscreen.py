from __future__ import annotations
import click
from ujs_search.services.searchujs import search_by_docket, search_by_name
from RecordLib.utilities.serializers import to_serializable
from RecordLib.crecord import CRecord, Person
from RecordLib.sourcerecords import SourceRecord
from RecordLib.sourcerecords.docket.re_parse_cp_pdf import parse_cp_pdf_text
from RecordLib.sourcerecords.docket.re_parse_mdj_pdf import parse_mdj_pdf_text
from RecordLib.sourcerecords.parsingutilities import get_text_from_pdf
from RecordLib.analysis import Analysis
from RecordLib.analysis import ruledefs as rd
from RecordLib.utilities.email_builder import EmailBuilder
from typing import Callable, Optional
from datetime import datetime
import tempfile
import requests
import os
import re
import json
import logging
import shutil


logger = logging.getLogger(__name__)


def pick_pdf_parser(docket_num):
    if "CP" in docket_num or "MC" in docket_num:
        parser = parse_cp_pdf_text
    elif "MJ" in docket_num:
        parser = parse_mdj_pdf_text
    else:
        logger.error(f"   Cannot determine the right parser for: {docket_num}")
        parser = None
    return parser


def communicate_results(
    sourcerecords: List[SourceRecord],
    analysis: Analysis,
    output_json_path: str,
    output_html_path: str,
    email_address,
) -> None:
    """
    Communicate the results of the record screening.

    Right now, this just means print them out.
    """
    sources = []
    for sr in to_serializable(sourcerecords):
        sr.pop("raw_source")
        sources.append(sr)
    results = {"sourcerecords": sources, "analysis": to_serializable(analysis)}
    message_builder = EmailBuilder(sources, analysis)
    if output_json_path is not None:
        with open(output_json_path, "w") as f:
            f.write(json.dumps(results, indent=4))
        logger.info(f"    Analysis written to {output_json_path}.")
    if output_html_path is not None:
        with open(output_html_path, "w") as f:
            html_message = message_builder.html()
            f.write(html_message)
    if email_address is not None:
        message_builder.email(email_address)


@click.group()
def cli():
    pass


@cli.command()
@click.option("--first-name", "-fn", help="First Name", required=True)
@click.option("--last-name", "-ln", help="Last Name", required=True)
@click.option("--dob", "-d", help="Date of Birth", required=True)
@click.option(
    "--date-format",
    help="Date format",
    default=r"%m/%d/%Y",
    required=False,
    show_default=True,
)
@click.option("--output-json", "-oj", help="Path to ouput the json data", default=None)
@click.option("--output-html", "-oh", help="Path to write html output", default=None)
@click.option("--email", "-e", help="Email address to send to (optional)", default=None)
@click.option(
    "--output-dir",
    "-od",
    help="Path to a directory to write downloaded pdfs.",
    default=None,
)
@click.option(
    "--log-level", help="Log Level", default="INFO", required=False, show_default=True
)
def name(
    first_name,
    last_name,
    dob,
    date_format,
    output_json,
    output_dir,
    output_html,
    email,
    log_level,
):
    """
    Screen a person's public criminal record for charges that can be expunged or sealed.
    """
    if output_dir is not None and not os.path.exists(output_dir):
        raise (ValueError(f"Directory {output_dir} does not exist."))
    logger.setLevel(log_level)
    click.echo(f"Screening {last_name}, {first_name}")
    starttime = datetime.now()
    dob = datetime.strptime(dob, date_format).date()
    # Search UJS for the person's name to collect source records.
    search_results = search_by_name(first_name, last_name, dob)
    search_results = search_results["MDJ"] + search_results["CP"]
    logger.info(f"    Found {len(search_results)} cases in the Portal.")
    # Download the source records
    # and xtract text from the source records.
    with tempfile.TemporaryDirectory() as td:
        for case in search_results:
            for source_type in ["docket_sheet", "summary"]:
                try:
                    resp = requests.get(
                        case[f"{source_type}_url"],
                        headers={"User-Agent": "CleanSlateScreener"},
                    )
                except requests.exceptions.MissingSchema as e:
                    # the case search results is missing a url. this happens when
                    # a docket doesn't have a summary, and is fairly common.
                    case[f"{source_type}_text"] = ""
                    continue
                if resp.status_code != 200:
                    case[f"{source_type}_text"] = ""
                    continue
                filename = os.path.join(td, f"{case['docket_number']}_{source_type}")
                with open(filename, "wb") as fp:
                    fp.write(resp.content)
                case[f"{source_type}_text"] = get_text_from_pdf(filename)
        if output_dir is not None:
            for doc in os.listdir(td):
                shutil.copy(os.path.join(td, doc), os.path.join(output_dir, doc))
    logger.info("   Collected texts from cases.")
    logger.info(f"   -time so far:{(datetime.now() - starttime).seconds}")
    # At this point, search_results looks like a list of search_result dicts,
    # where each dict also has a key containing the exported text of the docket and the summary.
    # [
    #       {
    #           "caption": "", "docket_number": "", "docket_sheet_text": "lots of \ntext",
    #           "summary_text": "lots of text" and other keys.
    #       }
    # ]

    # Next read through a Summary and find any docket numbers mentioned.
    # If any dockets are _not_ already found in the source_records,
    # collect them from ujs, download them, extract their text,
    docket_nums = set([case["docket_number"] for case in search_results])
    summary_docket_numbers = set()
    for case in search_results:
        summary_text = case["summary_text"]
        other_docket_nums_in_summary = set(
            re.findall(r"(?:MC|CP)\-\d{2}\-\D{2}\-\d*\-\d{4}", summary_text)
            + re.findall(r"MJ-\d{5}-\D{2}-\d+-\d{4}", summary_text)
        )
        summary_docket_numbers.update(other_docket_nums_in_summary)

    new_docket_numbers = summary_docket_numbers.difference(docket_nums)
    logger.info(
        f"    Searched summaries and found {len(new_docket_numbers)} cases not found through portal."
    )

    logger.info(f"   -time so far:{(datetime.now() - starttime).seconds}")
    for dn in new_docket_numbers:
        cases = search_by_docket(dn)
        if len(cases) > 0:
            case = cases[0]
        else:
            logger.error(f"Did not find case for docket {dn}")
            continue
        search_results.append(case)
        with tempfile.TemporaryDirectory() as td:
            for source_type in ["docket_sheet"]:
                resp = requests.get(
                    case[f"{source_type}_url"],
                    headers={"User-Agent": "CleanSlateScreener"},
                )
                if resp.status_code != 200:
                    continue
                filename = os.path.join(td, case["docket_number"])
                with open(filename, "wb") as fp:
                    fp.write(resp.content)
                case[f"{source_type}_text"] = get_text_from_pdf(filename)
            if output_dir is not None:
                for doc in os.listdir(td):
                    shutil.copy(os.path.join(td, doc), os.path.join(output_dir, doc))

    # Read the source records and integrate them into a CRecord
    # representing the person't full criminal record.
    sourcerecords = list()
    crecord = CRecord(
        person=Person(first_name=first_name, last_name=last_name, date_of_birth=dob)
    )
    for case in search_results:
        parser = pick_pdf_parser(case["docket_number"])
        if parser is None:
            continue
        sr = SourceRecord(case["docket_sheet_text"], parser)
        sourcerecords.append(sr)
        crecord.add_sourcerecord(sr, case_merge_strategy="overwrite_old")

    logger.info("Built CRecord.")
    logger.info(f"   -time so far:{(datetime.now() - starttime).seconds}")
    # Create and Analysis using the CRecord. This Analysis will explain
    # what charges and cases are expungeable, what will be automatically sealed,
    # what could be sealed by petition.

    analysis = (
        Analysis(crecord)
        .rule(rd.expunge_deceased)
        .rule(rd.expunge_over_70)
        .rule(rd.expunge_nonconvictions)
        .rule(rd.expunge_summary_convictions)
        .rule(rd.seal_convictions)
    )

    # email the results.
    communicate_results(sourcerecords, analysis, output_json, output_html, email)

    endtime = datetime.now()
    elapsed = endtime - starttime
    click.echo(f"Completed csscreen in {elapsed.seconds} seconds.")


@cli.command()
@click.option(
    "--input-dir",
    "-i",
    help="Path to directory containing docket_sheet files to parse.",
)
@click.option("--output-json", "-oj", help="Path to ouput the json data", default=None)
@click.option("--output-html", "-oh", help="Path to write html output", default=None)
@click.option("--email", "-e", help="Email address to send to (optional)", default=None)
@click.option(
    "--log-level", help="Log Level", default="INFO", required=False, show_default=True
)
def dir(input_dir, output_json, output_html, email, log_level):
    """
    Analyze a record given a directory of dockets relating to a single person and write a plain-english 
    explanation of the analysis.
    """
    if not os.path.exists(input_dir):
        raise ValueError(f"Directory {input_dir} doesn't exist.")

    logger.setLevel(log_level)
    docket_files = [f for f in os.listdir(input_dir) if "docket_sheet" in f]

    source_records = []
    for df in docket_files:
        parser = pick_pdf_parser(df)
        if parser is None:
            continue
        source_records.append(
            SourceRecord(get_text_from_pdf(os.path.join(input_dir, df)), parser)
        )

    crecord = CRecord()
    for source_rec in source_records:
        crecord.add_sourcerecord(source_rec, override_person=True)

    analysis = (
        Analysis(crecord)
        .rule(rd.expunge_deceased)
        .rule(rd.expunge_over_70)
        .rule(rd.expunge_nonconvictions)
        .rule(rd.expunge_summary_convictions)
        .rule(rd.seal_convictions)
    )

    # email the results.
    communicate_results(source_records, analysis, output_json, output_html, email)

    click.echo("Finished.")

