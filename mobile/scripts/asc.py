"""Petites actions App Store Connect via l'API officielle (clé ASC_KEY_P8 des secrets GitHub).
Usage : python3 asc.py prix-gratuit | etat | preparer [version] | soumettre"""
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

EDITABLE = ("PREPARE_FOR_SUBMISSION", "DEVELOPER_REJECTED", "REJECTED", "METADATA_REJECTED", "WAITING_FOR_REVIEW", "INVALID_BINARY")

def version_editable(want=None):
    """La version App Store en préparation ; créée si elle n'existe pas encore (want = « 1.0.1 »)."""
    vers = api("GET", f"/v1/apps/{APP_ID}/appStoreVersions?filter[platform]=IOS&limit=10")["data"]
    v = next((x for x in vers if x["attributes"]["appStoreState"] in EDITABLE), None)
    if v: return v["id"], v["attributes"]["versionString"]
    if not want: sys.exit("Aucune version en préparation : indique le numéro, ex. preparer 1.0.1")
    v = api("POST", "/v1/appStoreVersions", {"data": {"type": "appStoreVersions", "attributes": {"platform": "IOS", "versionString": want, "releaseType": "MANUAL"},
            "relationships": {"app": {"data": {"type": "apps", "id": APP_ID}}}}})["data"]
    print("Version", want, "créée ✓"); return v["id"], want

def preparer():
    want = sys.argv[2] if len(sys.argv) > 2 else None
    vid, vstr = version_editable(want)
    builds = [b for b in api("GET", f"/v1/builds?filter[app]={APP_ID}&filter[processingState]=VALID&sort=-uploadedDate&limit=10")["data"]
              if b["attributes"].get("expired") is not True]
    pre = api("GET", f"/v1/builds/{builds[0]['id']}/preReleaseVersion")["data"]["attributes"]["version"]
    if pre != vstr: sys.exit(f"Le dernier build est en {pre}, pas en {vstr} : attendre la fin du traitement du build.")
    b = builds[0]
    notes_path = os.path.join(os.path.dirname(__file__), "..", "fastlane", "metadata", "fr-FR", "release_notes.txt")
    if os.path.exists(notes_path):
        locs = api("GET", f"/v1/appStoreVersions/{vid}/appStoreVersionLocalizations")["data"]
        fr = next((l for l in locs if l["attributes"]["locale"] == "fr-FR"), None)
        wn = open(notes_path).read().strip()
        if fr: api("PATCH", f"/v1/appStoreVersionLocalizations/{fr['id']}", {"data": {"type": "appStoreVersionLocalizations", "id": fr["id"], "attributes": {"whatsNew": wn}}})
        else: api("POST", "/v1/appStoreVersionLocalizations", {"data": {"type": "appStoreVersionLocalizations", "attributes": {"locale": "fr-FR", "whatsNew": wn},
                  "relationships": {"appStoreVersion": {"data": {"type": "appStoreVersions", "id": vid}}}}})
        print("Nouveautés (fr-FR) ✓")
    api("PATCH", f"/v1/appStoreVersions/{vid}/relationships/build", {"data": {"type": "builds", "id": b["id"]}})
    print("Build rattaché :", b["attributes"]["version"])
    api("PATCH", f"/v1/appStoreVersions/{vid}", {"data": {"type": "appStoreVersions", "id": vid, "attributes": {"releaseType": "MANUAL"}}})
    print("Publication : manuelle ✓")
    notes = open(os.path.join(os.path.dirname(__file__), "..", "fastlane", "metadata", "review_information", "notes.txt")).read()
    attrs = {"contactFirstName": "Guillaume", "contactLastName": "Jacques", "contactPhone": "+33688708544", "contactEmail": "contact@guillaumejacques.fr",
             "demoAccountRequired": True, "demoAccountName": "contact+applereview@guillaumejacques.fr", "notes": notes}
    cur = api("GET", f"/v1/appStoreVersions/{vid}/appStoreReviewDetail")
    if cur.get("data"):
        rid = cur["data"]["id"]
        api("PATCH", f"/v1/appStoreReviewDetails/{rid}", {"data": {"type": "appStoreReviewDetails", "id": rid, "attributes": attrs}})
    else:
        api("POST", "/v1/appStoreReviewDetails", {"data": {"type": "appStoreReviewDetails", "attributes": attrs,
             "relationships": {"appStoreVersion": {"data": {"type": "appStoreVersions", "id": vid}}}}})
    print("Infos de revue : contact, notes, compte de démo (identifiant) ✓ — mot de passe à saisir dans App Store Connect")

def soumettre():
    vid, vstr = version_editable()
    sub = api("POST", "/v1/reviewSubmissions", {"data": {"type": "reviewSubmissions", "attributes": {"platform": "IOS"},
          "relationships": {"app": {"data": {"type": "apps", "id": APP_ID}}}}})["data"]
    api("POST", "/v1/reviewSubmissionItems", {"data": {"type": "reviewSubmissionItems",
        "relationships": {"reviewSubmission": {"data": {"type": "reviewSubmissions", "id": sub["id"]}},
                          "appStoreVersion": {"data": {"type": "appStoreVersions", "id": vid}}}}})
    api("PATCH", f"/v1/reviewSubmissions/{sub['id']}", {"data": {"type": "reviewSubmissions", "id": sub["id"], "attributes": {"submitted": True}}})
    print("Version", vstr, "soumise à la revue Apple ✓")

{"prix-gratuit": prix_gratuit, "etat": etat, "preparer": preparer, "soumettre": soumettre}[sys.argv[1]]()
