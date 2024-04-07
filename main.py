import gzip
import sys
from pprint import pprint
from typing import Dict, List
import pandas as pd

# User scripts
import aliases

import xmltodict

from constants import AUTHORS, PUBLICATION_VENUES
DEBUG = True

s = set()
count = 0

# Generate aliases
df_aliases = aliases.start_gen()

df = pd.DataFrame(columns = ["name","dept","area","count","adjustedcount","year"])

def process_multiple_authors(authors: list, 
                             year : int, area: str) -> [str]:
    processed_authors: List[str] = []
    for author in authors:
        processed_authors += process_single_author(author, year, area)
    return processed_authors


def process_single_author(author_entity: str | dict, year : int, 
                          area: str):
    global df, df_aliases
    
    if isinstance(author_entity, dict):
        x = author_entity.get("#text")
    elif isinstance(author_entity, str):
        x = author_entity
    else:
        print("Error: Unknown type")
        raise ValueError(type(author_entity))
    
    if DEBUG:  
        if (x in AUTHORS 
                and area in PUBLICATION_VENUES):  
            # Procure the name of the author and university from the alias table
            if not (df_aliases.loc[df_aliases['alias'] == x].empty and df_aliases.loc[df_aliases['dept'] == x].empty):
                x = df_aliases.loc[df_aliases['alias'] == x, ['name']].values[0][0]
                dept = df_aliases.loc[df_aliases['alias'] == x, ['dept']].values[0][0]
                print("Author found in alias table: ", x)
            else: # This case should never happen ideally
                x = "Unknown"
                dept = "Unknown"
            
            # Increase the count of the author in df for that year (if exists, if not, initialize to 1)
            if(df.loc[(df['name'] == x) 
                            & (df['year'] == year) 
                            & (df['area'] == area)
                            & (df['dept'] == dept)].empty):
                df.loc[len(df)] = [x, dept, area, 1, 0.0, year]
                if DEBUG:
                    print("Count for author " + x + " for year " + year + " has been set to 1.")
            else:
                df.loc[(df['name'] == x) 
                                & (df['year'] == year) 
                                & (df['area'] == area)
                                & (df['dept'] == dept), 'count'] += 1
            if DEBUG:
                print("Count for author " + x + " for year " + year + " increased to: ", 
                    df.loc[(df['name'] == x) 
                                    & (df['year'] == year)
                                    & (df['area'] == area)
                                    & (df['dept'] == dept), ['count']].values[0][0])
            
    return [x]



def xml_print(key, val):
    global count, df

    item_type = key[1][0]

    if item_type == "article" or item_type == "inproceedings":

        conference_name = val.get("booktitle")
        journal_title = val.get("journal")
        year = val.get("year")
        authors = val.get("author")
        author_count = None
        area = (conference_name or journal_title or None)
        
        if area is None: # Skip if no area
            return True

        if authors is None:  # Skip if no authors
            return True

        if isinstance(authors, list):  # multiple authors
            processed_authors = process_multiple_authors(authors, year, area)
        else:  # single author
            processed_authors = process_single_author(authors, year, area)

        author_count = len(processed_authors)

        # x = key[1]
        x = val.get("author")

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

            print(
                PUBLICATION_VENUES.get(area)
            )
            pprint(processed_authors)

            
            # Increase the adjusted count of the author in df by adding the inverse of the author count
            for author in processed_authors:
                if (author in AUTHORS 
                        and area in PUBLICATION_VENUES):
                    dept = df_aliases.loc[df_aliases['name'] == author, ['dept']].values[0][0]
                    df.loc[(df['name'] == author) 
                                    & (df['year'] == year) 
                                    & (df['area'] == area)
                                    & (df['dept'] == dept), 'adjustedcount'] += 1/author_count
                    print(f"Adjusted count for author {author} for year {year} increased to: ", 
                        df.loc[(df['name'] == author) 
                                        & (df['year'] == year)
                                        & (df['area'] == area)
                                        & (df['dept'] == dept), ['adjustedcount']].values[0][0])
        if DEBUG:
            print(author_count)
            print()

            if count >= 32:
                sys.exit(0)

    return True


xmltodict.parse(
    gzip.GzipFile("./resources/dblp.xml.gz"), item_depth=2, item_callback=xml_print
)

print(f"Total records found: {count}")
print(df)
