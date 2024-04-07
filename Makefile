.PHONY: download-dblp init

main.py: dblp.xml.gz
	python3 main.py

init:
	python3 -m venv venv
	. venv/bin/activate
	pip install -r requirements.txt

download-dblp:
	rm -f dblp.xml.gz
	wget -o dblp-original.xml.gz https://dblp.org/xml/dblp.xml.gz