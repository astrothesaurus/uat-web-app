UAT_SHORTNAME = "UAT"
UAT_LONGNAME = "UAT Sorting Tool"
SENDER_EMAIL = "myemail@mydomain.com"
SORT_VERSION = "3.0.0"
UAT_SAVEFILE = "uatsaves"
UAT_META = '<meta name="description" content="Help us improve Unified Astronomy Thesaurus!"><meta name="keywords" content="UAT,astronomy,thesaurus,sorting tool,schema tool,wolbach,AAS,astronomy thesaurus">'
UAT_URL = "http://localhost"
UAT_LOGO = "uat-logo1-b.png"
MAILTO_EMAIL_HOST = "mail.domain.com"
MAILTO_PORT = 587
MAILTO_EMAIL_ADDR = "email@domain.com"
MAILTO_EMAIL_PASS = "password"
STATIC_PATH_VOCAB = '/app/static/UAT_list.json'
STATIC_PATH_HIERARCHY = '/app/static/UAT.json'

class Config:
    def __init__(self, config):
        self.shortname = config.get("UAT_SHORTNAME")
        self.longname = config.get("UAT_LONGNAME")
        self.version = config.get("SORT_VERSION")
        self.savefile = config.get("UAT_SAVEFILE")
        self.meta = config.get("UAT_META")
        self.url = config.get("UAT_URL")
        self.logo = config.get("UAT_LOGO")