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

console.log('🔐 Starting decryption...\n');
console.log('Using AES Key:', aesKey);
console.log('Using AES IV:', aesIV);
console.log('');

try {
    // Step 1: Decode base64 encrypted data
    const encryptedData = Buffer.from(encryptedPayload.data, 'base64');
    console.log('✓ Base64 decoded encrypted data');

    // Step 2: Create decipher with AES-256-CBC
    // The hex string key is 32 chars = 32 bytes when treated as UTF-8
    const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        Buffer.from(aesKey, 'utf8'),
        Buffer.from(aesIV, 'utf8')
    );

    // Step 3: Decrypt the data
    let decrypted = Buffer.concat([
        decipher.update(encryptedData),
        decipher.final()
    ]);
    console.log('✓ AES decryption complete');
    console.log('Decrypted buffer length:', decrypted.length, 'bytes');

    // Step 4: Decompress with inflateRaw (DEFLATE raw)
    const decompressed = zlib.inflateRawSync(decrypted);
    console.log('✓ Data decompressed');

    // Step 5: Parse JSON
    const jsonString = decompressed.toString('utf8');
    const result = JSON.parse(jsonString);

    console.log('\n✅ SUCCESS! Decrypted payload:\n');
    console.log(JSON.stringify(result, null, 2));

} catch (error) {
    console.error('\n❌ Decryption failed:');
    console.error(error.message);
    console.error('\nStack trace:');
    console.error(error.stack);

    // Try alternative approaches
    console.log('\n🔄 Trying alternative decryption methods...\n');

    // Alternative 1: Try with hex-encoded key/iv
    try {
        console.log('Attempt 1: Using hex-encoded key/iv');
        const encryptedData = Buffer.from(encryptedPayload.data, 'base64');
        const decipher = crypto.createDecipheriv(
            'aes-128-cbc',
            Buffer.from(aesKey, 'hex'),
            Buffer.from(aesIV, 'hex')
        );

        let decrypted = Buffer.concat([
            decipher.update(encryptedData),
            decipher.final()
        ]);

        const decompressed = zlib.inflateRawSync(decrypted);
        const result = JSON.parse(decompressed.toString('utf8'));

        console.log('\n✅ SUCCESS with hex encoding! Decrypted payload:\n');
        console.log(JSON.stringify(result, null, 2));
    } catch (e) {
        console.log('❌ Hex encoding failed:', e.message);
    }

    // Alternative 2: Try without decompression
    try {
        console.log('\nAttempt 2: Without decompression');
        const encryptedData = Buffer.from(encryptedPayload.data, 'base64');
        const decipher = crypto.createDecipheriv(
            'aes-128-cbc',
            Buffer.from(aesKey, 'utf8'),
            Buffer.from(aesIV, 'utf8')
        );

        let decrypted = Buffer.concat([
            decipher.update(encryptedData),
            decipher.final()
        ]);

        const result = JSON.parse(decrypted.toString('utf8'));

        console.log('\n✅ SUCCESS without decompression! Decrypted payload:\n');
        console.log(JSON.stringify(result, null, 2));
    } catch (e) {
        console.log('❌ Without decompression failed:', e.message);
    }
}

// Optional: RSA private key brute force (not feasible for 1024-bit keys)
console.log('\n📝 Note about RSA:');
console.log('The RSA public key found in the codebase is:');
console.log('-----BEGIN PUBLIC KEY-----');
console.log('MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCx2UKNVOg0dYx1R3p7GNAXcrRQ');
console.log('7QkiE43UFbHxLPJ8gpWFxhSb6ZoCGO/8AkAFEgroJ7NKUhRyq71vCjDFJh8n7zjA');
console.log('6rgIxKOPNwndHlXBLBj60avRb14BrunQ5EijwGpUF9jUeLrLO3GNd39T4l1RC0jj');
console.log('TBa0hpKpGNGfQAd7rwIDAQAB');
console.log('-----END PUBLIC KEY-----');
console.log('\nThe RSA private key is NOT in the codebase (it stays on the server).');
console.log('However, you already have the decrypted key/iv from your breakpoint,');
console.log('so you don\'t need the RSA private key to decrypt this payload! 🎉');
