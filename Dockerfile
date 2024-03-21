FROM python:3.8

WORKDIR /app

ENV UBUNTU_FRONTEND=noninteractive
USER root

ENV PYTHONWARNINGS="ignore"
RUN python -m pip install --upgrade wheel
RUN python -m pip install setuptools==56 pip==20.1
COPY requirements.txt /app
RUN pip install --no-cache-dir --pre -U -r requirements.txt
COPY dev-requirements.txt /app
RUN pip install --no-cache-dir -U -r dev-requirements.txt

RUN useradd -ms /bin/bash uat-user
