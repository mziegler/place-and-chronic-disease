"""
Converts the data-coding CSV files to JSON for the app
"""

from csv import DictReader
import json

places = []

with open('placecoding-ave-v2.csv') as csvfile:
    reader = DictReader(csvfile)
    reader_list = list(reader) #dump into dict so we can use it twice

    for line in reader_list:

        newplace = {}

        newplace['id'] = len(places)

        newplace['name'] = line['name']

        newplace['coords'] = [float(c) for c in line['coords'].split(',')][::-1]

        newplace['google_id'] = line['google id']

        newplace['tags'] = {
            attribute : True
            for attribute, value in line.items()
            if attribute not in ['place', 'coords', 'google id'] and value.lower().startswith('y')
        }

        newplace['unsure'] = {
            attribute : True
            for attribute, value in line.items()
            if attribute not in ['place', 'coords', 'google id'] and value.lower().startswith('?')
        }

        newplace['comments'] = {
            attribute : value.split(':')[1].strip()
            for attribute, value in line.items()
            if attribute not in ['place', 'coords', 'google id'] and (':' in value)
        }

        places.append(newplace)


with open('placecoding-ave-v2.json', 'w') as fout:
    json.dump(places, fout, indent=4, sort_keys=True)
