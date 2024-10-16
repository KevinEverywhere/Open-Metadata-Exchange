#!/usr/bin/env python3

"""
The purpose of this tool is to read a captured .har file and
create a directory structure under '/static' DIRECTORY and
save the json content from the har file in "index.json" files,
to be served by server.helpers.MocAPI middleware.

typical usage:
./har_parser.py ../../static/ name_of_har_file.har
"""

import json
import sys
from urllib.parse import urlparse
import os


outputDir = sys.argv[1]
harFile = sys.argv[2]


def getPath(entry):
    parts = urlparse(entry["request"]["url"])
    return parts.path


def isApiCall(entry):
    path = getPath(entry)
    mimeType = entry["response"]["content"]["mimeType"]
    return path.startswith("/api/imls/") and mimeType == "application/json"


def ensureDir(dir):
    if not os.path.isdir(dir):
        os.makedirs(dir)


def getResponse(entry):
    try:
        return json.loads(entry["response"]["content"]["text"])
    except Exception:
        print(getPath(entry))
        print(entry["response"]["content"].keys())
        return {}


with open(harFile, "r") as f:
    har = json.load(f)
    for entry in har["log"]["entries"]:
        if isApiCall(entry):
            path = getPath(entry)[1:]
            full_dir = os.path.join(outputDir, path)
            ensureDir(full_dir)

            filename = "index.json"
            full_path = os.path.join(full_dir, filename)
            response = getResponse(entry)
            json.dump(response, open(full_path, "w"))
