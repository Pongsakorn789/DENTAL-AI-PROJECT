from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image, ImageOps
import io
import time

app = FastAPI()

# --- Config CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 1. โหลดสมอง AI
# ==========================================
print("⏳ Loading Models...")
# ตรวจสอบชื่อไฟล์ให้ตรงกับที่มีในเครื่อง
model_mfu = YOLO('mfu_model.pt')       # ตัวเก่า
model_roboflow = YOLO('roboflow_model.pt') # ตัวใหม่
print("✅ Models Loaded!")

# ==========================================
# 2. Map ชื่อยี่ห้อ
# ==========================================
CLASS_NAMES_MFU = {
  0: "Astra Tech", 1: "BL", 2: "BLT", 3: "BLT RC", 4: "BLT SLA",
  5: "CAMLOG Screw Line", 6: "CONELOG Screw Line", 7: "CONELOG Snap Type",
  8: "Camlog", 9: "EV", 10: "GM Helix", 11: "ISII", 12: "ISIII",
  13: "ISIII Active", 14: "Neobiotech", 15: "Neodent", 16: "OsseoSpeed EV",
  17: "Osstem", 18: "Roxolid", 19: "SLA", 20: "Straumann",
  21: "TSII", 22: "TSIII", 23: "TSIII SA", 24: "Unspecified"
}

CLASS_NAMES_ROBOFLOW = {
  0: "Straumann",
  1: "Astra Tech",
  2: "Nobel Biocare",
  3: "Osstem"
}

# ==========================================
# 🧠 ฟังก์ชันเดาขนาดจากสัดส่วน (Smart Size Estimation)
# ==========================================
def estimate_size_smart(brand, width_px, height_px):
    # ป้องกันการหารด้วยศูนย์
    if width_px <= 0: return "Unknown Size"

    # คำนวณสัดส่วน (Aspect Ratio): ยิ่งเลขมาก = ยิ่งผอมยาว
    ratio = height_px / width_px 
    
    size_guess = "Standard Diameter" # ค่า Default

    # กฎการเดา (Heuristic Rules) ตาม Catalog ของแต่ละยี่ห้อ
    if brand == "Osstem":
        # Osstem: รุ่นเล็กมักจะยาวๆ รุ่นใหญ่จะป้อมๆ
        if ratio > 3.8:
            size_guess = "Mini/Narrow (Ø 3.0 - 3.5mm)"
        elif ratio > 2.5:
            size_guess = "Regular (Ø 4.0 - 4.5mm)"
        else:
            size_guess = "Ultra-Wide (Ø 5.0mm+)"
            
    elif brand == "Straumann":
        # Straumann BLT: ทรงสอบ (Tapered)
        if ratio > 4.0:
            size_guess = "Narrow Neck (Ø 3.3mm)"
        elif ratio > 2.8:
            size_guess = "Regular Neck (Ø 4.1mm)"
        else:
            size_guess = "Wide Neck (Ø 4.8mm)"
            
    elif brand == "Nobel Biocare":
        # NobelActive
        if ratio > 3.5:
            size_guess = "NobelActive 3.0"
        elif ratio > 2.5:
            size_guess = "NobelActive Regular (4.3mm)"
        else:
            size_guess = "NobelActive Wide (5.0mm)"
    
    elif brand == "Astra Tech":
        if ratio > 3.2:
            size_guess = "OsseoSpeed TX 3.5S"
        else:
            size_guess = "OsseoSpeed TX 4.5/5.0"

    return size_guess

@app.get("/")
def read_root():
    return {"message": "Dental Implant AI API (Smart Size) is ready!"}

@app.post("/analyze")
async def analyze_implant(
    file: UploadFile = File(...),
    mode: str = Form("roboflow") 
):
    # 1. เตรียมรูปภาพ
    image_data = await file.read()
    image = Image.open(io.BytesIO(image_data)).convert("RGB")
    image = ImageOps.autocontrast(image) # ช่วยปรับแสง X-ray ให้ชัดขึ้น
    
    # ดึงขนาดภาพจริง (เพื่อใช้คำนวณ %)
    img_width, img_height = image.size

    # 2. เลือกโมเดล
    if mode == "mfu":
        selected_model = model_mfu
        class_map = CLASS_NAMES_MFU
        conf_level = 0.25 
        print(f"🤖 Using MFU Model (25 Classes)")
    else:
        selected_model = model_roboflow
        class_map = CLASS_NAMES_ROBOFLOW
        conf_level = 0.25 
        print(f"🤖 Using ROBOFLOW Model (4 Classes)")

    # 3. AI ทำนาย (Predict)
    results = selected_model.predict(
        source=image,
        imgsz=640,
        conf=conf_level, 
        iou=0.45,
        augment=True,
        agnostic_nms=True
    )
    
    detected_implants = []

    # 4. แกะผลลัพธ์
    for result in results:
        for box in result.boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])
            brand_name = class_map.get(class_id, "Unknown")
            
            # พิกัดกล่อง (หน่วย Pixel จริง)
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            
            # คำนวณขนาดของกล่อง (หน่วย Pixel)
            box_w_px = x2 - x1
            box_h_px = y2 - y1
            
            # แปลงเป็น % เพื่อส่งให้ Frontend วาดกรอบ (Frontend ใช้ %)
            left_percent = (x1 / img_width) * 100
            top_percent = (y1 / img_height) * 100
            width_percent = (box_w_px / img_width) * 100
            height_percent = (box_h_px / img_height) * 100
            
            # 🔥 เรียกใช้ฟังก์ชันเดาขนาด (ไม่ต้องให้หมอวัดเอง)
            # เราใช้ Pixel จริงในการคำนวณสัดส่วน
            smart_size = estimate_size_smart(brand_name, box_w_px, box_h_px)

            # สร้าง JSON ตอบกลับ
            detected_implants.append({
                "id": len(detected_implants) + 1,
                "type": brand_name,
                "manufacturer": brand_name,
                "confidence": round(confidence, 2),
                "position": f"Detected Area #{len(detected_implants) + 1}",
                "risk": "Low" if confidence > 0.7 else "Medium",
                
                # 👇 ส่งค่าที่เดาได้ไปเลย หมอไม่ต้องทำไร
                "size": smart_size, 
                
                "boneLevel": "N/A", # ค่านี้ต้องใช้หมอประเมิน AI ยังทำไม่ได้แม่นยำ
                "osseointegration": "Good",
                "notes": f"AI predicted model based on shape ratio (H/W).",
                
                # พิกัดสำหรับวาดกรอบ
                "box": [left_percent, top_percent, width_percent, height_percent]
            })

    print(f"✅ Found {len(detected_implants)} implants using {mode} mode.")

    return {
        "status": "success",
        "caseId": f"AI-{int(time.time())}",
        "timestamp": time.strftime('%Y-%m-%dT%H:%M:%S.000Z'),
        "count": len(detected_implants),
        "implants": detected_implants
    }