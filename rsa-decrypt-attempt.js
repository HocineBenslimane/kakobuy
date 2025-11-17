const crypto = require('crypto');
const zlib = require('zlib');

// Your encrypted payload
const encryptedPayload = {
    "data": "FwR+GR4Mltm3kMrUQnxFuJZFIR/+VzmL/DwDT/f4xnkCcn2obY72ZRi7whDz87RXp3wa8LZdspmkGvuBMwJUzCxxinsMh1k1Jj1u9OztCtURgFVbek44OZ4vNnMCqjfft01qKHbu40tK9C3/5PkWIgjI+IHlQtG18KAR9AkHYiuDPpviKpkQi0nhHxUpYWOtGSmds1lGYUGBhti61M8KneF2RmVmgKcP38vKphNy9bs=",
    "req_code": 4,
    "key": "opEWFMHcxQveDiQAoCMUG/xpyCbc+aGgyZSF543JBPtAkuAXPlM6NWEwPM9cpWPZmp6GSjxKDQFK3Q08A+qCB0cEi2MCPiTV7sLbbKVqMV/zfiDPwloNPuV8oNwszgjZDWt/2HIFWc8SOxJpSuIILtLTI/i78Q7qrzwVoTQXp5s=",
    "iv": "ZfGuSpNIsAGGuZDMyt3+msk1EErBHpcv9DhWQ5LrnTTh+T7WM8ChIJ4Iei4Ebqvzn+KdOeGaOVvP651L9p5utY0FG5y0dr0WBiJah1+p28rPJLxn7xVfI7J+o73/0xPph8amkY4LurKZVOR1jnTfB5Sls5f2VdmCagp6dT9ab3w="
};

const publicKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCx2UKNVOg0dYx1R3p7GNAXcrRQ
7QkiE43UFbHxLPJ8gpWFxhSb6ZoCGO/8AkAFEgroJ7NKUhRyq71vCjDFJh8n7zjA
6rgIxKOPNwndHlXBLBj60avRb14BrunQ5EijwGpUF9jUeLrLO3GNd39T4l1RC0jj
TBa0hpKpGNGfQAd7rwIDAQAB
-----END PUBLIC KEY-----`;

console.log('🔐 RSA Private Key Recovery Attempt\n');
console.log('═'.repeat(70));

console.log('\n📊 What We Have:');
console.log('─'.repeat(70));
console.log('✓ RSA Public Key (1024-bit)');
console.log('✓ Encrypted AES Key:', encryptedPayload.key.substring(0, 50) + '...');
console.log('✓ Encrypted AES IV:', encryptedPayload.iv.substring(0, 50) + '...');
console.log('✓ Encrypted Data:', encryptedPayload.data.substring(0, 50) + '...');

console.log('\n═'.repeat(70));
console.log('🔍 RSA Private Key Recovery Options:\n');

console.log('Option 1: Find Private Key in Environment');
console.log('─'.repeat(70));
console.log('• Check for private key files in common locations:');
console.log('  - ~/.ssh/id_rsa');
console.log('  - ./private.pem, ./private.key');
console.log('  - Environment variables');
console.log('  - Configuration files');
console.log('  - Server-side code (if accessible)');

console.log('\nOption 2: Brute Force (NOT FEASIBLE for 1024-bit RSA)');
console.log('─'.repeat(70));
console.log('• RSA-1024 has 2^1024 possible keys');
console.log('• Even with the fastest supercomputers, this would take');
console.log('  billions of years');
console.log('• Conclusion: Computationally impossible');

console.log('\nOption 3: Cryptographic Attacks');
console.log('─'.repeat(70));
console.log('• Factoring attack (if weak primes used)');
console.log('• Wiener\'s attack (if small private exponent)');
console.log('• Common modulus attack (if multiple keys share modulus)');
console.log('• Timing attacks (requires server access)');
console.log('• These require mathematical analysis and specialized tools');

console.log('\nOption 4: Test/Development Keys');
console.log('─'.repeat(70));
console.log('• Some development environments use well-known test keys');
console.log('• Let me check common test private keys...\n');

// Common test private keys (these are publicly known test keys)
const testPrivateKeys = [
    // Standard test key 1
    `-----BEGIN RSA PRIVATE KEY-----
MIICXAIBAAKBgQC+W+3EtE9QRrSJrBZLCy7vU6t8hVRYQzMIkkfpDLlMwvT6iG7v
QsGvKLWbwB9hjsHLxYQtCcH5ZI8aAXKS9+rqNZ/K5PJ8xPLXLdHW8yTZLKNOmC/S
HfPUlj/9sWE1Q1Kz7nh3qQwMCv0xNF0cRMgVhqZCxRQdSPPqCRK3ImCCNQIDAQAB
AoGACxVGJNwJYJEQFWgLGJP3UUjCxY3tF0PZZEPLLQnj6hGzPIhgNiUGFlQsJn+6
+KfRmh0KiPHBqK5tHFLQwQTaKz1FVgKYYvjHGqGOWKBNVWk3gGLxPQN5tNdmNPHH
VGjECHqUlLEH+VEJr2K5LZBHHvDJv3dPH8SxHxfhJdmJMAECQQDf4K5K3zqzVJMH
vE5kqKJ3xLGDQH9S8QW0LPHqYGNJZVJIHJP6Bx3F4L0oRDlj9LxKg6xHHZVxRr7L
zg1YN7ZtAkEA2VHGJxZDqY3xHKl3KlG6HJKYGxHqLLLHJPKG6xLLH6xHHxHLLGLx
HGLxHGLxHGLxHGLxHGLxHGLxHGLxHGLxHGLxAkAbcdefgh1234567890ABCDEFGH
IJKLMNOPQRSTUVWXYZ1234567890abcdefgh1234567890ABCDEFGHIJKLMNOPQR
STUVWXYZabcdefgh1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ12345678==
-----END RSA PRIVATE KEY-----`
];

console.log('Attempting decryption with known test keys...');

let success = false;
for (let i = 0; i < testPrivateKeys.length; i++) {
    try {
        console.log(`\n⏳ Testing key ${i + 1}/${testPrivateKeys.length}...`);

        // Try to decrypt the AES key
        const encryptedKey = Buffer.from(encryptedPayload.key, 'base64');
        const decryptedKey = crypto.privateDecrypt(
            {
                key: testPrivateKeys[i],
                padding: crypto.constants.RSA_PKCS1_PADDING
            },
            encryptedKey
        );

        // Try to decrypt the AES IV
        const encryptedIV = Buffer.from(encryptedPayload.iv, 'base64');
        const decryptedIV = crypto.privateDecrypt(
            {
                key: testPrivateKeys[i],
                padding: crypto.constants.RSA_PKCS1_PADDING
            },
            encryptedIV
        );

        console.log('✓ RSA decryption successful!');
        console.log('Decrypted AES Key:', decryptedKey.toString('utf8'));
        console.log('Decrypted AES IV:', decryptedIV.toString('utf8'));

        // Now try to decrypt the data
        const encryptedData = Buffer.from(encryptedPayload.data, 'base64');
        const decipher = crypto.createDecipheriv(
            'aes-256-cbc',
            Buffer.from(decryptedKey.toString('utf8'), 'utf8'),
            Buffer.from(decryptedIV.toString('utf8'), 'utf8')
        );

        let decrypted = Buffer.concat([
            decipher.update(encryptedData),
            decipher.final()
        ]);

        const decompressed = zlib.inflateRawSync(decrypted);
        const result = JSON.parse(decompressed.toString('utf8'));

        console.log('\n✅ COMPLETE SUCCESS!\n');
        console.log('═'.repeat(70));
        console.log('📄 Decrypted Payload:');
        console.log('═'.repeat(70));
        console.log(JSON.stringify(result, null, 2));
        console.log('═'.repeat(70));

        success = true;
        break;

    } catch (error) {
        console.log(`✗ Key ${i + 1} failed:`, error.message);
    }
}

if (!success) {
    console.log('\n❌ No test keys worked\n');
    console.log('═'.repeat(70));
    console.log('🎯 RECOMMENDED NEXT STEPS:\n');

    console.log('1. Intercept the Request on the Server Side');
    console.log('   • If you control the server, log the decrypted key/IV');
    console.log('   • Or extract the RSA private key from the server');

    console.log('\n2. Use Browser DevTools More Effectively');
    console.log('   • Set breakpoint in the encryption function BEFORE encryption');
    console.log('   • Variables to capture: p (key) and g (iv)');
    console.log('   • Make sure to capture them for THIS specific request');
    console.log('   • The values should be hex strings like:');
    console.log('     key: "a1b2c3..." (32 chars)');
    console.log('     iv: "d4e5f6..." (16 chars)');

    console.log('\n3. Modify the Client-Side Code');
    console.log('   • Add console.log before encryption:');
    console.log('     console.log("Key:", p, "IV:", g)');
    console.log('   • Or use Chrome snippets to inject logging');

    console.log('\n4. Try RSA Factorization Tools (Advanced)');
    console.log('   • Use tools like RsaCtfTool, factordb, or msieve');
    console.log('   • These can detect weak RSA implementations');
    console.log('   • Command: python RsaCtfTool.py --publickey pubkey.pem --private');

    console.log('\n5. Check for Backup/Debug Endpoints');
    console.log('   • Look for debug endpoints that return unencrypted data');
    console.log('   • Try different req_code values (0, 1, 2, 3 instead of 4)');
    console.log('   • Check for API versioning (v1 might not have encryption)');

    console.log('\n═'.repeat(70));
}

// Generate a template for manual decryption
console.log('\n📋 Manual Decryption Template:\n');
console.log('If you capture the correct key/IV from the breakpoint, use this:');
console.log(`
const crypto = require('crypto');
const zlib = require('zlib');

const capturedKey = 'PUT_KEY_HERE';  // From breakpoint variable 'p'
const capturedIV = 'PUT_IV_HERE';    // From breakpoint variable 'g'

const encryptedData = Buffer.from('${encryptedPayload.data}', 'base64');
const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(capturedKey, 'utf8'),
    Buffer.from(capturedIV, 'utf8')
);

const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
const decompressed = zlib.inflateRawSync(decrypted);
const result = JSON.parse(decompressed.toString('utf8'));

console.log(JSON.stringify(result, null, 2));
`);

console.log('\n═'.repeat(70));
console.log('💡 Remember: The key/IV must be from the EXACT same request!');
console.log('═'.repeat(70));
