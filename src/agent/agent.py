from abc import ABC, abstractmethod
import re
import json

from pydantic import BaseModel

"""
    This is an abstract class for Agent
    Here we will list out method that an Agent should have 
"""


class Agent(ABC):

    def __init__(self, model):
        self.model = model
        self.name:str
        self.description:str

    """
        An agent should have a run method such that it can run it's workflow 
        NOTE: choosing right tool for the right job should also place in the run method
    """

    @abstractmethod
    async def run(self, response, data=None):
        pass

    @abstractmethod
    def get_recv_format(self) -> BaseModel:
        pass

    @abstractmethod
    def get_send_format(self) -> BaseModel:
        pass

    def _extract_response(self, res: str):
        """
        Extract JSON from a string that may contain markdown code blocks or plain JSON.
        Handles both objects {} and arrays [].
        """
        # First, try to extract from markdown code blocks
        markdown_pattern = r"```(?:json\s*)?\n?(.*?)\n?```"
        markdown_matches = re.findall(markdown_pattern, res, re.DOTALL)

        for match in markdown_matches:
            match = match.strip()
            if match.startswith(("{", "[")):
                try:
                    json.loads(match)
                    return match
                except json.JSONDecodeError:
                    continue

        # If no markdown blocks found, look for plain JSON in the string
        # Find potential JSON objects and arrays
        json_candidates = []
        # Find objects starting with { and arrays starting with [
        for start_char, end_char in [("{", "}"), ("[", "]")]:
            start_idx = 0
            while True:
                start_pos = res.find(start_char, start_idx)
                if start_pos == -1:
                    break
                # Find the matching closing bracket/brace
                bracket_count = 0
                end_pos = start_pos
                for i in range(start_pos, len(res)):
                    char = res[i]
                    if char == start_char:
                        bracket_count += 1
                    elif char == end_char:
                        bracket_count -= 1
                        if bracket_count == 0:
                            end_pos = i
                            break
                if bracket_count == 0:
                    candidate = res[start_pos : end_pos + 1].strip()
                    json_candidates.append(candidate)
                start_idx = start_pos + 1
        for candidate in reversed(json_candidates):
            try:
                json.loads(candidate)
                return candidate
            except json.JSONDecodeError:
                continue
        return None
