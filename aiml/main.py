from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import urllib.request
import os
import uuid
import tempfile
from validator import SkinProjectValidator
import uvicorn

app = FastAPI(title="Skin AI Validator")

# Initialize Validator 
# Make sure your keras file is in the models folder
validator = SkinProjectValidator(model_path="models/best_gatekeeper_v2.keras")

class ImageUrlPayload(BaseModel):
    image_url: str

@app.post("/validate_skin_url")
async def validate_skin_url(payload: ImageUrlPayload):
    # Save the upload temporarily with a unique name in the system temp folder
    temp_dir = tempfile.gettempdir()
    temp_path = os.path.join(temp_dir, f"temp_{uuid.uuid4().hex}.jpg")
    
    try:
        # Download image into RAM / Temp file
        urllib.request.urlretrieve(payload.image_url, temp_path)
        
        # Run validation
        result = validator.validate(temp_path)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    finally:
        # Cleanup
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
