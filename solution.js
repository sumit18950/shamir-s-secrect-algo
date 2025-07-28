
const fs = require('fs');


function decodeValue(valueStr, base) {
    const baseBigInt = BigInt(base);
    let result = 0n;
    
    for (let i = 0; i < valueStr.length; i++) {
        const char = valueStr[i];
        let digit;
        if (char >= '0' && char <= '9') {
            digit = parseInt(char, 10);
        } else {
            // Handles bases > 10, where 'a' = 10, 'b' = 11.
            digit = char.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0) + 10;
        }
        result = result * baseBigInt + BigInt(digit);
    }
    return result;
}


function findSecret(filePath) {
 
    const rawData = fs.readFileSync(filePath);
    const jsonData = JSON.parse(rawData);

    const k = jsonData.keys.k;
    const points = [];

    // 2. Decode the first k points from the input data
    let pointsFound = 0;
    for (const key in jsonData) {
        
        if (!isNaN(key) && pointsFound < k) {
            const x = BigInt(key);
            const y = decodeValue(jsonData[key].value, parseInt(jsonData[key].base, 10));
            points.push({ x, y });
            pointsFound++;
        }
    }

    // 3. Apply Lagrange Interpolation to find f(0)
    let secret = 0n;

    for (let j = 0; j < k; j++) {
        const xj = points[j].x;
        const yj = points[j].y;

        let numerator = 1n;
        let denominator = 1n;

        for (let i = 0; i < k; i++) {
            if (i === j) continue; // Skip the point itself

            const xi = points[i].x;
            
            // Calculate the Lagrange basis polynomial L_j(0)
            // L_j(0) = product of ( -xi / (xj - xi) ) for all i != j
            numerator *= -xi;
            denominator *= (xj - xi);
        }
        
        // Add the term for the current point to the total sum
        // The division must be exact for the result to be an integer.
        secret += (yj * numerator) / denominator;
    }

    return secret;
}

// --- Main Execution ---
try {
    const secret1 = findSecret('testcase1.json');
    const secret2 = findSecret('testcase2.json');

    console.log(`Secret for test case 1: ${secret1}`);
    console.log(`Secret for test case 2: ${secret2}`);
} catch (error) {
    console.error("Error processing files. Make sure 'testcase1.json' and 'testcase2.json' exist.", error);
}
