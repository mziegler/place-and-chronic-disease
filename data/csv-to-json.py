"""
Converts the data-coding CSV files to JSON for the app
"""

from csv import DictReader
import json

places = []

with open('places-coded-1.csv') as csvfile:
    reader = DictReader(csvfile)
    reader_list = list(reader) #dump into dict so we can use it twice

    for line in reader_list:

        newplace = {}

        newplace['name'] = line['name']

        newplace['coords'] = [float(c) for c in line['coords'].split(',')][::-1]

        newplace['tags'] = {
            attribute : True
            for attribute, value in line.items()
            if attribute not in ['place', 'coords'] and value.lower().startswith('y')
        }

        newplace['comments'] = [
            value.split(':')[1].strip()
            for attribute, value in line.items()
            if ':' in value
        ]

        places.append(newplace)


with open('places-coded-1.json', 'w') as fout:
    json.dump(places, fout, indent=4, sort_keys=True)
