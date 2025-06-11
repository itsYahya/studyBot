#! /usr/bin/env bash

pip install -r requirements.txt

cd api

uvicorn main:app --host 0.0.0.0 --port 8000 --reload