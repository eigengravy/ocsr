import pandas as pd
import sys

df_core = pd.DataFrame(columns=['name', 'short-name'])
df = pd.read_csv("../resources/CORE.csv")
for index, row in df.iterrows():
    # Check if rank is A* or A
    if(row["rank"] == "A*"):
        df_core.loc[len(df_core)] = [row["name"], row["short-name"].lower()]
        # Remove the row
        df = df.drop(index)
        
        # check if the short-name is already present in the df_core (except short-name)
        if row["short-name"] not in df_core["short-name"].values:
            df_core.loc[len(df_core)] = [row["short-name"], row["short-name"].lower()]
            
for index, row in df_core.iterrows():
    print(f'"{row["name"]}": "{row["short-name"]}",')