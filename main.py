import gzip
import sys
from pprint import pprint
from typing import Dict, List

import xmltodict

from constants import AUTHORS, PUBLICATION_VENUES

s = set()
count = 0


def process_multiple_authors(authors: list) -> [str]:
    processed_authors: List[str] = []
    for author in authors:
        processed_authors += process_single_author(author)
    return processed_authors


def process_single_author(author_entity: str | dict):
    if isinstance(author_entity, dict):
        x = author_entity.get("#text")
    elif isinstance(author_entity, str):
        x = author_entity
    else:
        print("Error: Unknown type")
        raise ValueError(type(author_entity))
    return [x]


def xml_print(key, val):
    global count

    item_type = key[1][0]

    if item_type == "article" or item_type == "inproceedings":

        conference_name = val.get("booktitle")
        journal_title = val.get("journal")
        year = val.get("year")
        authors = val.get("author")
        author_count = None

        if authors is None:  # Skip if no authors
            return True

        if isinstance(authors, list):  # multiple authors
            processed_authors = process_multiple_authors(authors)
        else:  # single author
            processed_authors = process_single_author(authors)

        author_count = len(processed_authors)

        # x = key[1]
        x = val.get("author")

        # if not (journal_title is not None):
        #     return True
        if not (
            conference_name in PUBLICATION_VENUES or journal_title in PUBLICATION_VENUES
        ):  # Skip if conference/journal not in list
            return True
        if not (
            any(author in processed_authors for author in AUTHORS)
        ):  # Skip if no author in list
            return True

        count += 1

        print(
            PUBLICATION_VENUES.get(conference_name)
            or PUBLICATION_VENUES.get(journal_title)
        )
        pprint(processed_authors)
        print(author_count)
        print()

        if count >= 32:
            sys.exit(0)

    return True


xmltodict.parse(
    gzip.GzipFile("dblp-original.xml.gz"), item_depth=2, item_callback=xml_print
)

# Print set s to file 'scratchpad.txt'
# with open("scratchpad.txt", "w") as file:
#     for item in s:
#         file.write("%s\n" % item)

print(f"Total records found: {count}")
