# Open CS Rankings

##  Overview

<code>► This project proposes to improve CSRankings, a ranking system for computer science research. The project will address limitations of CSRankings by allowing users to filter and sort publications by various criteria, including journals and conferences. Additionally, the team will automate data updates and rebuild CSRankings with a more efficient parser written in Python. Finally, the improved system will be open-sourced under a permissive license to allow for wider use and customization. </code>

##  Repository Structure

```sh
└── ./
    ├── Makefile
    ├── README.md
    ├── aliases.csv
    ├── aliases.py
    ├── constants.py
    ├── examples
    │   ├── affiliations.csv
    │   ├── conferences.csv
    │   └── test-generated-authors.csv
    ├── main.py
    ├── output-generated-authors.csv
    ├── requirements.txt
    └── utils
        ├── core.py
        ├── extract_indian_unis.py
        └── ieee_transactions.py
```

##  Getting Started

**System Requirements:**

* **Python**: `version 3.11.2`

###  Installation

<h4>From <code>source</code></h4>

> 1. Clone the . repository:
>
> ```console
> $ git clone ../.
> ```
>
> 2. Change to the project directory:
> ```console
> $ cd .
> ```
>
> 3. Install the dependencies:
> ```console
> $ pip install -r requirements.txt
> ```

###  Usage

<h4>From <code>source</code></h4>

> Run . using the command below:
> ```console
> $ python3 main.py
> ```

---
