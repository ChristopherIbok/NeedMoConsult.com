import httpx
import os
import asyncio
from dotenv import load_dotenv

load_dotenv()

async def join():
    account_id = os.getenv("CLOUDFLARE_ACCOUNT_ID")
    app_id = os.getenv("CLOUDFLARE_APP_ID")
    api_token = os.getenv("CLOUDFLARE_API_TOKEN")
    meeting_id = "bbb753b7-56cc-495b-9b29-a803eaab3474"

    print("Account:", account_id)
    print("App:", app_id)
    print("Token:", api_token)

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"https://api.cloudflare.com/client/v4/accounts/{account_id}/realtime/kit/{app_id}/meetings/{meeting_id}/participants",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_token}",
            },
            json={
                "customParticipantId": os.urandom(8).hex(),
                "name": "test",
                "presetName": "default"
            },
            timeout=15.0,
        )
        print(response.status_code)
        print(response.text)

asyncio.run(join())
