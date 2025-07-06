#!/usr/bin/env node
/**
 * Script to clean and transform roster.csv data to match TennisProfile schema format
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Schema enums for validation
const SCHEMA_ENUMS = {
    Gender: ['Woman', 'Man', 'NonBinary', 'Agender', 'PreferNotToState', 'Other'],
    AgeRange: ['EIGHTEEN_TO_TWENTY_FIVE', 'TWENTY_SIX_TO_THIRTY_FIVE', 'THIRTY_SIX_TO_FORTY_FIVE', 'FORTY_SIX_TO_FIFTY_FIVE', 'FIFTY_FIVE_PLUS', 'PreferNotToState'],
    Ethnicity: ['AmericanIndianOrAlaskaNative', 'PacificIslander', 'BlackOrAfricanAmerican', 'White', 'Arab', 'Asian', 'HispanicOrLatinx', 'MixedRace', 'Other'],
    District: ['District1', 'District2', 'District3', 'District4', 'District5', 'District6', 'District7', 'District8', 'District9', 'District10', 'District11', 'Other'],
    TmacGearPreference: ['Hat', 'Socks', 'Shirt', 'Other'],
    GearSize: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    TennisRanking: ['ONE_ZERO', 'ONE_FIVE', 'TWO_ZERO', 'TWO_FIVE', 'THREE_ZERO', 'THREE_FIVE', 'FOUR_ZERO', 'FOUR_FIVE', 'FIVE_ZERO', 'FIVE_FIVE', 'SIX_ZERO', 'SIX_FIVE', 'SEVEN_ZERO']
};

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

function cleanPhoneNumber(phone) {
    if (!phone) return null;
    
    // Remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // Handle international numbers
    if (cleaned.startsWith('+')) {
        return cleaned;
    }
    
    // Handle US numbers - keep only if 10 digits
    if (cleaned.length === 10) {
        return cleaned;
    }
    
    // Handle 11 digit numbers starting with 1
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
        return cleaned.substring(1);
    }
    
    // If can't clean properly, return original for manual review
    return phone;
}

function cleanDistrict(district) {
    if (!district) return null;
    
    const match = district.match(/District (\d+)/);
    if (match) {
        const num = parseInt(match[1]);
        if (num >= 1 && num <= 11) {
            return `District${num}`;
        }
    }
    
    // Handle non-SF districts
    const lowercaseDistrict = district.toLowerCase();
    if (lowercaseDistrict.includes('marina')) return 'Other';
    if (lowercaseDistrict.includes('oakland') || lowercaseDistrict.includes('east bay') || lowercaseDistrict.includes('berkeley')) return 'Other';
    if (lowercaseDistrict.includes('south bay') || lowercaseDistrict.includes('san jose') || lowercaseDistrict.includes('palo alto')) return 'Other';
    if (lowercaseDistrict.includes('marin') || lowercaseDistrict.includes('mill valley')) return 'Other';
    
    return 'Other';
}

function cleanGender(gender) {
    if (!gender) return null;
    
    const lowerGender = gender.toLowerCase().trim();
    
    switch (lowerGender) {
        case 'm':
        case 'man':
            return 'Man';
        case 'f':
        case 'woman':
            return 'Woman';
        case 'non-binary':
        case 'nonbinary':
        case 'they/them':
        case 'n':
            return 'NonBinary';
        default:
            return 'PreferNotToState';
    }
}

function cleanTennisRanking(ranking) {
    if (!ranking) return null;
    
    const num = parseFloat(ranking);
    if (isNaN(num)) return null;
    
    // Map numeric rankings to enum values
    const rankingMap = {
        1.0: 'ONE_ZERO',
        1.5: 'ONE_FIVE',
        2.0: 'TWO_ZERO',
        2.5: 'TWO_FIVE',
        3.0: 'THREE_ZERO',
        3.5: 'THREE_FIVE',
        4.0: 'FOUR_ZERO',
        4.5: 'FOUR_FIVE',
        5.0: 'FIVE_ZERO',
        5.5: 'FIVE_FIVE',
        6.0: 'SIX_ZERO',
        6.5: 'SIX_FIVE',
        7.0: 'SEVEN_ZERO'
    };
    
    return rankingMap[num] || null;
}

function cleanGearPreference(swag) {
    if (!swag) return null;
    
    const lowerSwag = swag.toLowerCase().trim();
    
    if (lowerSwag.includes('hat')) return 'Hat';
    if (lowerSwag.includes('shirt') || lowerSwag.includes('tee')) return 'Shirt';
    if (lowerSwag.includes('sock')) return 'Socks';
    
    return 'Other';
}

function cleanGearSize(size) {
    if (!size) return null;
    
    const upperSize = size.toUpperCase().trim();
    
    // Validate against schema enum
    if (SCHEMA_ENUMS.GearSize.includes(upperSize)) {
        return upperSize;
    }
    
    return null;
}

function cleanInstagramHandle(instagram) {
    if (!instagram) return null;
    
    const trimmed = instagram.trim();
    
    // Filter out non-handles
    const skipValues = ['n/a', 'none', 'na', "don't have one", "don't have", 'no', ''];
    if (skipValues.includes(trimmed.toLowerCase())) {
        return null;
    }
    
    // Handle URLs
    if (trimmed.startsWith('http')) {
        const match = trimmed.match(/instagram\.com\/([^\/\?]+)/);
        if (match) {
            return match[1];
        }
        return null;
    }
    
    // Clean handle
    let handle = trimmed;
    if (handle.startsWith('@')) {
        handle = handle.substring(1);
    }
    
    // Validate handle format (basic validation)
    if (/^[a-zA-Z0-9._]{1,30}$/.test(handle)) {
        return handle;
    }
    
    return null;
}

function cleanAgeRange(age) {
    if (!age) return null;
    
    const trimmed = age.trim();
    
    // Map age ranges to schema enum
    switch (trimmed) {
        case '18-25':
        case '18-26':
            return 'EIGHTEEN_TO_TWENTY_FIVE';
        case '26-35':
        case '25-35':
            return 'TWENTY_SIX_TO_THIRTY_FIVE';
        case '36-45':
        case '35-45':
            return 'THIRTY_SIX_TO_FORTY_FIVE';
        case '46-55':
        case '45-55':
            return 'FORTY_SIX_TO_FIFTY_FIVE';
        case '55+':
        case '55-65':
        case '65+':
        case '56+':
            return 'FIFTY_FIVE_PLUS';
        default:
            return 'PreferNotToState';
    }
}

function cleanEthnicity(ethnicity) {
    if (!ethnicity) return null;
    
    const trimmed = ethnicity.trim();
    const lower = trimmed.toLowerCase();
    
    // Handle direct matches first
    if (trimmed === 'Asian') return 'Asian';
    if (trimmed === 'White') return 'White';
    if (lower.includes('hispanic') || lower.includes('latinx') || lower.includes('latino')) return 'HispanicOrLatinx';
    if (lower.includes('mixed') || lower.includes('biracial') || lower.includes('multiracial')) return 'MixedRace';
    if (lower.includes('black') || lower.includes('african american')) return 'BlackOrAfricanAmerican';
    if (lower.includes('arab') || lower.includes('middle eastern')) return 'Arab';
    if (lower.includes('pacific islander') || lower.includes('hawaiian')) return 'PacificIslander';
    if (lower.includes('native american') || lower.includes('indigenous') || lower.includes('american indian')) return 'AmericanIndianOrAlaskaNative';
    
    return 'Other';
}

function cleanBirthDate(birthDate) {
    if (!birthDate) return null;
    
    const trimmed = birthDate.trim();
    
    // Handle M/D format (no year provided)
    const mdMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})$/);
    if (mdMatch) {
        // We can't create a valid date without year, so return null
        return null;
    }
    
    // Handle full date formats
    try {
        const date = new Date(trimmed);
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
        }
    } catch (e) {
        // Invalid date
    }
    
    return null;
}

function transformRowToTennisProfile(row) {
    const transformed = {
        // Contact info
        firstName: row['First Name']?.trim() || null,
        lastName: row['Last Name']?.trim() || null,
        email: row['Email']?.trim() || null,
        phone: cleanPhoneNumber(row['Phone Number']),
        
        // Personal info
        gender: cleanGender(row['Which most closely describes your gender?']),
        ageRange: cleanAgeRange(row['Age']),
        birthDate: cleanBirthDate(row['Birth Date']),
        ethnicity: cleanEthnicity(row['Ethnicity']),
        instagramHandle: cleanInstagramHandle(row['Instagram']),
        district: cleanDistrict(row['District']),
        
        // Tennis info
        tennisRanking: cleanTennisRanking(row['What is your Tennis Ranking?']),
        favoriteTennisPlayer: row['Favorite Player']?.trim() || null,
        
        // TMAC preferences
        tmacGearPreference: cleanGearPreference(row['Swag']),
        gearSize: cleanGearSize(row['Size']),
        playlistSong: row['TMAC Playlist']?.trim() || null,
        whyJoinTmac: row['Why Join']?.trim() || null,
        referredBy: row['Referral']?.trim() || null,
        
        // Metadata (for validation)
        _originalRow: row.Timestamp || 'Unknown',
        _approved: row['Approved'] === 'TRUE'
    };
    
    // Remove empty strings and convert to null
    Object.keys(transformed).forEach(key => {
        if (transformed[key] === '' || transformed[key] === 'N/A' || transformed[key] === 'n/a') {
            transformed[key] = null;
        }
    });
    
    return transformed;
}

function generateCleanedCSV(inputPath, outputPath) {
    console.log('🧹 Starting roster data cleaning...\n');
    
    // Read and parse input CSV
    const csvText = fs.readFileSync(inputPath, 'utf-8');
    const { rows } = parseCSV(csvText);
    
    console.log(`📊 Processing ${rows.length} rows...`);
    
    // Transform all rows
    const transformedRows = rows.map(row => transformRowToTennisProfile(row));
    
    // Filter to only approved members
    const approvedRows = transformedRows.filter(row => row._approved);
    console.log(`✅ ${approvedRows.length} approved members found`);
    
    // Generate output CSV headers (TennisProfile fields only)
    const outputHeaders = [
        'firstName',
        'lastName',
        'email',
        'phone',
        'gender',
        'ageRange',
        'birthDate',
        'ethnicity',
        'instagramHandle',
        'district',
        'tennisRanking',
        'favoriteTennisPlayer',
        'tmacGearPreference',
        'gearSize',
        'playlistSong',
        'whyJoinTmac',
        'referredBy'
    ];
    
    // Create CSV content
    let csvContent = outputHeaders.join(',') + '\n';
    
    approvedRows.forEach(row => {
        const values = outputHeaders.map(header => {
            const value = row[header];
            if (value === null || value === undefined) {
                return '';
            }
            // Escape values containing commas or quotes
            const stringValue = String(value);
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        });
        csvContent += values.join(',') + '\n';
    });
    
    // Write output file
    fs.writeFileSync(outputPath, csvContent);
    
    console.log(`\n💾 Clean CSV saved to: ${outputPath}`);
    
    // Generate validation report
    generateValidationReport(approvedRows, outputHeaders);
    
    return approvedRows;
}

function generateValidationReport(rows, headers) {
    console.log('\n📋 DATA VALIDATION REPORT');
    console.log('='.repeat(50));
    
    headers.forEach(field => {
        const nonNullValues = rows.filter(row => row[field] !== null && row[field] !== undefined && row[field] !== '');
        const nullCount = rows.length - nonNullValues.length;
        const completionRate = ((nonNullValues.length / rows.length) * 100).toFixed(1);
        
        console.log(`${field.padEnd(20)} | ${completionRate.padStart(5)}% complete | ${nullCount.toString().padStart(4)} null values`);
    });
    
    // Schema validation warnings
    console.log('\n⚠️  SCHEMA VALIDATION WARNINGS:');
    
    const genderIssues = rows.filter(row => row.gender && !SCHEMA_ENUMS.Gender.includes(row.gender));
    if (genderIssues.length > 0) {
        console.log(`- ${genderIssues.length} invalid gender values`);
    }
    
    const districtIssues = rows.filter(row => row.district && !SCHEMA_ENUMS.District.includes(row.district));
    if (districtIssues.length > 0) {
        console.log(`- ${districtIssues.length} invalid district values`);
    }
    
    const rankingIssues = rows.filter(row => row.tennisRanking && !SCHEMA_ENUMS.TennisRanking.includes(row.tennisRanking));
    if (rankingIssues.length > 0) {
        console.log(`- ${rankingIssues.length} invalid tennis ranking values`);
    }
    
    const ageRangeIssues = rows.filter(row => row.ageRange && !SCHEMA_ENUMS.AgeRange.includes(row.ageRange));
    if (ageRangeIssues.length > 0) {
        console.log(`- ${ageRangeIssues.length} invalid age range values`);
    }
    
    console.log('\n✨ Data cleaning complete!');
}

// Run the cleaning process
const inputPath = path.join(__dirname, '../data/roster.csv');
const outputPath = path.join(__dirname, '../data/roster_cleaned.csv');

generateCleanedCSV(inputPath, outputPath);