import pandas as pd

# Read `resources/country-info.csv`
country_info = pd.read_csv("resources/country-info.csv")

# Filter rows where `region` is 'asia' and `countryabbrv` is 'in'
indian_unis = country_info[
    (country_info["region"] == "asia") & (country_info["countryabbrv"] == "in")
]["institution"]

print(indian_unis.to_list())
