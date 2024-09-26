# Using OpenAI LLMs 
# set up connecttion 
from langchain_openai import AzureChatOpenAI

import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()
openai_api_key = "30d9470f48874382834b4f69bf974b10"
openai_deployment_name = "hackathon24"
openai_url_endpoint = "https://hackathon24-team3-openai.openai.azure.com/"
# Get the API key and base URL from the environment variables
model_name="gpt-4o"
api_version = "2024-02-15-preview"

# Initialize the OpenAI client with the API key and base URL
llm = AzureChatOpenAI(temperature=0.0, max_tokens=4096, 
                model_name=model_name,
                openai_api_key=openai_api_key, 
                api_version=api_version,
                deployment_name=openai_deployment_name,
                azure_endpoint=openai_url_endpoint)