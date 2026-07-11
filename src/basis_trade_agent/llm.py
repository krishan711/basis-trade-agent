import json
import logging
import time

import requests

log = logging.getLogger(__name__)

GEMINI_ENDPOINT_TEMPLATE = "https://generativelanguage.googleapis.com/v1beta/models/{modelId}:generateContent"


class GeminiLLM:
    def __init__(self, apiKey: str, modelId: str) -> None:
        self.apiKey = apiKey
        self.endpoint = GEMINI_ENDPOINT_TEMPLATE.format(modelId=modelId)

    def get_next_step(self, systemPrompt: str, prompt: str) -> dict:
        requestBody = {
            "system_instruction": {"parts": [{"text": systemPrompt}]},
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {},
        }
        maxRetries = 5
        retryDelaySeconds = 0.75
        response = None
        for attemptNumber in range(1, maxRetries + 1):
            try:
                response = requests.post(f"{self.endpoint}?key={self.apiKey}", json=requestBody, timeout=90)
                response.raise_for_status()
                break
            except requests.RequestException as exception:
                if attemptNumber >= maxRetries:
                    raise RuntimeError(f"Gemini API failed after {maxRetries} attempts") from exception
                log.warning(f"Gemini API request failed (attempt {attemptNumber}/{maxRetries}), retrying: {exception}")
                time.sleep(retryDelaySeconds * attemptNumber)
        responseJson = response.json()
        rawText = responseJson["candidates"][0]["content"]["parts"][0]["text"].strip()
        # Strip only a leading/trailing markdown fence, not the first "```" anywhere in the text -
        # a JSON string value (e.g. a "message" quoting YAML back to the user) can itself contain
        # nested triple-backtick fences, and a naive first-occurrence replace corrupts those instead
        # of the real outer fence.
        jsonText = rawText.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        try:
            return json.loads(jsonText)
        except json.JSONDecodeError as exception:
            raise ValueError(f"Could not parse JSON from Gemini response: {jsonText}") from exception
