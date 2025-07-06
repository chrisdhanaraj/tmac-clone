#!/usr/bin/env node
/**
 * Script to retry importing failed records with detailed error logging and data sanitization
 */

import 'dotenv/config';
import { PrismaClient, Gender, AgeRange, Ethnicity, District, TmacGearPreference, GearSize, TennisRanking } from "../app/generated/prisma/index.ts";
import { parse } from "csv-parse/sync";
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();

// Enhanced validation functions with detailed error reporting
function validateField(fieldName, value, validator, enumValues = null) {
    const result = {
        isValid: true,
        value: null,
        error: null,
        suggestion: null
    };

    try {
        if (!value || value.trim() === '') {
            result.value = null;
            return result;
        }

        const trimmedValue = value.trim();
        
        if (enumValues) {
            // Check if value matches enum
            if (enumValues.includes(trimmedValue)) {
                result.value = trimmedValue;
            } else {
                result.isValid = false;
                result.error = `Invalid ${fieldName}: '${trimmedValue}' not in allowed values`;
                result.suggestion = findClosestMatch(trimmedValue, enumValues);
            }
        } else {
            // Use custom validator
            result.value = validator(trimmedValue);
            if (result.value === null && trimmedValue !== '') {
                result.isValid = false;
                result.error = `Invalid ${fieldName}: '${trimmedValue}' failed validation`;
            }
        }
    } catch (error) {
        result.isValid = false;
        result.error = `${fieldName} validation error: ${error.message}`;
    }

    return result;
}

function findClosestMatch(value, enumValues) {
    const lowerValue = value.toLowerCase();
    
    // Try exact match first
    const exactMatch = enumValues.find(e => e.toLowerCase() === lowerValue);
    if (exactMatch) return exactMatch;
    
    // Try partial match
    const partialMatch = enumValues.find(e => 
        e.toLowerCase().includes(lowerValue) || lowerValue.includes(e.toLowerCase())
    );
    if (partialMatch) return partialMatch;
    
    return enumValues[0]; // Default fallback
}

function sanitizeEmail(email) {
    if (!email) return null;
    return email.toLowerCase().trim();
}

function sanitizePhoneNumber(phone) {
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
    
    // Return original if can't clean
    return phone;
}

function sanitizeDate(dateString) {
    if (!dateString) return null;
    try {
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? null : date;
    } catch {
        return null;
    }
}

function sanitizeString(value, maxLength = null) {
    if (!value) return null;
    const trimmed = value.trim();
    if (maxLength && trimmed.length > maxLength) {
        return trimmed.substring(0, maxLength);
    }
    return trimmed;
}

async function validateRecord(record) {
    const validation = {
        isValid: true,
        errors: [],
        warnings: [],
        sanitizedRecord: {},
        suggestions: []
    };

    // Validate and sanitize each field
    const fields = [
        {
            name: 'firstName',
            value: record.firstName,
            validator: (v) => sanitizeString(v, 100)
        },
        {
            name: 'lastName', 
            value: record.lastName,
            validator: (v) => sanitizeString(v, 100)
        },
        {
            name: 'email',
            value: record.email,
            validator: sanitizeEmail,
            required: true
        },
        {
            name: 'phone',
            value: record.phone,
            validator: sanitizePhoneNumber
        },
        {
            name: 'gender',
            value: record.gender,
            enumValues: Object.values(Gender)
        },
        {
            name: 'ageRange',
            value: record.ageRange,
            enumValues: Object.values(AgeRange)
        },
        {
            name: 'birthDate',
            value: record.birthDate,
            validator: sanitizeDate
        },
        {
            name: 'ethnicity',
            value: record.ethnicity,
            enumValues: Object.values(Ethnicity)
        },
        {
            name: 'instagramHandle',
            value: record.instagramHandle,
            validator: (v) => sanitizeString(v, 50)
        },
        {
            name: 'district',
            value: record.district,
            enumValues: Object.values(District)
        },
        {
            name: 'tennisRanking',
            value: record.tennisRanking,
            enumValues: Object.values(TennisRanking)
        },
        {
            name: 'favoriteTennisPlayer',
            value: record.favoriteTennisPlayer,
            validator: (v) => sanitizeString(v, 100)
        },
        {
            name: 'tmacGearPreference',
            value: record.tmacGearPreference,
            enumValues: Object.values(TmacGearPreference)
        },
        {
            name: 'gearSize',
            value: record.gearSize,
            enumValues: Object.values(GearSize)
        },
        {
            name: 'playlistSong',
            value: record.playlistSong,
            validator: (v) => sanitizeString(v, 200)
        },
        {
            name: 'whyJoinTmac',
            value: record.whyJoinTmac,
            validator: (v) => sanitizeString(v, 500)
        },
        {
            name: 'referredBy',
            value: record.referredBy,
            validator: (v) => sanitizeString(v, 100)
        }
    ];

    for (const field of fields) {
        const result = validateField(
            field.name,
            field.value,
            field.validator,
            field.enumValues
        );

        validation.sanitizedRecord[field.name] = result.value;

        if (!result.isValid) {
            if (field.required) {
                validation.isValid = false;
                validation.errors.push(`${field.name}: ${result.error}`);
            } else {
                validation.warnings.push(`${field.name}: ${result.error}`);
            }
            
            if (result.suggestion) {
                validation.suggestions.push(`${field.name}: Try '${result.suggestion}' instead of '${field.value}'`);
            }
        }
    }

    // Check for required fields
    if (!validation.sanitizedRecord.email) {
        validation.isValid = false;
        validation.errors.push('email: Required field is missing');
    }

    if (!validation.sanitizedRecord.firstName && !validation.sanitizedRecord.lastName) {
        validation.warnings.push('Both firstName and lastName are missing');
    }

    return validation;
}

async function retryFailedRecords() {
    console.log('🔄 RETRYING FAILED RECORDS');
    console.log('=' .repeat(50));

    const results = {
        attempted: 0,
        successful: 0,
        failed: 0,
        errors: []
    };

    try {
        // Read CSV records
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const csvFilePath = join(__dirname, "../data/roster_cleaned.csv");
        const fileContent = readFileSync(csvFilePath, "utf-8");
        const csvRecords = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
        });

        // Get existing database emails
        const existingRecords = await prisma.tennisProfile.findMany({
            select: { email: true }
        });
        const existingEmails = new Set(
            existingRecords
                .map(r => r.email?.toLowerCase().trim())
                .filter(Boolean)
        );

        // Find missing records
        const missingRecords = csvRecords.filter(record => {
            const email = record.email?.toLowerCase().trim();
            return email && !existingEmails.has(email);
        });

        console.log(`📊 Found ${missingRecords.length} missing records to retry\n`);

        results.attempted = missingRecords.length;

        // Process each missing record
        for (let i = 0; i < missingRecords.length; i++) {
            const record = missingRecords[i];
            const recordNum = i + 1;
            
            console.log(`🔄 [${recordNum}/${missingRecords.length}] Processing: ${record.firstName} ${record.lastName} (${record.email})`);

            // Validate record
            const validation = await validateRecord(record);

            if (validation.warnings.length > 0) {
                console.log(`   ⚠️  Warnings: ${validation.warnings.join('; ')}`);
            }

            if (validation.suggestions.length > 0) {
                console.log(`   💡 Suggestions: ${validation.suggestions.join('; ')}`);
            }

            if (!validation.isValid) {
                console.log(`   ❌ Validation failed: ${validation.errors.join('; ')}`);
                results.failed++;
                results.errors.push({
                    email: record.email,
                    name: `${record.firstName} ${record.lastName}`,
                    errors: validation.errors,
                    warnings: validation.warnings,
                    suggestions: validation.suggestions
                });
                continue;
            }

            // Try to import the sanitized record
            try {
                await prisma.tennisProfile.create({
                    data: validation.sanitizedRecord
                });

                console.log(`   ✅ Successfully imported!`);
                results.successful++;
                
            } catch (error) {
                console.log(`   ❌ Database error: ${error.message}`);
                results.failed++;
                results.errors.push({
                    email: record.email,
                    name: `${record.firstName} ${record.lastName}`,
                    errors: [`Database error: ${error.message}`],
                    warnings: validation.warnings,
                    suggestions: validation.suggestions
                });
            }
        }

        // Generate detailed error report
        const errorReportPath = join(__dirname, '../data/failed_records_detailed_analysis.json');
        writeFileSync(errorReportPath, JSON.stringify({
            summary: results,
            timestamp: new Date().toISOString(),
            details: results.errors
        }, null, 2));

        console.log('\n📋 RETRY SUMMARY');
        console.log('=' .repeat(30));
        console.log(`Attempted: ${results.attempted}`);
        console.log(`Successful: ${results.successful}`);
        console.log(`Failed: ${results.failed}`);
        console.log(`Success rate: ${((results.successful / results.attempted) * 100).toFixed(1)}%`);
        console.log(`\n📄 Detailed error report saved to: failed_records_detailed_analysis.json`);

        if (results.successful > 0) {
            console.log(`\n✨ Successfully recovered ${results.successful} records!`);
        }

        if (results.failed > 0) {
            console.log(`\n⚠️  ${results.failed} records still need manual review.`);
            console.log('Check the detailed analysis file for specific issues and suggestions.');
        }

    } catch (error) {
        console.error('❌ Retry process failed:', error);
    } finally {
        await prisma.$disconnect();
    }

    return results;
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    retryFailedRecords()
        .catch(console.error);
}

export { retryFailedRecords };