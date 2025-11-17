const crypto = require('crypto');
const zlib = require('zlib');

// Your encrypted payload
const encryptedPayload = {
    "data": "FwR+GR4Mltm3kMrUQnxFuJZFIR/+VzmL/DwDT/f4xnkCcn2obY72ZRi7whDz87RXp3wa8LZdspmkGvuBMwJUzCxxinsMh1k1Jj1u9OztCtURgFVbek44OZ4vNnMCqjfft01qKHbu40tK9C3/5PkWIgjI+IHlQtG18KAR9AkHYiuDPpviKpkQi0nhHxUpYWOtGSmds1lGYUGBhti61M8KneF2RmVmgKcP38vKphNy9bs=",
    "req_code": 4,
    "key": "opEWFMHcxQveDiQAoCMUG/xpyCbc+aGgyZSF543JBPtAkuAXPlM6NWEwPM9cpWPZmp6GSjxKDQFK3Q08A+qCB0cEi2MCPiTV7sLbbKVqMV/zfiDPwloNPuV8oNwszgjZDWt/2HIFWc8SOxJpSuIILtLTI/i78Q7qrzwVoTQXp5s=",
    "iv": "ZfGuSpNIsAGGuZDMyt3+msk1EErBHpcv9DhWQ5LrnTTh+T7WM8ChIJ4Iei4Ebqvzn+KdOeGaOVvP651L9p5utY0FG5y0dr0WBiJah1+p28rPJLxn7xVfI7J+o73/0xPph8amkY4LurKZVOR1jnTfB5Sls5f2VdmCagp6dT9ab3w="
};

// Your actual AES key and IV from breakpoint
const aesKey = '13ab8178b63b713955ccda2076be48f4';
const aesIV = 'c1c4dc0d87f916e5';

console.log('🔐 Decryption Diagnostics\n');
console.log('═'.repeat(60));

// Display key/IV information
console.log('\n📊 Key/IV Information:');
console.log('─'.repeat(60));
console.log('AES Key (string):', aesKey);
console.log('AES Key length:', aesKey.length, 'characters');
console.log('AES IV (string):', aesIV);
console.log('AES IV length:', aesIV.length, 'characters');

const keyBuffer = Buffer.from(aesKey, 'utf8');
const ivBuffer = Buffer.from(aesIV, 'utf8');

console.log('\nAs UTF-8 bytes:');
console.log('Key buffer:', keyBuffer.toString('hex'));
console.log('Key buffer length:', keyBuffer.length, 'bytes');
console.log('IV buffer:', ivBuffer.toString('hex'));
console.log('IV buffer length:', ivBuffer.length, 'bytes');

// Display encrypted data information
const encryptedData = Buffer.from(encryptedPayload.data, 'base64');
console.log('\n📦 Encrypted Data Information:');
console.log('─'.repeat(60));
console.log('Base64 length:', encryptedPayload.data.length, 'characters');
console.log('Decrypted buffer length:', encryptedData.length, 'bytes');
console.log('First 32 bytes (hex):', encryptedData.slice(0, 32).toString('hex'));

console.log('\n═'.repeat(60));
console.log('🔄 Attempting Decryption Methods...\n');

const methods = [
    {
        name: 'Method 1: AES-256-CBC with UTF-8 key/iv',
        cipher: 'aes-256-cbc',
        keyEncoding: 'utf8',
        ivEncoding: 'utf8'
    },
    {
        name: 'Method 2: AES-128-CBC with Hex key/iv',
        cipher: 'aes-128-cbc',
        keyEncoding: 'hex',
        ivEncoding: 'hex'
    },
    {
        name: 'Method 3: AES-192-CBC with UTF-8 key/iv (first 24 bytes)',
        cipher: 'aes-192-cbc',
        keyEncoding: 'utf8',
        ivEncoding: 'utf8',
        keySlice: 24
    },
    {
        name: 'Method 4: AES-256-CBC with Hex key, UTF-8 IV',
        cipher: 'aes-256-cbc',
        keyEncoding: 'hex',
        ivEncoding: 'utf8',
        customKey: aesKey + aesKey // Double the key
    }
];

for (const method of methods) {
    try {
        console.log(`\n⏳ ${method.name}`);
        console.log('─'.repeat(60));

        let keyBuf = method.customKey
            ? Buffer.from(method.customKey, method.keyEncoding)
            : Buffer.from(aesKey, method.keyEncoding);

        if (method.keySlice) {
            keyBuf = keyBuf.slice(0, method.keySlice);
        }

        const ivBuf = Buffer.from(aesIV, method.ivEncoding);

        console.log(`Using ${method.cipher}`);
        console.log(`Key: ${keyBuf.length} bytes, IV: ${ivBuf.length} bytes`);

        const decipher = crypto.createDecipheriv(method.cipher, keyBuf, ivBuf);

        let decrypted = Buffer.concat([
            decipher.update(encryptedData),
            decipher.final()
        ]);

        console.log(`✓ Decrypted: ${decrypted.length} bytes`);
        console.log(`First 32 bytes (hex): ${decrypted.slice(0, 32).toString('hex')}`);

        // Try decompression
        try {
            const decompressed = zlib.inflateRawSync(decrypted);
            console.log(`✓ Decompressed: ${decompressed.length} bytes`);

            const jsonString = decompressed.toString('utf8');
            const result = JSON.parse(jsonString);

            console.log('\n✅ SUCCESS!\n');
            console.log('═'.repeat(60));
            console.log('📄 Decrypted Payload:');
            console.log('═'.repeat(60));
            console.log(JSON.stringify(result, null, 2));
            console.log('═'.repeat(60));

            process.exit(0);
        } catch (decompressError) {
            console.log(`✗ Decompression failed: ${decompressError.message}`);

            // Try without decompression
            try {
                const result = JSON.parse(decrypted.toString('utf8'));
                console.log('\n✅ SUCCESS (no compression)!\n');
                console.log('═'.repeat(60));
                console.log('📄 Decrypted Payload:');
                console.log('═'.repeat(60));
                console.log(JSON.stringify(result, null, 2));
                console.log('═'.repeat(60));
                process.exit(0);
            } catch (jsonError) {
                console.log(`✗ JSON parsing failed: ${jsonError.message}`);
                console.log(`Raw decrypted (first 200 chars): ${decrypted.toString('utf8', 0, 200)}`);
            }
        }

    } catch (error) {
        console.log(`❌ Failed: ${error.message}`);
    }
}

console.log('\n═'.repeat(60));
console.log('❌ All decryption methods failed');
console.log('═'.repeat(60));
console.log('\n💡 Troubleshooting Tips:');
console.log('1. Verify the key/IV were captured from THIS specific request');
console.log('2. Check if the key/IV format in the breakpoint is hex or UTF-8');
console.log('3. Ensure the encrypted payload matches the captured key/IV');
console.log('4. Try capturing the values again with a fresh request');
console.log('\n📝 To test RSA decryption (requires private key):');
console.log('   The encrypted key/iv in the payload need the RSA private key');
console.log('   which is stored on the server side, not in the client code.');
