"""Petites actions App Store Connect via l'API officielle (clé ASC_KEY_P8 des secrets GitHub).
Usage : python3 asc.py prix-gratuit | etat"""
import json, os, re, sys, textwrap, time, urllib.request, urllib.error
import jwt  # pyjwt

APP_ID = "6830088405"
KID, ISS = os.environ["ASC_KEY_ID"], os.environ["ASC_ISSUER_ID"]
raw = os.environ["ASC_KEY_P8"].replace("\r", "")
body = re.sub(r"[^A-Za-z0-9+/=]", "", re.sub(r"-----(BEGIN|END)[^-]*-----", "", raw))
KEY = "-----BEGIN PRIVATE KEY-----\n" + "\n".join(textwrap.wrap(body, 64)) + "\n-----END PRIVATE KEY-----\n"

def tok():
    now = int(time.time())
    return jwt.encode({"iss": ISS, "iat": now, "exp": now + 900, "aud": "appstoreconnect-v1"}, KEY, algorithm="ES256", headers={"kid": KID, "typ": "JWT"})

def api(method, path, data=None):
    req = urllib.request.Request("https://api.appstoreconnect.apple.com" + path, method=method,
                                 data=json.dumps(data).encode() if data is not None else None,
                                 headers={"Authorization": "Bearer " + tok(), "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req) as r:
            t = r.read().decode(); return json.loads(t) if t else {}
    except urllib.error.HTTPError as e:
        print("ERREUR", e.code, e.read().decode()[:1500]); sys.exit(1)

def prix_gratuit():
    pts = api("GET", f"/v1/apps/{APP_ID}/appPricePoints?filter[territory]=USA&limit=200")
    free = next(p for p in pts["data"] if float(p["attributes"]["customerPrice"]) == 0.0)
    api("POST", "/v1/appPriceSchedules", {
        "data": {"type": "appPriceSchedules",
                 "relationships": {"app": {"data": {"type": "apps", "id": APP_ID}},
                                   "baseTerritory": {"data": {"type": "territories", "id": "USA"}},
                                   "manualPrices": {"data": [{"type": "appPrices", "id": "${p0}"}]}}},
        "included": [{"type": "appPrices", "id": "${p0}",
                      "attributes": {"startDate": None},
                      "relationships": {"appPricePoint": {"data": {"type": "appPricePoints", "id": free["id"]}}}}]})
    print("Prix : gratuit ✓")

def etat():
    v = api("GET", f"/v1/apps/{APP_ID}/appStoreVersions?limit=5")
    for x in v["data"]: print("Version", x["attributes"]["versionString"], x["attributes"]["appStoreState"], x["id"])
    b = api("GET", f"/v1/builds?filter[app]={APP_ID}&sort=-uploadedDate&limit=5")
    for x in b["data"]: print("Build", x["attributes"]["version"], x["attributes"]["processingState"], x["id"])

{"prix-gratuit": prix_gratuit, "etat": etat}[sys.argv[1]]()
