"""
     Factory
"""
from ..agent import Planner , Search_agent , Reporter

from ..model import Gemini , Ollama , Deepseek, Model

class Factory():
    def get_agent(agent_name:str , model:Model):
        if agent_name == "planner":
            return Planner(model)
        elif agent_name == "reporter":
            return Reporter(model)
        elif agent_name == "seracher":
            return Search_agent(model)
    
    def get_model(provider:str , model:str) -> Model:
        if provider == "deepseek":
            return Deepseek(model)
        if provider == "google" or provider == "gemini":
            return Gemini(model)
        if provider == "ollama" or provider =="ollama":
            return Ollama(model)
        
        return None 