# RecordLib

Library for handling Criminal Records information in Pennsylvania.

Right now this is only an experimental project for trying out some ideas and new tooling (e.g., trying out some of the newer python features like type annotations and data classes)




## Goals

The ultimate goal is to develop a flexible and transparent pipeline for analyzing criminal records in Pennsylvania for expungeable and sealable cases and charges. We'd like to be able to take various inputs - pdf dockets, web forms, scanned summary sheets - build an idea of what a person's criminal record looks like, and then produce an analysis of what can be expunged or sealed (and _why_ we think different things can be expunged or sealed).


The pieces of this pipeline could be used in different interfaces.

A commandline tool could process a list of documents or the names of clients, and try to analyze the whole list in bulk.

A web application could take a user through the steps of the pipeline and allow the user to see how the analysis proceeds from inputs to output petitions. The application could allow the user to load some documents, then manually check the Record that the system builds out of those documents before proceeding to analyze the record.

Ideally, the expungement rules that get applied will also be written in a clear enough way that non-programmer lawyers can review them.

## Domain Model

There are I think five kinds of objects involved in this framework.

1. Criminal Records raw inputs - these are things like a pdf of a docket or a web form that asks a user about criminal record information.
2. A Criminal Record - the authoritative representation of what a person's criminal record is. Its made by compiling raw inputs.
3. Expungement/Sealing Rules - functions that take a Record and return an analysis of how a specific expungement or sealing rule applies to the record. What charges or cases does a specific rule allow to be sealed/expunged?
4. Analysis - some sort of object that encapsulates how different rules apply to a record
5. Document Generator - a function that takes an analysis and information about a user (i.e., their attorney identification info) and produces a set of documents that includes drafts of petitions for a court.

## Aspirational Example Usage

	person = Person(first_name="Joan", last_name="Smith", date_of_birth=date(1970, 1, 1))
    record = CRecord(person)
    assert record.cases == [] # True

    docket = Docket("path/to/docket.pdf")
    summary = Summary("path/to/summary.pdf")

    record.add_docket(docket)
    record.add_summary(summary)

    # CRecord loaded all the cases from the docket and summary
    assert len(record.cases) > 0

	record.cases == [a list of cases]
	record.cases[0].charges == [a list of charges on a case]
	record.cases[0].feescosts = (amt owed: ..., amt paid: ..., fees that could be waived.)

    expungement_rule_methods = [
        expunge_over_70_years,
        expunge_nonconvictions,
        expunge_summary_convictions,
        seal_misdemeanor_convictions
    ]

    original_record, modified_record, analysis = pipeline(CRecord, expungement_rule_methods)

	analysis ==
	{
		personInfo: {},
		full_expungments: [case],
		partial_expungements: [case],
		sealing: [
			{case: []
			 	charges: []
			}
		]

	}

    generate_petiton_packet(original_record, analysis)


## Roadmap

Right now I'm working on several pieces more or less simultaneously.

1. grammars for parsing summary sheets and dockets from pdfs
2. The CRecord class for managing information about a person's record (what methods and properties does it need to have?)
3. RuleDef functions - functions that take a CRecord and apply a single legal rule to it. I'm trying to figure out the right thing to return.


## Testing

Run automated tests with `pytest`.

Grammars need to be tested on lots of different documents. The tests include tests that will try to parse all the dockets in a folder `tests/data/[summaries|dockets]`. If you want those tests to be meaningful, you need to put dockets there.

You could do this manually by downloading dockets and saving them there. You can also use a helper script that randomly generates docket numbers and then uses [natev/DocketScraperAPI](https://hub.docker.com/r/natev/docketscraper_api) to download those dockets. To do this

1. download and run the DocketScraperAPI image with `docker run natev/DocketScraperAPI -p 8800:8800`
2. in this project environment, run `download (summaries | dockets) [-n = 1]`

TODO I would like to try out `hypothesis` for property-based testing.


## Developing Grammars

The project currently uses `parsimonious` and Parsing Expression Grammars to parse pdf documents and transform them from a pdf file to an xml document.

Developing grammars is pretty laborious. Some tips:

**Parse text w/ subrule** With parsimonious, you can try parsing a bit of text with a specific rule, with `mygrammar['rule'].parse("text")`

So if you have a variable of the lines of your document, then you can more quickly test specific parts of the doc with specific parts of the grammar.

**Autogenerate the NodeVisitor** RecordLib with Parsimonious transforms a document with a grammar in two phases. First, Parsimonious uses a grammar to build a tree of the document. Then a NodeVisitor visits each node of the tree and does something, using a NodeVisitor subclass we have to create. The `CustomVisitorFactory` from RecordLib creates such a NodeVisitor with default behavior that's helpful to us. By passing the Factory a list of the terminal and nonterminal symbols in the grammar, the Factory will give us a class that will take a parsed document and wrap everything under terminal and nonterminal symbols in tags with the symbol's name. Terminal symbols will also have their text contents included as the tag content. NonTerminal symbols will only wrap their children (who are eventually terminal symbols).

## other issues

Right now pdf-to-text parsing is done with PyPDF2. That seeems to be unmaintained. We might do the command line pdftotext binary, or maybe there's some other python library we could use? Maybe parse_pdf should use dependency injection to be able to swap out text-extractors.
