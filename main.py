"""
This Python script processes a gzipped XML file containing publication data 
(dblp.xml.gz) to count the number of publications by author and area (publication venue) 
over the years. It leverages a separate table of aliases (aliases.py) to disambiguate author names. 
The script first reads the alias table and then iterates through the publication data, identifying authors, 
their affiliations (departments), publication years, and areas. It keeps track of publication counts and 
calculates adjusted publication counts (inverse of author count per publication) for each author-year-area entry. 
Finally, it saves the results to a CSV file (output-generated-authors.csv).
"""


import gzip
import sys
from pprint import pprint
from typing import List

import pandas as pd
import xmltodict
import time
from progress.spinner import PixelSpinner

# User scripts
import aliases
from constants import AUTHORS, PUBLICATION_VENUES

DEBUG = True # DEBUG mode enabled / disabled
limit = 180 # time limit in minutes

count = 0 # Internal count variable

# Generate aliases
df_aliases = aliases.start_gen()

startTime = time.time()

df = pd.DataFrame(columns=["name", "dept", "area", "count", "adjustedcount", "year"])


def process_multiple_authors(authors: list, year: int, area: str) -> [str]:
    processed_authors: List[str] = []
    author_count = 0
    for author in authors:
        single_author, _ = process_single_author(author, year, area)
        if single_author is []:
            continue
        
        processed_authors += single_author
        author_count += 1
    return processed_authors, author_count


def process_single_author(author_entity: str | dict, year: int, area: str):
    global df, df_aliases

    if isinstance(author_entity, dict):
        x = author_entity.get("#text")
    elif isinstance(author_entity, str):
        x = author_entity
    else:
        print("Error: Unknown type")
        raise ValueError(type(author_entity))

    #if DEBUG:
        #if x in AUTHORS and area in PUBLICATION_VENUES:
    # Procure the name of the author and university from the alias table
    if not (
        df_aliases.loc[df_aliases["name"] == x].empty
        and df_aliases.loc[df_aliases["dept"] == x].empty
    ):
        x = df_aliases.loc[df_aliases["name"] == x, ["name"]].values[0][0]
        dept = df_aliases.loc[df_aliases["name"] == x, ["dept"]].values[0][0]
        print("Author found in alias table ", x , " || dept: ", dept)
    else:  # This case should never happen ideally
        return [], 1

    # Increase the count of the author in df for that year (if exists, if not, initialize to 1)
    if df.loc[
        (df["name"] == x)
        & (df["year"] == year)
        & (df["area"] == area)
        & (df["dept"] == dept)
    ].empty:
        df.loc[len(df)] = [x, dept, area, 1, 0.0, year]
        if DEBUG:
            print(
                "Count for author "
                + x
                + " for year "
                + year +
                " in area "
                + area 
                + " has been set to 1."
            )
    else:
        df.loc[
            (df["name"] == x)
            & (df["year"] == year)
            & (df["area"] == area)
            & (df["dept"] == dept),
            "count",
        ] += 1
        print(
            "Count for author " + x + " for year " + year + " increased to: ",
            df.loc[
                (df["name"] == x)
                & (df["year"] == year)
                & (df["area"] == area)
                & (df["dept"] == dept),
                ["count"],
            ].values[0][0],
        )

    return [x], 1


def xml_print(key, val):
    global count, df, limit
    spinner.next()

    item_type = key[1][0]

    if item_type == "article" or item_type == "inproceedings":

        conference_name = val.get("booktitle")
        journal_title = val.get("journal")
        year = val.get("year")
        authors = val.get("author")
        author_count = None
        area = conference_name or journal_title or None
        if area in PUBLICATION_VENUES:
            area = PUBLICATION_VENUES.get(area)
        else:
            return True
        
        if area is None:  # Skip if no area
            return True
        

        if authors is None:  # Skip if no authors
            return True     
        

        if isinstance(authors, list):  # multiple authors
            processed_authors, author_count = process_multiple_authors(authors, year, area)
        else:  # single author
            processed_authors, author_count = process_single_author(authors, year, area)
        
        if processed_authors == []:
            return True
        
        pprint(processed_authors)

        # x = key[1]
        x = val.get("author")
        
        if(time.time() - startTime > limit*60):
            df.to_csv("output-generated-authors.csv", index=False)
            sys.exit(0)

        # Increase the adjusted count of the author in df by adding the inverse of the author count
        for author in processed_authors:
            #if author in AUTHORS and area in PUBLICATION_VENUES:
            dept = df_aliases.loc[
                df_aliases["name"] == author, ["dept"]
            ].values[0][0]
            df.loc[
                (df["name"] == author)
                & (df["year"] == year)
                & (df["area"] == area)
                & (df["dept"] == dept),
                "adjustedcount",
            ] += (
                1 / author_count
            )
            print(
                f"Adjusted count for author {author} for year {year} increased to: ",
                df.loc[
                    (df["name"] == author)
                    & (df["year"] == year)
                    & (df["area"] == area)
                    & (df["dept"] == dept),
                    ["adjustedcount"],
                ].values[0][0],
            )
        
        # DEBUG ONLY
        if DEBUG:
            # if not (journal_title is not None):
            #     return True
            if not (
                area in PUBLICATION_VENUES
            ):  # Skip if conference/journal not in list
                return True
            if not (
                any(author in processed_authors for author in AUTHORS)
            ):  # Skip if no author in list
                return True

            count += 1

            print(PUBLICATION_VENUES.get(area))
            pprint(processed_authors)

        print(author_count)
        print()
        if DEBUG:
            if count >= 32:
                sys.exit(0)

    return True


spinner = PixelSpinner("Processing")
spinner.start()

xmltodict.parse(
    gzip.GzipFile("./resources/dblp.xml.gz"), item_depth=2, item_callback=xml_print
)

spinner.finish()

print(f"Total records found: {count}")
print(df.head())

df.to_csv("output-generated-authors.csv", index=False)
