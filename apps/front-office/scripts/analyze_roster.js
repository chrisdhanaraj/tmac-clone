#!/usr/bin/env node
/**
 * Script to analyze the roster.csv file and understand data patterns
 * for cleaning and transformation to match TennisProfile schema.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = [];
    
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
            const values = parseCSVLine(lines[i]);
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            rows.push(row);
        }
    }
    
    return { headers, rows };
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current.trim());
    return result;
}

function analyzeCSVFile(csvPath) {
    console.log("=== ROSTER CSV ANALYSIS ===\n");
    
    const csvText = fs.readFileSync(csvPath, 'utf-8');
    const { headers, rows } = parseCSV(csvText);
    
    console.log(`Total rows: ${rows.length}`);
    console.log(`Total columns: ${headers.length}`);
    console.log(`Column names: ${headers.join(', ')}\n`);
    
    // Analyze key fields
    const fieldsToAnalyze = {
        'First Name': 'firstName',
        'Last Name': 'lastName', 
        'Email': 'email',
        'Phone Number': 'phone',
        'District': 'district',
        'Swag': 'tmacGearPreference',
        'Size': 'gearSize',
        'Which most closely describes your gender?': 'gender',
        'What is your Tennis Ranking?': 'tennisRanking',
        'Favorite Player': 'favoriteTennisPlayer',
        'Instagram': 'instagramHandle',
        'TMAC Playlist': 'playlistSong',
        'Why Join': 'whyJoinTmac',
        'Referral': 'referredBy',
        'Birth Date': 'birthDate',
        'Ethnicity': 'ethnicity'
    };
    
    for (const [csvField, schemaField] of Object.entries(fieldsToAnalyze)) {
        if (headers.includes(csvField)) {
            analyzeField(rows, csvField, schemaField);
        } else {
            console.log(`WARNING: Field '${csvField}' not found in CSV`);
        }
    }
    
    return rows;
}

function analyzeField(rows, fieldName, schemaField) {
    console.log(`\n--- ${fieldName} → ${schemaField} ---`);
    
    // Get all values for this field
    const values = rows.map(row => (row[fieldName] || '').trim()).filter(v => v);
    const emptyCount = rows.length - values.length;
    
    console.log(`Total entries: ${rows.length}`);
    console.log(`Non-empty: ${values.length}`);
    console.log(`Empty: ${emptyCount}`);
    
    if (values.length > 0) {
        // Value frequency analysis
        const valueCounts = {};
        values.forEach(value => {
            valueCounts[value] = (valueCounts[value] || 0) + 1;
        });
        
        const uniqueValues = Object.keys(valueCounts).length;
        console.log(`Unique values: ${uniqueValues}`);
        
        // Show top 10 most common values
        console.log("Top values:");
        const sortedValues = Object.entries(valueCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);
            
        sortedValues.forEach(([value, count]) => {
            const displayValue = value.length > 50 ? value.substring(0, 50) + "..." : value;
            console.log(`  '${displayValue}': ${count}`);
        });
        
        // Field-specific analysis
        switch (fieldName) {
            case 'Phone Number':
                analyzePhoneNumbers(values);
                break;
            case 'District':
                analyzeDistricts(values);
                break;
            case 'Which most closely describes your gender?':
                analyzeGender(values);
                break;
            case 'What is your Tennis Ranking?':
                analyzeTennisRanking(values);
                break;
            case 'Instagram':
                analyzeInstagram(values);
                break;
            case 'Birth Date':
                analyzeBirthDates(values);
                break;
        }
    }
}

function analyzePhoneNumbers(values) {
    console.log("Phone number patterns:");
    const patterns = {
        '(XXX) XXX-XXXX': [],
        'XXX-XXX-XXXX': [],
        'XXXXXXXXXX': [],
        'International': [],
        'Other': []
    };
    
    values.forEach(value => {
        if (/^\(\d{3}\) \d{3}-\d{3,4}$/.test(value)) {
            patterns['(XXX) XXX-XXXX'].push(value);
        } else if (/^\d{3}-\d{3}-\d{4}$/.test(value)) {
            patterns['XXX-XXX-XXXX'].push(value);
        } else if (/^\d{10}$/.test(value)) {
            patterns['XXXXXXXXXX'].push(value);
        } else if (/^\+\d+/.test(value)) {
            patterns['International'].push(value);
        } else {
            patterns['Other'].push(value);
        }
    });
    
    Object.entries(patterns).forEach(([pattern, examples]) => {
        if (examples.length > 0) {
            console.log(`  ${pattern}: ${examples.length} (e.g., '${examples[0]}')`);
        }
    });
}

function analyzeDistricts(values) {
    console.log("District patterns:");
    const districtPattern = /District (\d+)/;
    
    const validDistricts = [];
    const invalidDistricts = [];
    
    values.forEach(value => {
        const match = value.match(districtPattern);
        if (match) {
            const districtNum = parseInt(match[1]);
            validDistricts.push(districtNum);
        } else {
            invalidDistricts.push(value);
        }
    });
    
    if (validDistricts.length > 0) {
        const uniqueDistricts = [...new Set(validDistricts)].sort();
        console.log(`  Valid districts (1-11): ${uniqueDistricts.join(', ')}`);
    }
    if (invalidDistricts.length > 0) {
        const uniqueInvalid = [...new Set(invalidDistricts)];
        console.log(`  Invalid formats: ${uniqueInvalid.join(', ')}`);
    }
}

function analyzeGender(values) {
    console.log("Gender mappings needed:");
    const genderCounts = {};
    values.forEach(value => {
        genderCounts[value] = (genderCounts[value] || 0) + 1;
    });
    
    Object.entries(genderCounts).forEach(([gender, count]) => {
        console.log(`  '${gender}': ${count}`);
    });
}

function analyzeTennisRanking(values) {
    console.log("Tennis ranking patterns:");
    const numericRankings = [];
    const nonNumeric = [];
    
    values.forEach(value => {
        const num = parseFloat(value);
        if (!isNaN(num)) {
            numericRankings.push(num);
        } else {
            nonNumeric.push(value);
        }
    });
    
    if (numericRankings.length > 0) {
        const uniqueRankings = [...new Set(numericRankings)].sort();
        console.log(`  Numeric rankings: ${uniqueRankings.join(', ')}`);
    }
    
    if (nonNumeric.length > 0) {
        console.log(`  Non-numeric rankings: ${nonNumeric.join(', ')}`);
    }
}

function analyzeInstagram(values) {
    console.log("Instagram handle patterns:");
    
    const withAt = values.filter(v => v.startsWith('@'));
    const withoutAt = values.filter(v => !v.startsWith('@') && !v.startsWith('http'));
    const urls = values.filter(v => v.startsWith('http'));
    const other = values.filter(v => !withAt.includes(v) && !withoutAt.includes(v) && !urls.includes(v));
    
    console.log(`  With @: ${withAt.length}`);
    console.log(`  Without @: ${withoutAt.length}`);
    console.log(`  URLs: ${urls.length}`);
    console.log(`  Other: ${other.length}`);
}

function analyzeBirthDates(values) {
    console.log("Birth date patterns:");
    const datePatterns = {
        'M/D/YYYY': [],
        'YYYY-MM-DD': [],
        'Other': []
    };
    
    values.forEach(value => {
        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
            datePatterns['M/D/YYYY'].push(value);
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            datePatterns['YYYY-MM-DD'].push(value);
        } else {
            datePatterns['Other'].push(value);
        }
    });
    
    Object.entries(datePatterns).forEach(([pattern, examples]) => {
        if (examples.length > 0) {
            console.log(`  ${pattern}: ${examples.length} (e.g., '${examples[0]}')`);
        }
    });
}

// Run the analysis
const csvPath = path.join(__dirname, '../data/roster.csv');
analyzeCSVFile(csvPath);