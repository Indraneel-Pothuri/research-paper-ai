import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    print("ERROR: GROQ_API_KEY is not configured.")
    raise SystemExit(1)

print("Groq API key found.")

client = OpenAI(
    api_key=api_key,
    base_url="https://api.groq.com/openai/v1",
)

response = client.chat.completions.create(
    model="openai/gpt-oss-20b",
    messages=[
        {
            "role": "user",
            "content": "In one sentence, explain what PPO is.",
        }
    ],
    max_tokens=200,
    temperature=0.2,
)

print("\nGroq response:")
print(response.choices[0].message.content)