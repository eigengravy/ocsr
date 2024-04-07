import pandas as pd

# Import `resources/scimagojr 2022 Subject Area - Computer Science.csv`
df = pd.read_csv(
    "resources/scimagojr 2022 Subject Area - Computer Science.csv", delimiter=";"
)

print(df.head())

print()

# Select all rows where Title starts with "IEEE Transactions" and SJR Best Quartile is Q1
df = df[
    df["Title"].str.startswith("IEEE Transactions") & (df["SJR Best Quartile"] == "Q1")
][["Title", "Categories"]]

df.to_csv("resources/ieee_transactions.csv")  # Corrected method name

print(df)
