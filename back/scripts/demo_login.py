import requests, json, time
base='http://127.0.0.1:8000/api/auth/'
users=[
  ('admin1@example.com','adminpass123'),
  ('member1@example.com','memberpass123'),
  ('kid1@example.com','kidpass123'),
  ('solo@example.com','solopass123'),
]
for i in range(10):
    try:
        requests.get('http://127.0.0.1:8000/')
        break
    except Exception:
        time.sleep(0.5)

for email,pwd in users:
    r=requests.post(base+'login/', json={'email':email,'password':pwd})
    print('\nLOGIN for', email)
    try:
        print(r.status_code)
        print(json.dumps(r.json(), indent=2))
    except Exception as e:
        print('Error decoding response', e, r.text)
