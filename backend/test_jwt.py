#!/usr/bin/env python3
"""Test JWT token creation and verification"""

from app.core.security import create_access_token, decode_token
from app.config import settings

# Print settings
print(f"JWT_SECRET: {settings.jwt_secret}")
print(f"JWT_ALGORITHM: {settings.jwt_algorithm}")
print()

# Create token
data = {"sub": 1, "email": "admin@example.com"}
token = create_access_token(data)
print(f"Created token: {token}")
print()

# Decode token
try:
    from jose import jwt
    decoded_direct = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    print(f"Direct decode (jose): {decoded_direct}")
except Exception as e:
    print(f"Direct decode error: {e}")

decoded = decode_token(token)
print(f"Decoded via decode_token(): {decoded}")
print()

if decoded:
    print("✅ JWT working correctly!")
else:
    print("❌ JWT decode failed!")
