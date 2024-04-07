import pandas as pd

df_alias = pd.DataFrame(columns=["alias", "name", "dept"])
df_affiliation = None
df_ind_affiliation = pd.DataFrame(columns=["name", "affiliation", "homepage", "scholarid"])


# Create affliation table
def read_affliations():
    return pd.read_csv("./example/affiliations.csv")

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
