import requests

url = "http://localhost:8000/crawl"
payload = {"url": "https://www.geeksforgeeks.org/basics-computer-networking"}
headers = {"Content-Type": "application/json"}

response = requests.post(url, json=payload, headers=headers)
print(response.status_code, response.json())