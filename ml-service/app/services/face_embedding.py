import base64
import binascii
import numpy as np
import httpx


class NoFaceFoundError(Exception):
    pass


def _import_cv2():
    try:
        import cv2
        return cv2
    except ImportError:
        raise RuntimeError("cv2 not installed")


def _import_deepface():
    try:
        from deepface import DeepFace
        return DeepFace
    except ImportError:
        # 🔥 Treat as "no face" scenario
        raise NoFaceFoundError("No face detected")
    
def load_image_from_base64(image_base64: str):
    if not image_base64:
        raise ValueError("Empty base64")

    if image_base64.startswith("data:image"):
        image_base64 = image_base64.split(",", 1)[1]

    try:
        image_bytes = base64.b64decode(image_base64)
    except (binascii.Error, ValueError):
        raise ValueError("Invalid base64")

    cv2 = _import_cv2()

    arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("Invalid image")

    return img


async def load_image_from_url(url: str):
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            res = await client.get(url)
    except Exception:
        raise ValueError("Download failed")

    if res.status_code != 200:
        raise ValueError("Download failed")

    cv2 = _import_cv2()

    arr = np.frombuffer(res.content, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("Invalid image")

    return img


def extract_faces_and_embeddings(image):
    from app.schemas import FaceEmbedding, BoundingBox

    DeepFace = _import_deepface()

    try:
        results = DeepFace.represent(img_path=image)

        # Handle empty / None response
        if not results:
            raise NoFaceFoundError("No face detected")

    except Exception:
        # 🔥 Treat ALL failures as "no face"
        raise NoFaceFoundError("No face detected")

    faces = []

    for r in results:
        emb = r.get("embedding")
        area = r.get("facial_area")

        # Validate embedding
        if not isinstance(emb, list) or len(emb) != 512:
            raise RuntimeError("Embedding must be 512")

        if not all(isinstance(v, (int, float)) for v in emb):
            raise RuntimeError("Invalid embedding values")

        # Validate bbox
        if not area:
            raise RuntimeError("Missing facial area")

        bbox = BoundingBox(
            x=int(area["x"]),
            y=int(area["y"]),
            width=int(area["w"]),
            height=int(area["h"]),
        )

        faces.append(
            FaceEmbedding(
                embedding=[float(v) for v in emb],
                bbox=bbox
            )
        )

    return faces