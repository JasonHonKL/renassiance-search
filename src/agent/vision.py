import os
from PIL import Image
from io import BytesIO
import requests
from urllib.parse import urlparse

from .agent import Agent
from ..model import Model

from ..utils import read_config

class Vision(Agent):
    def __init__(self, model, db="./local_files"):
        self.model = model
        config = read_config()
        self.db = config.get("db", db)

    def _load_image(self, source: str):
        """Load image from a file path or URL."""
        if source.startswith("http://") or source.startswith("https://"):
            response = requests.get(source, timeout=5)
            img = Image.open(BytesIO(response.content))
            return img
        elif os.path.isfile(source):
            return Image.open(source)
        else:
            raise ValueError("Invalid image source path or URL.")

    async def run(self, task: str, data: str):
        if not hasattr(self.model, "vision") or not self.model.vision:
            raise ValueError("Model does not support vision tasks.")

        try:
            image = self._load_image(data)
        except Exception as e:
            raise RuntimeError(f"Failed to load image: {e}")

        result = self.model.process_image(task=task, image=image)

        # Save result if it is an image
        output_dir = os.path.join(self.db, "vision_outputs")
        os.makedirs(output_dir, exist_ok=True)

        basename = os.path.basename(urlparse(data).path)
        output_path = os.path.join(output_dir, f"output_{basename}")

        if isinstance(result, Image.Image):
            result.save(output_path)
            return f"Saved output image at: {output_path}"
        else:
            return result
        
    async def get_recv_format(self):
        return {
            "task": "Describe the image",
            "data": "Image file path or URL"
        }

    async def get_send_format(self):
        return {
            "response": "Text describing the image or saved image path"
        }    
