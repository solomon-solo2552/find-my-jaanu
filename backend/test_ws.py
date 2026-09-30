"""
Run: python test_ws.py
Prereq: python manage.py runserver is running in another terminal
"""
import asyncio
import json
import websockets


async def main():
    # 1. Get a JWT by logging in via HTTP
    import urllib.request
    import urllib.error

    login_url = "http://127.0.0.1:8000/api/auth/login/"
    payload = json.dumps({
        "email": "test@jaanu.dev",
        "password": "SuperSecret123!",
    }).encode()

    req = urllib.request.Request(
        login_url, data=payload,
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req) as resp:
        tokens = json.loads(resp.read())
    access = tokens["access"]
    print(f"Got access token: {access[:30]}…")

    # 2. Get a match_id from /api/matches/
    req = urllib.request.Request(
        "http://127.0.0.1:8000/api/matches/",
        headers={"Authorization": f"Bearer {access}"},
    )
    with urllib.request.urlopen(req) as resp:
        matches = json.loads(resp.read())["results"]
    if not matches:
        print("❌ No matches. Create a mutual like first.")
        return
    match_id = matches[0]["id"]
    print(f"Using match_id: {match_id}")

    # 3. Connect to WebSocket
    ws_url = f"ws://127.0.0.1:8000/ws/chat/{match_id}/?token={access}"
    async with websockets.connect(ws_url) as ws:
        print("✅ Connected!")
        await ws.send(json.dumps({"content": "Hello from Python!"}))
        response = await ws.recv()
        print(f"📩 Echo: {response}")


asyncio.run(main())