const crypto = require('crypto');
const { exec } = require('child_process');
const https = require('https');

const publicKeyPEM = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCx2UKNVOg0dYx1R3p7GNAXcrRQ
7QkiE43UFbHxLPJ8gpWFxhSb6ZoCGO/8AkAFEgroJ7NKUhRyq71vCjDFJh8n7zjA
6rgIxKOPNwndHlXBLBj60avRb14BrunQ5EijwGpUF9jUeLrLO3GNd39T4l1RC0jj
TBa0hpKpGNGfQAd7rwIDAQAB
-----END PUBLIC KEY-----`;

console.log('🔬 RSA Public Key Analysis\n');
console.log('═'.repeat(70));

// Extract the modulus and exponent from the public key
const publicKey = crypto.createPublicKey(publicKeyPEM);
const publicKeyDetails = publicKey.export({ format: 'jwk' });

console.log('\n📊 Key Parameters:');
console.log('─'.repeat(70));

// Convert base64url to hex
const base64urlToHex = (base64url) => {
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const buffer = Buffer.from(base64, 'base64');
    return buffer.toString('hex');
};

const modulusHex = base64urlToHex(publicKeyDetails.n);
const exponentHex = base64urlToHex(publicKeyDetails.e);

console.log('Modulus (n) [hex]:');
console.log(modulusHex);
console.log('\nModulus (n) [decimal]:');
const modulusDecimal = BigInt('0x' + modulusHex).toString(10);
console.log(modulusDecimal);

console.log('\nExponent (e) [hex]:', exponentHex);
console.log('Exponent (e) [decimal]:', BigInt('0x' + exponentHex).toString(10));

console.log('\nKey Size:', modulusHex.length * 4, 'bits');

console.log('\n═'.repeat(70));
console.log('🔍 Factorization Attempts:\n');

// Simple trial division for small factors
function trialDivision(n, limit = 100000) {
    console.log(`⏳ Attempting trial division (up to ${limit})...`);
    const start = Date.now();

    for (let i = 2n; i < BigInt(limit); i++) {
        if (n % i === 0n) {
            const elapsed = Date.now() - start;
            console.log(`✓ FACTOR FOUND in ${elapsed}ms!`);
            console.log(`  p = ${i}`);
            console.log(`  q = ${n / i}`);
            return { p: i, q: n / i };
        }

        if (i % 10000n === 0n) {
            process.stdout.write(`\r  Tested up to: ${i}...`);
        }
    }

    const elapsed = Date.now() - start;
    console.log(`\n✗ No small factors found (tested up to ${limit}) [${elapsed}ms]`);
    return null;
}

// Fermat's factorization method (works well for close primes)
function fermatFactor(n, maxIterations = 100000) {
    console.log('\n⏳ Attempting Fermat\'s factorization...');
    const start = Date.now();

    let a = BigInt(Math.ceil(Math.sqrt(Number(n))));
    const maxA = a + BigInt(maxIterations);

    while (a < maxA) {
        const b2 = a * a - n;
        const b = sqrt(b2);

        if (b !== null && b * b === b2) {
            const elapsed = Date.now() - start;
            const p = a - b;
            const q = a + b;
            console.log(`✓ FACTORS FOUND in ${elapsed}ms!`);
            console.log(`  p = ${p}`);
            console.log(`  q = ${q}`);
            return { p, q };
        }

        a++;

        if (a % 10000n === 0n) {
            process.stdout.write(`\r  Iterations: ${a - BigInt(Math.ceil(Math.sqrt(Number(n))))}...`);
        }
    }

    const elapsed = Date.now() - start;
    console.log(`\n✗ Fermat's method failed after ${maxIterations} iterations [${elapsed}ms]`);
    return null;
}

// Integer square root
function sqrt(n) {
    if (n < 0n) return null;
    if (n === 0n) return 0n;

    let x = n;
    let y = (x + 1n) / 2n;

    while (y < x) {
        x = y;
        y = (x + n / x) / 2n;
    }

    return x;
}

// Check FactorDB online database
function checkFactorDB(modulus) {
    return new Promise((resolve) => {
        console.log('\n⏳ Checking FactorDB online database...');

        const url = `http://factordb.com/api?query=${modulus}`;

        // Use http module for http URLs
        const http = require('http');

        http.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const result = JSON.parse(data);

                    if (result.status === 'FF' || result.status === 'CF') {
                        console.log('✓ Found in FactorDB!');
                        console.log('  Status:', result.status);
                        console.log('  Factors:', result.factors);

                        // Parse factors
                        if (result.factors && result.factors.length > 0) {
                            console.log('\n✅ FACTORIZATION SUCCESS!');
                            result.factors.forEach((factor, i) => {
                                console.log(`  Factor ${i + 1}: ${factor[0]}`);
                            });
                        }
                    } else {
                        console.log('✗ Not found in FactorDB or not factored yet');
                        console.log('  Status:', result.status);
                    }

                    resolve(result);
                } catch (error) {
                    console.log('✗ Failed to parse FactorDB response:', error.message);
                    resolve(null);
                }
            });
        }).on('error', (error) => {
            console.log('✗ FactorDB request failed:', error.message);
            resolve(null);
        });
    });
}

// Main analysis
(async () => {
    const n = BigInt(modulusDecimal);

    // Try trial division
    const trialResult = trialDivision(n, 100000);

    if (trialResult) {
        console.log('\n✅ KEY IS WEAK! Generating private key...');
        generatePrivateKey(trialResult.p, trialResult.q, BigInt('0x' + exponentHex));
        return;
    }

    // Try Fermat's factorization
    const fermatResult = fermatFactor(n, 100000);

    if (fermatResult) {
        console.log('\n✅ KEY IS WEAK! Generating private key...');
        generatePrivateKey(fermatResult.p, fermatResult.q, BigInt('0x' + exponentHex));
        return;
    }

    // Check FactorDB
    const factorDBResult = await checkFactorDB(modulusDecimal);

    if (factorDBResult && (factorDBResult.status === 'FF' || factorDBResult.status === 'CF')) {
        if (factorDBResult.factors && factorDBResult.factors.length === 2) {
            const p = BigInt(factorDBResult.factors[0][0]);
            const q = BigInt(factorDBResult.factors[1][0]);

            console.log('\n✅ KEY IS WEAK! Generating private key...');
            generatePrivateKey(p, q, BigInt('0x' + exponentHex));
            return;
        }
    }

    console.log('\n═'.repeat(70));
    console.log('❌ Unable to factor this RSA modulus\n');

    console.log('This RSA key appears to use strong primes.');
    console.log('To factor it, you would need:');
    console.log('  • Specialized factorization tools (GNFS, CADO-NFS, msieve)');
    console.log('  • Significant computational resources');
    console.log('  • Days/weeks/months of computation time');
    console.log('');
    console.log('💡 Alternative approaches:');
    console.log('  1. Capture key/IV from debugger for the exact request');
    console.log('  2. Find the private key on the server/in config files');
    console.log('  3. Look for other vulnerabilities in the application');
    console.log('  4. Use Burp Suite/mitmproxy to intercept before encryption');
    console.log('═'.repeat(70));
})();

function generatePrivateKey(p, q, e) {
    console.log('\n🔑 Generating RSA private key from factors...\n');

    try {
        // Calculate private key components
        const n = p * q;
        const phi = (p - 1n) * (q - 1n);
        const d = modInverse(e, phi);

        if (d === null) {
            console.log('❌ Failed to calculate private exponent (e and phi not coprime)');
            return;
        }

        console.log('Private key components:');
        console.log('  p =', p.toString(10));
        console.log('  q =', q.toString(10));
        console.log('  n =', n.toString(10));
        console.log('  e =', e.toString(10));
        console.log('  d =', d.toString(10));

        console.log('\n✅ Private key calculated successfully!');
        console.log('Now you can decrypt the payload by using these factors to create a private key PEM.');

    } catch (error) {
        console.log('❌ Error generating private key:', error.message);
    }
}

// Extended Euclidean algorithm for modular inverse
function modInverse(a, m) {
    const m0 = m;
    let x0 = 0n, x1 = 1n;

    if (m === 1n) return null;

    while (a > 1n) {
        const q = a / m;
        let t = m;

        m = a % m;
        a = t;
        t = x0;

        x0 = x1 - q * x0;
        x1 = t;
    }

    if (x1 < 0n) x1 += m0;

    return x1;
}
