from fastapi import FastAPI, UploadFile, File, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image, ImageOps
import io
import time
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from datetime import datetime
import smtplib
from email.message import EmailMessage
from bson import ObjectId
from fastapi.staticfiles import StaticFiles

# ==========================================
# ⚙️ โหลดค่าจากไฟล์ .env
# ==========================================
load_dotenv()
MONGODB_URL = os.getenv("MONGODB_URL")
EMAIL_SENDER = os.getenv("EMAIL_SENDER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
EMAIL_RECEIVER = os.getenv("EMAIL_RECEIVER")

app = FastAPI()

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = None
db = None

@app.on_event("startup")
async def startup_db_client():
    global client, db
    if MONGODB_URL:
        client = AsyncIOMotorClient(MONGODB_URL)
        db = client.dental_ai_db 
        print("✅ Connected to MongoDB Atlas successfully!")
    else:
        print("⚠️ Warning: MONGODB_URL not found in .env file.")

@app.on_event("shutdown")
async def shutdown_db_client():
    if client:
        client.close()

# ==========================================
# 1. โหลดสมอง AI
# ==========================================
print("⏳ Loading Models...")
model_mfu = YOLO('mfu_model.pt')
model_roboflow = YOLO('roboflow_model.pt')
print("✅ Models Loaded!")

CLASS_NAMES_MFU = {
  0: "Astra Tech", 1: "BL", 2: "BLT", 3: "BLT RC", 4: "BLT SLA",
  5: "CAMLOG Screw Line", 6: "CONELOG Screw Line", 7: "CONELOG Snap Type",
  8: "Camlog", 9: "EV", 10: "GM Helix", 11: "ISII", 12: "ISIII",
  13: "ISIII Active", 14: "Neobiotech", 15: "Neodent", 16: "OsseoSpeed EV",
  17: "Osstem", 18: "Roxolid", 19: "SLA", 20: "Straumann",
  21: "TSII", 22: "TSIII", 23: "TSIII SA", 24: "Unspecified"
}

CLASS_NAMES_ROBOFLOW = {
  0: "Straumann", 1: "Astra Tech", 2: "Nobel Biocare", 3: "Osstem"
}

class ContactForm(BaseModel):
    name: str
    email: str
    message: str
    logged_in_email: str = None

def calculate_iou(box1, box2):
    x1_inter = max(box1[0], box2[0])
    y1_inter = max(box1[1], box2[1])
    x2_inter = min(box1[2], box2[2])
    y2_inter = min(box1[3], box2[3])

    inter_area = max(0, x2_inter - x1_inter) * max(0, y2_inter - y1_inter)
    box1_area = (box1[2] - box1[0]) * (box1[3] - box1[1])
    box2_area = (box2[2] - box2[0]) * (box2[3] - box2[1])
    union_area = box1_area + box2_area - inter_area

    if union_area == 0: return 0
    return inter_area / union_area

@app.get("/")
def read_root():
    return {"message": "Dental Implant AI API is ready!"}

@app.post("/contact")
async def submit_contact(form: ContactForm):
    if db is not None:
        try:
            new_message = form.dict()
            new_message["timestamp"] = datetime.utcnow().isoformat() + "Z"
            await db.contact_messages.insert_one(new_message)
            
          # 🌟 [แก้ไข] ให้แจ้งเตือนเด้งเข้า "บัญชีที่ล็อกอิน" ไม่ใช่อีเมลที่กรอก
            target_email = form.logged_in_email if form.logged_in_email else form.email
            
            user_prefs = await db.user_settings.find_one({"email": target_email}) or {}
            wants_web = user_prefs.get("webNotif", True)
            
            if wants_web:
                await db.notifications.insert_one({
                    "email": target_email, # 👈 ส่งไปกระดิ่งของคนที่ล็อกอิน
                    "type": "warning", 
                    "message": f"We received your message! We will reply to {form.email} shortly.",
                    "timestamp": datetime.utcnow().isoformat() + "Z",
                    "is_read": False
                })
            
            if EMAIL_SENDER and EMAIL_PASSWORD and EMAIL_RECEIVER:
                try:
                    msg = EmailMessage()
                    msg.set_content(f"คุณได้รับข้อความติดต่อใหม่จาก MFU Dental AI:\n\nชื่อผู้ส่ง: {form.name}\nอีเมลติดต่อกลับ: {form.email}\n\nข้อความ:\n{form.message}")
                    msg['Subject'] = f"🔔 [MFU Dental AI] New Contact Inquiry from {form.name}"
                    msg['From'] = EMAIL_SENDER
                    msg['To'] = EMAIL_RECEIVER
                    server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
                    server.login(EMAIL_SENDER, EMAIL_PASSWORD)
                    server.send_message(msg)
                    server.quit()
                    print(f"📧 Email successfully sent to {EMAIL_RECEIVER}!")
                except Exception as email_err:
                    print(f"❌ Failed to send email: {email_err}")

            return {"status": "success", "message": "Message saved and email sent successfully"}
        except Exception as e:
            return {"status": "error", "message": str(e)}
    return {"status": "error", "message": "Database not connected"}

# API สำหรับวิเคราะห์ภาพ X-ray
@app.post("/analyze")
async def analyze_implant(
    file: UploadFile = File(...),
    mode: str = Form("roboflow"),
    email: str = Form(None)
):
    image_data = await file.read()
    image = Image.open(io.BytesIO(image_data)).convert("RGB")
    image = ImageOps.autocontrast(image) 
    img_width, img_height = image.size

    case_id = f"AI-{int(time.time())}"
    file_path = f"uploads/{case_id}.jpg"
    image.save(file_path, "JPEG")

    # เช็คโควต้าการใช้งานก่อนรัน AI
    if email and db is not None:
        user_prefs = await db.user_settings.find_one({"email": email}) or {}
        plan = user_prefs.get("plan", "Free")
        
        if plan == "Enterprise": limit = 500
        elif plan == "Pro": limit = 100
        else: limit = 20
        
        usage_count = await db.analysis_history.count_documents({"email": email})
        if usage_count >= limit:
            return {"status": "error", "message": "QUOTA_EXCEEDED", "limit": limit}

    if mode == "mfu":
        selected_model = model_mfu
        class_map = CLASS_NAMES_MFU
    else:
        selected_model = model_roboflow
        class_map = CLASS_NAMES_ROBOFLOW

    # ดึงการตั้งค่าของ User
    ai_conf = 0.1 
    if db is not None and email:
        user_prefs = await db.user_settings.find_one({"email": email})
        if user_prefs and user_prefs.get("confidenceThreshold") == True:
            ai_conf = 0.4 
            print(f"🔒 Strict Mode Enabled for {email}: conf={ai_conf}")

    # AI ทำนายภาพ 
    results = selected_model.predict(
        source=image,
        imgsz=640,
        conf=ai_conf, 
        iou=0.45,
        augment=True,
        agnostic_nms=False 
    )
    
    raw_boxes = []
    for result in results:
        for box in result.boxes:
            raw_boxes.append({
                "box": box.xyxy[0].tolist(),
                "conf": float(box.conf[0]),
                "class_id": int(box.cls[0]),
                "brand": class_map.get(int(box.cls[0]), "Unknown")
            })

    grouped_implants = []
    for b in raw_boxes:
        matched = False
        for group in grouped_implants:
            if calculate_iou(b["box"], group["main_box"]) > 0.6:
                existing = next((x for x in group["preds"] if x["brand"] == b["brand"]), None)
                if not existing:
                    group["preds"].append({"brand": b["brand"], "conf": b["conf"]})
                elif b["conf"] > existing["conf"]:
                    existing["conf"] = b["conf"]
                matched = True
                break
        if not matched:
            grouped_implants.append({
                "main_box": b["box"], 
                "preds": [{"brand": b["brand"], "conf": b["conf"]}]
            })

    detected_implants = []
    for idx, group in enumerate(grouped_implants):
        sorted_preds = sorted(group["preds"], key=lambda x: x["conf"], reverse=True)
        top_pred = sorted_preds[0] 

        if top_pred["conf"] < ai_conf:
            continue

        top_k = [{"brand": p["brand"], "conf": round(p["conf"], 3)} for p in sorted_preds[:3]]
        x1, y1, x2, y2 = group["main_box"]
        box_w_px = x2 - x1
        box_h_px = y2 - y1
        
        detected_implants.append({
            "id": len(detected_implants) + 1,
            "type": top_pred["brand"],
            "manufacturer": top_pred["brand"],
            "confidence": round(top_pred["conf"], 2),
            "top_predictions": top_k,
            "position": f"Tooth #{len(detected_implants) + 1}",
            "width_px": round(box_w_px, 2),
            "height_px": round(box_h_px, 2),
            "size_mm": "", 
            "boneLevel": "", 
            "osseointegration": "", 
            "notes": "", 
            "box": [(x1/img_width)*100, (y1/img_height)*100, (box_w_px/img_width)*100, (box_h_px/img_height)*100]
        })

    final_result = {
        "status": "success",
        "caseId": case_id, 
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "count": len(detected_implants),
        "implants": detected_implants,
        "ai_model_used": mode,
        "email": email,
        "image_url": f"/uploads/{case_id}.jpg"
    }

    if db is not None:
        try:
            await db.analysis_history.insert_one(final_result.copy())
            print(f"💾 Saved Case {final_result['caseId']} to Database!")
        except Exception as e:
            print(f"❌ Failed to save case: {e}")

        if email:
            try:
                # 🌟 ดึงการตั้งค่าของ User ว่าเปิดแจ้งเตือนแบบไหนบ้าง?
                user_prefs = await db.user_settings.find_one({"email": email}) or {}
                wants_email = user_prefs.get("emailNotif", True)
                wants_web = user_prefs.get("webNotif", True) # 👈 เช็คสวิตช์ Web Notif

                # 1️⃣ แจ้งเตือนลงกระดิ่งเว็บ (ถ้าเปิดสวิตช์ webNotif)
                if wants_web:
                    await db.notifications.insert_one({
                        "email": email,
                        "type": "success",
                        "message": f"Analysis of Case {final_result['caseId']} is complete and ready for review.",
                        "timestamp": datetime.utcnow().isoformat() + "Z",
                        "is_read": False
                    })
                    print(f"🔔 Web Notification created for {email}")
                else:
                    print("🔕 Web Notifications disabled.")

                # 2️⃣ ส่งเข้า Gmail (ถ้าเปิดสวิตช์ emailNotif)
                if wants_email and EMAIL_SENDER and EMAIL_PASSWORD:
                    msg = EmailMessage()
                    msg.set_content(f"Your Dental X-Ray Analysis (Case {final_result['caseId']}) is ready for review.\n\nLogin to MFU Dental AI to see the results.")
                    msg['Subject'] = f"✅ Analysis Complete: Case {final_result['caseId']}"
                    msg['From'] = EMAIL_SENDER
                    msg['To'] = email

                    server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
                    server.login(EMAIL_SENDER, EMAIL_PASSWORD)
                    server.send_message(msg)
                    server.quit()
                    print(f"📧 Notification Email sent to {email}")
                else:
                    print("🔕 User disabled email notifications. Skipped sending email.")

            except Exception as e:
                print(f"❌ Failed to process notifications: {e}")

    return final_result

@app.get("/settings/{email}")
async def get_settings(email: str):
    if db is not None:
        user_settings = await db.user_settings.find_one({"email": email}, {"_id": 0})
        if user_settings:
            return {"status": "success", "data": user_settings}
        return {"status": "not_found", "data": None}
    return {"status": "error", "message": "Database not connected"}

@app.post("/settings/{email}")
async def update_settings(email: str, payload: dict = Body(...)):
    if db is not None:
        try:
            await db.user_settings.update_one(
                {"email": email},
                {"$set": payload},
                upsert=True
            )
            return {"status": "success", "message": "Settings updated"}
        except Exception as e:
            return {"status": "error", "message": str(e)}
    return {"status": "error"}

@app.get("/notifications/{email}")
async def get_notifications(email: str):
    if db is not None:
        cursor = db.notifications.find({"email": email}).sort("timestamp", -1).limit(20)
        notifs = await cursor.to_list(length=20)
        for n in notifs: n["id"] = str(n.pop("_id"))
        return {"status": "success", "data": notifs}
    return {"status": "error"}

@app.post("/notifications/{email}/read")
async def mark_notifications_read(email: str):
    if db is not None:
        await db.notifications.update_many({"email": email, "is_read": False}, {"$set": {"is_read": True}})
        return {"status": "success"}
    return {"status": "error"}

# ==========================================
# 💳 API สำหรับระบบโควต้าและแพ็กเกจ (Billing)
# ==========================================
@app.get("/usage/{email}")
async def get_usage(email: str):
    if db is not None:
        user_prefs = await db.user_settings.find_one({"email": email}) or {}
        plan = user_prefs.get("plan", "Free")
        
        if plan == "Enterprise": limit = 500
        elif plan == "Pro": limit = 100
        else: limit = 20
        
        usage_count = await db.analysis_history.count_documents({"email": email})
        return {"status": "success", "plan": plan, "usage": usage_count, "limit": limit}
    return {"status": "error"}

@app.post("/upgrade/{email}")
async def upgrade_plan(email: str, plan: str = "Pro"): 
    if db is not None:
        await db.user_settings.update_one({"email": email}, {"$set": {"plan": plan}}, upsert=True)
        return {"status": "success"}
    return {"status": "error"}


# ==========================================
# 🔒 API สำหรับ Security & Privacy (Export Data)
# ==========================================
@app.get("/export/{email}")
async def export_user_data(email: str):
    if db is not None:
        # ดึงประวัติการสแกนทั้งหมดของอีเมลนี้ (ซ่อน _id ไว้จะได้ไม่ error ตอนโหลด)
        cursor = db.analysis_history.find({"email": email}, {"_id": 0})
        history = await cursor.to_list(length=1000)
        return {"status": "success", "data": history}
    return {"status": "error", "message": "Database not connected"}


@app.delete("/notifications/{notif_id}")
async def delete_notification(notif_id: str):
    if db is not None:
        try:
            await db.notifications.delete_one({"_id": ObjectId(notif_id)})
            return {"status": "success"}
        except:
            return {"status": "error"}
    return {"status": "error"}


# ==========================================
# 📊 API สำหรับ History & Patient Dashboard
# ==========================================
@app.get("/history/{email}")
async def get_patient_history(email: str):
    if db is not None:
        try:
            # ดึงประวัติทั้งหมดของอีเมลนี้ เรียงจากใหม่ไปเก่า (limit 100 เคสล่าสุด)
            cursor = db.analysis_history.find({"email": email}).sort("timestamp", -1)
            history_list = await cursor.to_list(length=100)
            
            # แปลง _id ของ MongoDB ให้เป็น String
            for h in history_list:
                h["_id"] = str(h["_id"])
                
            return {"status": "success", "data": history_list}
        except Exception as e:
            return {"status": "error", "message": str(e)}
    return {"status": "error", "message": "Database not connected"}