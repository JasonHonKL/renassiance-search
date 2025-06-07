from src import Planner
from src.agent.search import Search_agent
from src.model.deepseek import Deepseek
from src.agent.reporter import Reporter

from src.router import Server, Router


from src.main import generate_report

from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI

STEP = 10


async def main(query):
    print("init")
    planner = Planner(Deepseek("deepseek-chat"),query)
    agents = [Search_agent(Deepseek("deepseek-chat")) , Reporter(Deepseek("deepseek-chat"))]
    print("finish set up ")
    r  = await generate_report(query , planner , agents)
    return r


app = FastAPI()

origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/report/{query}")
async def report(query):
    r = await main(query)
    return {"report":r}


