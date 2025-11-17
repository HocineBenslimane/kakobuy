# RSA Payload Decryption Guide

## Summary of Findings

### 🔍 What We Discovered

1. **RSA Public Key** (1024-bit):
   ```
   -----BEGIN PUBLIC KEY-----
   MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCx2UKNVOg0dYx1R3p7GNAXcrRQ
   7QkiE43UFbHxLPJ8gpWFxhSb6ZoCGO/8AkAFEgroJ7NKUhRyq71vCjDFJh8n7zjA
   6rgIxKOPNwndHlXBLBj60avRb14BrunQ5EijwGpUF9jUeLrLO3GNd39T4l1RC0jj
   TBa0hpKpGNGfQAd7rwIDAQAB
   -----END PUBLIC KEY-----
   ```

2. **Encryption Scheme**:
   - AES-256-CBC for data encryption
   - PKCS7 padding
   - DEFLATE compression before encryption
   - RSA-1024 encryption for key/IV protection
   - Random 32-character hex string for AES key (treated as UTF-8 = 256 bits)
   - Random 16-character hex string for IV (treated as UTF-8 = 128 bits)

3. **RSA Factorization**: **FAILED**
   - The RSA key uses strong primes
   - Cannot be factored with basic algorithms
   - Would require specialized tools and significant computational resources

### 📂 Created Scripts

1. **`decrypt-payload.js`** - Basic AES decryption (requires correct key/IV)
2. **`decrypt-payload-v2.js`** - Advanced decryption with multiple methods
3. **`rsa-decrypt-attempt.js`** - RSA private key recovery attempts
4. **`rsa-factor-analysis.js`** - RSA modulus factorization analysis

---

## ❌ Why Your Key/IV Didn't Work

The key and IV you provided (`13ab8178b63b713955ccda2076be48f4` and `c1c4dc0d87f916e5`) don't match the encrypted payload. This happens when:

1. **Different Request**: The key/IV were captured from a different request than the payload
2. **Timing Issue**: The values changed between capture and encryption
3. **Multiple Sessions**: Different encryption sessions use different random keys

---

## ✅ How to Successfully Decrypt

### Option 1: Capture Correct Key/IV (RECOMMENDED)

**Step 1**: Set up your debugger breakpoint correctly

```javascript
// Find this function in app.02e42fd9.txt around line 20076
function v(e, t, a) {
    const r = JSON.stringify(e)
    const i = f["a"].deflateRaw(r, { level: 1 })
    const o = p.a.lib.WordArray.create(i)
    const _ = p.a.AES.encrypt(o, p.a.enc.Utf8.parse(t), {
        iv: p.a.enc.Utf8.parse(a),
        mode: p.a.mode.CBC,
        padding: p.a.pad.Pkcs7
    })
    const n = _.toString()

    // SET BREAKPOINT HERE - before RSA encryption!
    console.log("KEY:", t, "IV:", a);  // Add this line

    const s = k(t)  // RSA encrypts key
    const c = k(a)  // RSA encrypts IV

    return {
        data: n,
        key: s,
        iv: c
    }
}
```

**Step 2**: Capture the values

- Open DevTools → Sources
- Set breakpoint BEFORE `const s = k(t)`
- Make the request that generates your payload
- When execution pauses, inspect variables `t` (key) and `a` (IV)
- These should be 32 and 16 character hex strings respectively

**Step 3**: Copy the encrypted payload

From Network tab, copy the exact `data`, `key`, and `iv` values from the request body

**Step 4**: Use the decryption template

```javascript
const crypto = require('crypto');
const zlib = require('zlib');

// Replace these with your captured values
const capturedKey = 'YOUR_32_CHAR_HEX_STRING';  // Variable 't' from breakpoint
const capturedIV = 'YOUR_16_CHAR_HEX_STRING';   // Variable 'a' from breakpoint

// Replace with your payload's data field
const encryptedData = Buffer.from('YOUR_BASE64_DATA_HERE', 'base64');

const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(capturedKey, 'utf8'),
    Buffer.from(capturedIV, 'utf8')
);

const decrypted = Buffer.concat([
    decipher.update(encryptedData),
    decipher.final()
]);

const decompressed = zlib.inflateRawSync(decrypted);
const result = JSON.parse(decompressed.toString('utf8'));

console.log(JSON.stringify(result, null, 2));
```

---

### Option 2: Find the RSA Private Key

The RSA private key is likely stored on the **server side only**. However, you can check:

1. **Server-side code** (if you have access):
   ```bash
   grep -r "BEGIN PRIVATE KEY" /path/to/server/
   grep -r "BEGIN RSA PRIVATE KEY" /path/to/server/
   ```

2. **Environment variables**:
   ```bash
   env | grep -i key
   env | grep -i rsa
   ```

3. **Common file locations**:
   ```bash
   ~/.ssh/id_rsa
   /etc/ssl/private/
   ./config/keys/
   ./secrets/
   ```

4. **Configuration files**:
   ```bash
   find . -name "*.env" -o -name "*.config" -o -name "*.json" | xargs grep -l "PRIVATE"
   ```

---

### Option 3: Intercept Before Encryption

Use a proxy to intercept the request **before** it gets encrypted:

**Using Burp Suite:**

1. Configure browser to use Burp proxy (127.0.0.1:8080)
2. Install Burp's CA certificate
3. Intercept the request
4. Look for unencrypted data before the encryption function runs

**Using Chrome DevTools:**

1. Open DevTools → Sources → Overrides
2. Enable local overrides
3. Find the encryption function (`v` in `app.02e42fd9.txt`)
4. Add a `debugger;` statement before encryption
5. Inspect the unencrypted payload (`e` parameter)

---

### Option 4: Modify Request Code

The application checks `req_code` to determine if encryption is needed:

```javascript
if (4 === n.req_code) {
    const e = v(i, p, g)  // Encrypt
    Object.assign(n, e)
} else {
    i = JSON.stringify(i)
    n.data = i  // No encryption!
}
```

**Try sending requests with different `req_code` values** (0, 1, 2, 3) to see if the server accepts unencrypted requests for debugging purposes.

---

## 🛠️ Advanced RSA Cracking (For Reference Only)

### Using RsaCtfTool

```bash
# Install
git clone https://github.com/RsaCtfTool/RsaCtfTool.git
cd RsaCtfTool
pip3 install -r requirements.txt

# Save public key to file
cat > pubkey.pem << 'EOF'
-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCx2UKNVOg0dYx1R3p7GNAXcrRQ
7QkiE43UFbHxLPJ8gpWFxhSb6ZoCGO/8AkAFEgroJ7NKUhRyq71vCjDFJh8n7zjA
6rgIxKOPNwndHlXBLBj60avRb14BrunQ5EijwGpUF9jUeLrLO3GNd39T4l1RC0jj
TBa0hpKpGNGfQAd7rwIDAQAB
-----END PUBLIC KEY-----
EOF

# Attempt to recover private key
python3 RsaCtfTool.py --publickey pubkey.pem --private

# If successful, you'll get a private key file
# Then decrypt with:
python3 RsaCtfTool.py --publickey pubkey.pem --private \
    --decrypt "YOUR_ENCRYPTED_KEY_BASE64"
```

### Using CADO-NFS (Industrial-strength factorization)

**Warning**: This requires significant computational resources and time (days to weeks for 1024-bit keys)

```bash
# This is beyond the scope of a quick script
# See: https://gitlab.inria.fr/cado-nfs/cado-nfs
```

---

## 📊 Encryption Flow Diagram

```
User Request
     ↓
Generate Random Key/IV
     ↓
JSON.stringify(data)
     ↓
DEFLATE Compress
     ↓
AES-256-CBC Encrypt (with key/IV)
     ↓
RSA-1024 Encrypt Key
     ↓
RSA-1024 Encrypt IV
     ↓
Send: {data: encrypted, key: rsa_encrypted_key, iv: rsa_encrypted_iv, req_code: 4}
```

---

## 🎯 Recommended Next Steps

1. **Most Realistic**: Capture correct key/IV using debugger (Option 1)
2. **If server access**: Find RSA private key in server files (Option 2)
3. **Quick test**: Try different `req_code` values to bypass encryption (Option 4)
4. **Advanced**: Use RsaCtfTool or similar tools (Option 3)

---

## 📝 Files in This Directory

- `decrypt-payload.js` - Basic decryption script
- `decrypt-payload-v2.js` - Multi-method decryption with diagnostics
- `rsa-decrypt-attempt.js` - RSA private key recovery attempts
- `rsa-factor-analysis.js` - RSA factorization analysis
- `DECRYPTION_GUIDE.md` - This comprehensive guide

---

## 💡 Pro Tips

1. **Use Charles Proxy or Fiddler** to see requests/responses in real-time
2. **Chrome DevTools Network tab** → Right-click request → "Copy as Node.js fetch" to get exact request format
3. **Postman** can be used to replay requests with modified parameters
4. **Look for API versioning** - older versions (v1, v2) might not have encryption
5. **Check for debug/test endpoints** - these often bypass security measures

---

## ⚠️ Legal Notice

This guide is for:
- Educational purposes
- Authorized security testing
- Debugging your own applications
- CTF competitions

**DO NOT** use these techniques for unauthorized access to systems you don't own or have permission to test.

---

## 🤔 Still Stuck?

If none of these methods work, consider:

1. **Contact the API provider** - They might provide decryption tools
2. **Check documentation** - There might be an official SDK
3. **Look for mobile apps** - They might use simpler encryption
4. **Search for similar implementations** - Other developers might have solved this
5. **Join security communities** - r/ReverseEngineering, r/netsec, HackTheBox forums

Good luck! 🚀
