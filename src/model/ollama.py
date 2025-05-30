from .model import Model
from ollama import chat


class Ollama(Model):
    def __init__(self, model: str):
        self.model = model
        self.message = []

    def completion(self, message: str, stream: str = False):
        self._append_message(message=message, role="user")
        msg_cache = ""
        if stream == False:
            res = chat(model=self.model, messages=self.message, stream=False)
            self._append_message(role="assistant", message=res["message"]["content"])
        else:
            res = chat(model=self.model, messages=self.message, stream=True)
            for chunk in res:
                msg_cache += chunk["message"]["content"]
                print(chunk["message"]["content"], end="", flush=True)
        return res["message"]["content"] if stream == False else msg_cache

    def _append_message(self, role: str, message: str):
        self.message.append({"role": role, "content": message})
