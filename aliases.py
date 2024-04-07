"""
This Python script generates a table of aliases for researchers based on affiliations and scholar IDs. 
It reads an affiliation table, iterates through it, and identifies researchers with the same homepage or
scholar ID (potentially indicating the same person). It then creates a new table containing aliases 
(other names for the same researcher) and saves it to a CSV file.
"""

import pandas as pd

df_alias = pd.DataFrame(columns=["alias", "name", "dept"])
df_affiliation = None
# df_ind_affiliation = pd.DataFrame(columns=["name", "affiliation", "homepage", "scholarid"])


# Create affliation table
def read_affliations():
    return pd.read_csv("./examples/affiliations.csv")

# def read_ind_affliations():
#     indian_inst = [
#         "BITS Pilani",
#         "BITS Pilani-Goa",
#         "CMI",
#         "IIIT Bangalore",
#         "IISc Bangalore",
#         "IIT Bombay",
#         "IMSc",
#         "ISI Kolkata",
#         "National Institute of Technology Warangal",
#         "Tata Inst. of Fundamental Research",
#     ]
    
#     for index, row in df_affiliation.iterrows():
#         if row["affiliation"] in indian_inst:
#             df_ind_affiliation.loc[len(df_ind_affiliation)] = [row["name"], row["affiliation"], row["homepage"], row["scholarid"]]
            
#     return df_ind_affiliation

def generate_aliases():
    global df_alias, df_affiliation

    for index, row in df_affiliation.iterrows():
        prof_name = row["name"]
        prof_uni = row["affiliation"]
        prof_homepage = row["homepage"]
        prof_scholar = row["scholarid"]

        # find aliases
        aliases = []

        # search the dataframe for same homepage or uni or scholar
        for index, row in df_affiliation.iterrows():
            if row["homepage"] == prof_homepage or row["scholarid"] == prof_scholar:
                if row["affiliation"] == prof_uni:
                    aliases.append(row["name"])

        # remove aliases and name from df_affiliation
        for it in aliases:
            df_affiliation = df_affiliation[df_affiliation["name"] != it]

        for it in aliases:
            df_alias.loc[len(df_alias)] = [it, prof_name, prof_uni]


def start_gen():
    global df_alias, df_affiliation

    df_affiliation = read_affliations()
    generate_aliases()

    df_alias.to_csv("aliases.csv", index=False)
    # print("Aliases generation has successfully completed.")
    return df_alias

# df_affiliation = read_affliations()
# df_ind_affiliation = read_ind_affliations()

# df_ind_affiliation.to_csv("affiliations.csv", index=False)