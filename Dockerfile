FROM python:3.8

WORKDIR /app

ENV UBUNTU_FRONTEND=noninteractive
USER root

ENV PYTHONWARNINGS="ignore"
RUN python -m pip install --upgrade wheel
RUN python -m pip install setuptools==56 pip==20.1
RUN pip3 install --upgrade gunicorn==20.0.4 gevent==23.9.1 supervisor==4.2.1 psycogreen==1.0.2 psycopg2==2.8.6 json-logging-py==0.2
RUN mv /usr/local/bin/gunicorn /usr/local/bin/gunicorn3
COPY requirements.txt /app
RUN pip install --no-cache-dir --pre -U -r requirements.txt
COPY dev-requirements.txt /app
RUN pip install --no-cache-dir -U -r dev-requirements.txt

COPY release.uat /release.uat
RUN git clone https://github.com/astrothesaurus/UAT.git
WORKDIR /app/UAT
RUN git checkout `cat /release.uat`

WORKDIR /app

RUN useradd -ms /bin/bash uat-user

EXPOSE 8000