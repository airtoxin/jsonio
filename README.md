## Tests

```
# Create bucket
curl -X PUT \
  -H 'Authorization: Bearer: c2022db3-e747-46c8-8d42-de7836a136f6' \
  http://localhost:3000/api/test_bucket

# Create row
curl -X POST \
  -H 'Authorization:Bearer: c2022db3-e747-46c8-8d42-de7836a136f6' \
  -H 'Content-Type: application/json' \
  -d '{ "test": 10 }' \
  http://localhost:3000/api/test_bucket

# List rows
curl \
  -H 'Authorization:Bearer: c2022db3-e747-46c8-8d42-de7836a136f6' \
  http://localhost:3000/api/test_bucket
```

pscale connect jsonio initial --port 3309
