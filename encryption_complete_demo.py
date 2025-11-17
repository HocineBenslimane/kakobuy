#!/usr/bin/env python3
"""
Complete Encryption/Decryption Demonstration
Replicates the exact encryption mechanism used in kakobuy

This script demonstrates the COMPLETE flow:
1. Generate RSA key pair (for demo purposes)
2. Generate random AES key and IV
3. Compress and encrypt data
4. Encrypt key/IV with RSA
5. Decrypt and verify

Requires: pycryptodome
Install: pip install pycryptodome
"""

import base64
import json
import zlib
import secrets

try:
    from Crypto.PublicKey import RSA
    from Crypto.Cipher import AES, PKCS1_v1_5
    from Crypto.Util.Padding import pad, unpad
    from Crypto.Random import get_random_bytes
    CRYPTO_AVAILABLE = True
except ImportError:
    CRYPTO_AVAILABLE = False
    print("⚠️  Warning: pycryptodome not installed")
    print("Install with: pip install pycryptodome")
    print("\nContinuing with demonstration without actual encryption...\n")

# Known plaintext data
test_data = {
    "versionCode": "226",
    "from": "1201",
    "fp": "test-fingerprint-12345",
    "referer": "",
    "uuid": "test-uuid-67890",
    "cur": "USD",
    "token": "test-token-abcdef",
    "username": "djawedbns@gmail.com",
    "password": "test22"
}

def generate_rsa_keypair(bits=1024):
    """Generate RSA key pair (for demonstration)"""
    if not CRYPTO_AVAILABLE:
        return None, None

    print(f"Generating {bits}-bit RSA key pair...")
    key = RSA.generate(bits)
    private_key = key
    public_key = key.publickey()

    print(f"✓ RSA key pair generated")
    print(f"  Public key (n): {public_key.n}")
    print(f"  Public exponent: {public_key.e}")

    return private_key, public_key

def generate_aes_key_iv():
    """
    Generate random AES key and IV
    Replicates: p.a.lib.WordArray.random(16).toString(p.a.enc.Hex)
    """
    # Generate 16 random bytes for key, convert to hex (32 chars)
    key_bytes = secrets.token_bytes(16)
    key_hex = key_bytes.hex()

    # Generate 8 random bytes for IV, convert to hex (16 chars)
    iv_bytes = secrets.token_bytes(8)
    iv_hex = iv_bytes.hex()

    print("\n" + "="*70)
    print("STEP 1: Generate Random AES Key and IV")
    print("="*70)
    print(f"AES Key (hex): {key_hex}")
    print(f"AES IV (hex): {iv_hex}")
    print(f"Key length: {len(key_hex)} hex chars ({len(key_bytes)} bytes)")
    print(f"IV length: {len(iv_hex)} hex chars ({len(iv_bytes)} bytes)")

    return key_hex, iv_hex

def compress_data(data_dict):
    """
    Compress data using deflate
    Replicates: f["a"].deflateRaw(r, {level: 1})
    """
    print("\n" + "="*70)
    print("STEP 2: Stringify and Compress Data")
    print("="*70)

    # Convert to JSON string
    json_str = json.dumps(data_dict)
    json_bytes = json_str.encode('utf-8')

    print(f"Original JSON: {json_str}")
    print(f"Original size: {len(json_bytes)} bytes")

    # Compress with deflate (level 1)
    compressed = zlib.compress(json_bytes, level=1)
    # Remove zlib header and checksum (deflateRaw equivalent)
    compressed_raw = compressed[2:-4]

    print(f"Compressed size: {len(compressed_raw)} bytes")
    print(f"Compression ratio: {len(compressed_raw)/len(json_bytes):.2%}")

    return compressed_raw

def encrypt_with_aes(data, key_hex, iv_hex):
    """
    Encrypt data with AES-CBC
    Replicates: p.a.AES.encrypt(o, p.a.enc.Utf8.parse(t), {...})
    """
    if not CRYPTO_AVAILABLE:
        return b"[DEMO_ENCRYPTED_DATA]"

    print("\n" + "="*70)
    print("STEP 3: Encrypt with AES-CBC")
    print("="*70)

    # Convert hex key/iv to bytes
    # NOTE: CryptoJS's enc.Utf8.parse() treats the hex string as UTF-8
    # So we need to encode the hex string as UTF-8 bytes, not convert from hex
    key_bytes = key_hex.encode('utf-8')[:16]  # Take first 16 bytes
    iv_bytes = iv_hex.encode('utf-8')[:16]  # Take first 16 bytes (pads to 16)

    print(f"Key (hex string as bytes): {key_bytes.hex()}")
    print(f"IV (hex string as bytes): {iv_bytes.hex()}")
    print(f"Key length: {len(key_bytes)} bytes")
    print(f"IV length: {len(iv_bytes)} bytes")

    # Create cipher with CBC mode and PKCS7 padding
    cipher = AES.new(key_bytes, AES.MODE_CBC, iv_bytes)

    # Pad and encrypt
    padded_data = pad(data, AES.block_size)
    encrypted = cipher.encrypt(padded_data)

    print(f"Padded size: {len(padded_data)} bytes")
    print(f"Encrypted size: {len(encrypted)} bytes")
    print(f"Encrypted (hex): {encrypted[:32].hex()}...")

    # Convert to Base64 (like toString() in CryptoJS)
    encrypted_b64 = base64.b64encode(encrypted).decode('ascii')
    print(f"Encrypted (base64): {encrypted_b64[:60]}...")

    return encrypted_b64

def encrypt_with_rsa(data_str, public_key):
    """
    Encrypt data with RSA
    Replicates: h.encrypt(e)
    """
    if not CRYPTO_AVAILABLE or public_key is None:
        return "[DEMO_RSA_ENCRYPTED]"

    cipher = PKCS1_v1_5.new(public_key)
    encrypted = cipher.encrypt(data_str.encode('utf-8'))
    encrypted_b64 = base64.b64encode(encrypted).decode('ascii')

    return encrypted_b64

def decrypt_with_rsa(encrypted_b64, private_key):
    """
    Decrypt RSA encrypted data
    """
    if not CRYPTO_AVAILABLE or private_key is None:
        return None

    encrypted = base64.b64decode(encrypted_b64)
    cipher = PKCS1_v1_5.new(private_key)

    # PKCS1_v1_5 requires a sentinel for security
    sentinel = b"DECRYPTION_FAILED"
    decrypted = cipher.decrypt(encrypted, sentinel)

    if decrypted == sentinel:
        return None

    return decrypted.decode('utf-8')

def decrypt_with_aes(encrypted_b64, key_hex, iv_hex):
    """
    Decrypt AES encrypted data
    Replicates: p.a.AES.decrypt(e, p.a.enc.Utf8.parse(t), {...})
    """
    if not CRYPTO_AVAILABLE:
        return None

    print("\n" + "="*70)
    print("STEP 4: Decrypt with AES-CBC")
    print("="*70)

    # Decode Base64
    encrypted = base64.b64decode(encrypted_b64)

    # Convert hex key/iv to bytes
    # NOTE: Same as encryption - treat hex string as UTF-8 bytes
    key_bytes = key_hex.encode('utf-8')[:16]
    iv_bytes = iv_hex.encode('utf-8')[:16]

    print(f"Key (hex string as bytes): {key_bytes.hex()}")
    print(f"IV (hex string as bytes): {iv_bytes.hex()}")

    # Create cipher and decrypt
    cipher = AES.new(key_bytes, AES.MODE_CBC, iv_bytes)
    decrypted_padded = cipher.decrypt(encrypted)

    # Remove PKCS7 padding
    decrypted = unpad(decrypted_padded, AES.block_size)

    print(f"Decrypted size: {len(decrypted)} bytes")
    print(f"Decrypted (hex): {decrypted[:32].hex()}...")

    return decrypted

def decompress_data(compressed_data):
    """
    Decompress data
    Replicates: f["a"].inflateRaw(_, {to: "string"})
    """
    print("\n" + "="*70)
    print("STEP 5: Decompress Data")
    print("="*70)

    # Add zlib header for decompression
    decompressed = zlib.decompress(compressed_data, -zlib.MAX_WBITS)

    print(f"Decompressed size: {len(decompressed)} bytes")

    # Parse JSON
    json_str = decompressed.decode('utf-8')
    data_dict = json.loads(json_str)

    print(f"Decompressed JSON: {json_str}")

    return data_dict

def demonstrate_complete_flow():
    """Demonstrate the complete encryption/decryption flow"""
    print("="*70)
    print("COMPLETE ENCRYPTION/DECRYPTION DEMONSTRATION")
    print("="*70)
    print("\nThis demonstrates the EXACT encryption mechanism used in kakobuy")
    print("="*70)

    # Generate RSA key pair for demonstration
    private_key, public_key = generate_rsa_keypair(1024)

    # ENCRYPTION PROCESS
    print("\n")
    print("╔" + "="*68 + "╗")
    print("║" + " "*20 + "ENCRYPTION PROCESS" + " "*30 + "║")
    print("╚" + "="*68 + "╝")

    # Step 1: Generate random key and IV
    key_hex, iv_hex = generate_aes_key_iv()

    # Step 2: Compress data
    compressed = compress_data(test_data)

    # Step 3: Encrypt with AES
    encrypted_data = encrypt_with_aes(compressed, key_hex, iv_hex)

    # Step 4: Encrypt key and IV with RSA
    print("\n" + "="*70)
    print("STEP 4: Encrypt Key and IV with RSA")
    print("="*70)
    encrypted_key = encrypt_with_rsa(key_hex, public_key)
    encrypted_iv = encrypt_with_rsa(iv_hex, public_key)

    if CRYPTO_AVAILABLE:
        print(f"RSA Encrypted Key: {encrypted_key[:60]}...")
        print(f"RSA Encrypted IV: {encrypted_iv[:60]}...")
    else:
        print("RSA encryption skipped (pycryptodome not installed)")

    # Step 5: Prepare request
    print("\n" + "="*70)
    print("STEP 5: Prepare Request Payload")
    print("="*70)

    request_payload = {
        "req_code": 4,
        "data": encrypted_data,
        "key": encrypted_key,
        "iv": encrypted_iv
    }

    print("Request payload:")
    print(json.dumps({
        "req_code": request_payload["req_code"],
        "data": request_payload["data"][:60] + "...",
        "key": str(request_payload["key"])[:60] + "...",
        "iv": str(request_payload["iv"])[:60] + "..."
    }, indent=2))

    if not CRYPTO_AVAILABLE:
        print("\n⚠️  Skipping decryption (pycryptodome not installed)")
        return

    # DECRYPTION PROCESS
    print("\n")
    print("╔" + "="*68 + "╗")
    print("║" + " "*20 + "DECRYPTION PROCESS" + " "*30 + "║")
    print("╚" + "="*68 + "╝")

    # Step 1: Decrypt key and IV with RSA
    print("\n" + "="*70)
    print("STEP 1: Decrypt Key and IV with RSA Private Key")
    print("="*70)

    decrypted_key = decrypt_with_rsa(encrypted_key, private_key)
    decrypted_iv = decrypt_with_rsa(encrypted_iv, private_key)

    print(f"Decrypted Key: {decrypted_key}")
    print(f"Decrypted IV: {decrypted_iv}")

    # Verify keys match
    if decrypted_key == key_hex and decrypted_iv == iv_hex:
        print("✓ Keys match original!")
    else:
        print("✗ Keys don't match!")

    # Step 2-5: Decrypt data
    decrypted_compressed = decrypt_with_aes(encrypted_data, decrypted_key, decrypted_iv)
    final_data = decompress_data(decrypted_compressed)

    # Verify data
    print("\n" + "="*70)
    print("VERIFICATION")
    print("="*70)
    print("\nOriginal data:")
    print(json.dumps(test_data, indent=2))
    print("\nDecrypted data:")
    print(json.dumps(final_data, indent=2))

    if final_data == test_data:
        print("\n✅ SUCCESS! Decrypted data matches original data!")
    else:
        print("\n✗ FAILURE! Data doesn't match!")

def analyze_real_encrypted_data():
    """Analyze the real encrypted data provided by user"""
    print("\n\n")
    print("="*70)
    print("ANALYSIS OF YOUR ENCRYPTED DATA")
    print("="*70)

    encrypted_key_b64 = "J64NHDV3wSUFNsMT5e5NDRXywjrjuFQlDu/VeAxcUD3qb+dhyEsO547NVi1vwDe+mqk4xbD+kNc688eZgpYSFFVSAsPeF715zDz78dnGrR1H3UQVOByp/QvHi/v8bt/GpmUjddsbn2pFCazmIiu+GSwLC9oLe1/b6ouyW7+0ri0="
    encrypted_iv_b64 = "TXw+QgMPW7KijFbNKcupDFmeKUdU7A44e8OahUALW80gy00NIO4EjHQ4Ev3TUcIpekPqybMiwAtTYOepmJldGWvTtZiicy/jpOSNLQRYwsY7XLxoga7m2NFhmQIpF7iCveWnNZ/JhESd88spgk/jlvHPNWT9lAi2Gil2bVBhsqk="
    encrypted_data_b64 = "MaGaV3lLUkfYHGcYlfKZTLQEfncRp9FDL70Ai4VIlwzdOFFGyVZ8/owvd6qaTjzV7i++Dpli1/UcNv226smD+GFgqEsJ2VN588FQkgGcYm7F0aJMA2TWjKD2AkpOx8RAn0BnZ5uM8zhLOXvq3bE+j8STXlwrMMlk4k1DQCNp0HnKTKqXVFPF2WdVAhKWxQjuT/lEeeSW+J4LZjfGhuO2CxwDRlJTpLkzzJJeuu/JdhggJcOkBMttz7aK7XAE+wbu"

    print("\nYour encrypted data contains:")
    print(f"- Username: djawedbns@gmail.com")
    print(f"- Password: test22")
    print(f"- Plus metadata (versionCode, fp, uuid, token, etc.)")

    print("\nEncryption details:")
    print(f"- RSA Encrypted Key: {len(encrypted_key_b64)} chars → {len(base64.b64decode(encrypted_key_b64))} bytes")
    print(f"- RSA Encrypted IV: {len(encrypted_iv_b64)} chars → {len(base64.b64decode(encrypted_iv_b64))} bytes")
    print(f"- AES Encrypted Data: {len(encrypted_data_b64)} chars → {len(base64.b64decode(encrypted_data_b64))} bytes")

    print("\nTo decrypt your specific data, you would need:")
    print("1. The RSA private key (stored on kakobuy server)")
    print("2. Or: Break the 1024-bit RSA encryption (expensive)")
    print("3. Or: Server-side access")

    print("\nThe demonstration above shows EXACTLY how the encryption works,")
    print("but uses a test RSA key pair. Your actual data uses kakobuy's")
    print("private key which only they possess.")

def main():
    demonstrate_complete_flow()
    analyze_real_encrypted_data()

    print("\n" + "="*70)
    print("SUMMARY")
    print("="*70)
    print("\nThis demonstration replicates the EXACT encryption mechanism:")
    print("1. ✓ Generate random 128-bit AES key (16 bytes → 32 hex chars)")
    print("2. ✓ Generate random 64-bit IV (8 bytes → 16 hex chars)")
    print("3. ✓ Compress data with deflate (level 1)")
    print("4. ✓ Encrypt with AES-CBC-PKCS7")
    print("5. ✓ Encrypt key/IV with RSA-1024")
    print("6. ✓ Encode everything in Base64")
    print("\nThe decryption process is the exact reverse.")
    print("="*70)

if __name__ == "__main__":
    main()
