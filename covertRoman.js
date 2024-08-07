function romanToInt(s) {
    const roman = {
        'I': 1,
        'V': 5,
        'X': 10,
        'L': 50,
        'C': 100,
        'D': 500,
        'M': 1000
    };
    let total = 0;
    let prev = 0;

    for (let i = s.length - 1; i >= 0; i--) {
        const current = roman[s[i]];
        if (current >= prev) {
            total += current;
        } else {
            total -= current;
        }
        prev = current;
    }

    return total;
}

function isValidRomanNumeral(romanNumeral) {
    const validRomanNumerals = ['I', 'V', 'X', 'L', 'C', 'D', 'M'];
    // valid Roman numerals are 'I', 'V', 'X', 'L', 'C', 'D', 'M'

    if (romanNumeral.length === 0) {
        return false;
    }
    if (romanNumeral.length === 1) {
        return true;
    }
    const roman = {
        'I': 1,
        'V': 5,
        'X': 10,
        'L': 50,
        'C': 100,
        'D': 500,
        'M': 1000
    };

    for (let i = 0; i < romanNumeral.length - 1; i++) {
        const current = romanNumeral[i];
        const next = romanNumeral[i + 1];
        if (roman[current] < roman[next]) {
            if (i > 0 && roman[current] <= roman[romanNumeral[i - 1]]) {
                return false;
            }
            if (i < romanNumeral.length - 2 && roman[next] <= roman[romanNumeral[i + 2]]) {
                return false;
            }
        }
    }

    for (let i = 0; i < romanNumeral.length; i++) {
        if (!validRomanNumerals.includes(romanNumeral[i])) {
            return false;
        }
    }
    return true;
}



process.stdin.resume();
process.stdin.setEncoding('utf8');

console.log('Enter a Roman numeral:');

process.stdin.on('data', function(input) {
    const romanNumeral = input.trim();  // Xóa khoảng trắng thừa
    if (!isValidRomanNumeral(romanNumeral)) {
        console.log('Invalid Roman numeral. Please enter a valid Roman numeral:');
        return;
    }
    const result = romanToInt(romanNumeral);
    console.log(`Equivalent value: ${result}`);
    process.exit();
});