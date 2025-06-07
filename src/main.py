"""
    This is the main function of the agent
"""
from src.agent import Planner , Search_agent , Reporter, Agent
from src.model import Deepseek , Ollama , Gemini , Model
from src.router import Server , Router 

async def generate_report(query , planner:Planner , agents:list[Agent]):
    planner.query = query
    server = Server()

    planner_router = Router(server , planner)    
    server.add_router(planner.name , planner_router)

    for agent in agents:
        r = Router(server , agent)
        server.add_router(agent.name , r)
        planner.add_model(agent.name , agent.description)
    server.set_initial_router(planner.name , query)

    report = await server.start(query= query)
    report = report['data']

    with open("report.md", "w", encoding="utf-8") as file:
        file.write(report + "\n\n") 
    #
    return report
    
