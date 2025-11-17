#!/usr/bin/env python3
"""
Encryption Analysis Script
Analyzes the hybrid RSA+AES encryption mechanism used in kakobuy
"""

import base64
import json

# Encrypted values from the request
encrypted_key = "J64NHDV3wSUFNsMT5e5NDRXywjrjuFQlDu/VeAxcUD3qb+dhyEsO547NVi1vwDe+mqk4xbD+kNc688eZgpYSFFVSAsPeF715zDz78dnGrR1H3UQVOByp/QvHi/v8bt/GpmUjddsbn2pFCazmIiu+GSwLC9oLe1/b6ouyW7+0ri0="
encrypted_iv = "TXw+QgMPW7KijFbNKcupDFmeKUdU7A44e8OahUALW80gy00NIO4EjHQ4Ev3TUcIpekPqybMiwAtTYOepmJldGWvTtZiicy/jpOSNLQRYwsY7XLxoga7m2NFhmQIpF7iCveWnNZ/JhESd88spgk/jlvHPNWT9lAi2Gil2bVBhsqk="
encrypted_data = "MaGaV3lLUkfYHGcYlfKZTLQEfncRp9FDL70Ai4VIlwzdOFFGyVZ8/owvd6qaTjzV7i++Dpli1/UcNv226smD+GFgqEsJ2VN588FQkgGcYm7F0aJMA2TWjKD2AkpOx8RAn0BnZ5uM8zhLOXvq3bE+j8STXlwrMMlk4k1DQCNp0HnKTKqXVFPF2WdVAhKWxQjuT/lEeeSW+J4LZjfGhuO2CxwDRlJTpLkzzJJeuu/JdhggJcOkBMttz7aK7XAE+wbu"

# Known plaintext data
known_username = "djawedbns@gmail.com"
known_password = "test22"

# RSA Public Key from the code
rsa_public_key = """-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCx2UKNVOg0dYx1R3p7GNAXcrRQ
7QkiE43UFbHxLPJ8gpWFxhSb6ZoCGO/8AkAFEgroJ7NKUhRyq71vCjDFJh8n7zjA
6rgIxKOPNwndHlXBLBj60avRb14BrunQ5EijwGpUF9jUeLrLO3GNd39T4l1RC0jj
TBa0hpKpGNGfQAd7rwIDAQAB
-----END PUBLIC KEY-----"""

def analyze_base64_structure(label, b64_string):
    """Decode and analyze Base64 encoded data"""
    print(f"\n{'='*70}")
    print(f"{label}")
    print(f"{'='*70}")
    print(f"Base64 Length: {len(b64_string)}")

    try:
        decoded = base64.b64decode(b64_string)
        print(f"Decoded Bytes Length: {len(decoded)}")
        print(f"Decoded Bytes (hex): {decoded.hex()}")
        print(f"Decoded Bytes (first 32): {decoded[:32].hex()}")
        return decoded
    except Exception as e:
        print(f"Error decoding: {e}")
        return None

def analyze_rsa_encryption():
    """Analyze RSA encrypted key and IV"""
    print("\n" + "="*70)
    print("RSA ENCRYPTION ANALYSIS")
    print("="*70)
    print("\nThe key and IV are encrypted with 1024-bit RSA public key")
    print("RSA encryption output size: 128 bytes (1024 bits)")
    print("\nTo decrypt, we would need the RSA private key, which is:")
    print("- Stored securely on the server")
    print("- Never exposed in client-side code")
    print("- Required to recover the AES key and IV")

def analyze_aes_encryption(encrypted_data_bytes):
    """Analyze AES encrypted data structure"""
    print("\n" + "="*70)
    print("AES ENCRYPTION ANALYSIS")
    print("="*70)
    print("\nBased on the encryption mechanism found:")
    print("1. Data is JSON stringified")
    print("2. Compressed with Pako deflateRaw (level: 1)")
    print("3. Encrypted with AES-CBC mode")
    print("4. PKCS7 padding applied")
    print("5. Converted to Base64")

    if encrypted_data_bytes:
        # AES block size is 16 bytes
        print(f"\nEncrypted data length: {len(encrypted_data_bytes)} bytes")
        print(f"Number of AES blocks: {len(encrypted_data_bytes) // 16}")
        print(f"Padding bytes: {len(encrypted_data_bytes) % 16}")

def analyze_key_characteristics():
    """Analyze the expected key characteristics"""
    print("\n" + "="*70)
    print("EXPECTED KEY/IV CHARACTERISTICS")
    print("="*70)
    print("\nBased on code analysis (app.02e42fd9.txt:20066-20067):")
    print("- AES Key: 16 bytes random → 32 hex characters")
    print("- IV: 8 bytes random → 16 hex characters")
    print("\nExample generation (from code):")
    print("  let e = p.a.lib.WordArray.random(16).toString(p.a.enc.Hex)")
    print("  let t = p.a.lib.WordArray.random(8).toString(p.a.enc.Hex)")

def estimate_plaintext_structure():
    """Estimate the plaintext data structure"""
    print("\n" + "="*70)
    print("PLAINTEXT DATA STRUCTURE ESTIMATION")
    print("="*70)

    # Based on the code, the data object contains metadata + user data
    estimated_plaintext = {
        "versionCode": "226",
        "from": "1201",
        "fp": "<fingerprint>",
        "referer": "",
        "uuid": "<uuid>",
        "cur": "USD",
        "token": "<token>",
        "username": known_username,
        "password": known_password
    }

    json_str = json.dumps(estimated_plaintext, indent=2)
    print("\nEstimated plaintext structure:")
    print(json_str)
    print(f"\nEstimated JSON length: {len(json.dumps(estimated_plaintext))} bytes")
    print(f"After compression (estimated): ~{len(json.dumps(estimated_plaintext)) // 2}-{len(json.dumps(estimated_plaintext))} bytes")

def security_analysis():
    """Provide security analysis of the encryption"""
    print("\n" + "="*70)
    print("SECURITY ANALYSIS")
    print("="*70)

    print("\nSTRENGTHS:")
    print("✓ Hybrid encryption (RSA + AES)")
    print("✓ Random key/IV generation per request")
    print("✓ Data compression before encryption")
    print("✓ CBC mode (better than ECB)")

    print("\nWEAKNESSES:")
    print("✗ 1024-bit RSA (DEPRECATED - should be ≥2048-bit)")
    print("✗ 64-bit IV (TOO SMALL - should be 128-bit)")
    print("✗ Hardcoded public key in client code")
    print("✗ All encryption logic visible in JavaScript")

    print("\nATTACK VECTORS (without private key):")
    print("1. Cannot decrypt key/IV without RSA private key")
    print("2. Cannot perform brute force on 128-bit AES key")
    print("3. Could potentially exploit weak IV size")
    print("4. Could analyze traffic patterns over time")

    print("\nDECRYPTION REQUIREMENTS:")
    print("To decrypt this specific data, you would need:")
    print("1. RSA private key (to decrypt key and IV)")
    print("2. Or: Brute force 1024-bit RSA (computationally expensive)")
    print("3. Or: Server-side access to decrypt and retrieve plaintext")

def main():
    print("="*70)
    print("KAKOBUY ENCRYPTION MECHANISM ANALYSIS")
    print("="*70)
    print(f"\nAnalyzing encrypted request data...")
    print(f"Known plaintext: username='{known_username}', password='{known_password}'")

    # Decode all Base64 values
    key_bytes = analyze_base64_structure("RSA ENCRYPTED AES KEY", encrypted_key)
    iv_bytes = analyze_base64_structure("RSA ENCRYPTED IV", encrypted_iv)
    data_bytes = analyze_base64_structure("AES ENCRYPTED DATA", encrypted_data)

    # Analyze RSA encryption
    analyze_rsa_encryption()

    # Analyze AES encryption
    analyze_aes_encryption(data_bytes)

    # Analyze key characteristics
    analyze_key_characteristics()

    # Estimate plaintext structure
    estimate_plaintext_structure()

    # Security analysis
    security_analysis()

    print("\n" + "="*70)
    print("CONCLUSION")
    print("="*70)
    print("\nThe encryption mechanism is a standard hybrid approach:")
    print("1. Random AES key/IV generated for each request")
    print("2. AES key/IV encrypted with RSA public key")
    print("3. Data compressed and encrypted with AES-CBC")
    print("\nWithout the RSA private key, the data cannot be decrypted.")
    print("The server holds the private key and can:")
    print("- Decrypt the RSA-encrypted key and IV")
    print("- Use them to decrypt the AES-encrypted data")
    print("- Decompress and parse the JSON")
    print("\nThis is a legitimate security measure for protecting data in transit.")
    print("="*70)

if __name__ == "__main__":
    main()
