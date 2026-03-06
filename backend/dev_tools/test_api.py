import urllib.request
import json
import sqlite3

def check_db():
    conn = sqlite3.connect('/Users/nayanasp/Desktop/NEURO/backend/instance/neuordb.sqlite', timeout=10) # check correct db name
    # Wait, lets just list db files in instance/
    import glob
    print(glob.glob('/Users/nayanasp/Desktop/NEURO/backend/instance/*'))

check_db()
