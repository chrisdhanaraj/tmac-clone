#!/usr/bin/env node
/**
 * Script to generate comprehensive CSV report of all import records and their status
 */

import 'dotenv/config';
import { PrismaClient } from "../app/generated/prisma/index.ts";
import { parse } from "csv-parse/sync";
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();

async function generateImportReport() {
    console.log('📊 GENERATING COMPREHENSIVE IMPORT REPORT');
    console.log('=' .repeat(50));

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

        console.log(`📂 Loaded ${csvRecords.length} CSV records`);

        // Get all database records
        const dbRecords = await prisma.tennisProfile.findMany({
            select: {
                email: true,
                firstName: true,
                lastName: true,
                createdAt: true
            }
        });

        console.log(`💾 Found ${dbRecords.length} database records`);

        // Create lookup maps
        const dbEmailMap = new Map();
        dbRecords.forEach(record => {
            const email = record.email?.toLowerCase().trim();
            if (email) {
                dbEmailMap.set(email, record);
            }
        });

        // Track email occurrences to identify duplicates
        const emailCounts = new Map();
        const emailFirstOccurrence = new Map();
        
        csvRecords.forEach((record, index) => {
            const email = record.email?.toLowerCase().trim();
            if (email) {
                if (!emailCounts.has(email)) {
                    emailCounts.set(email, 0);
                    emailFirstOccurrence.set(email, index);
                }
                emailCounts.set(email, emailCounts.get(email) + 1);
            }
        });

        // Generate report for each CSV record
        const reportData = [];
        let stats = {
            imported: 0,
            duplicateSkipped: 0,
            noEmailSkipped: 0,
            failedImport: 0
        };

        csvRecords.forEach((record, index) => {
            const email = record.email?.toLowerCase().trim();
            const name = `${record.firstName || ''} ${record.lastName || ''}`.trim();
            
            let status, reason, details, actionNeeded;

            // Determine status and reason
            if (!email || email === '') {
                status = 'NO_EMAIL_SKIPPED';
                reason = 'Missing email address';
                details = 'Record cannot be imported without email';
                actionNeeded = 'Add valid email address';
                stats.noEmailSkipped++;
            }
            else if (emailCounts.get(email) > 1) {
                const isFirstOccurrence = emailFirstOccurrence.get(email) === index;
                if (isFirstOccurrence && dbEmailMap.has(email)) {
                    status = 'IMPORTED';
                    reason = 'Successfully imported (first occurrence)';
                    details = `Email appears ${emailCounts.get(email)} times in CSV`;
                    actionNeeded = 'None';
                    stats.imported++;
                } else if (isFirstOccurrence) {
                    status = 'FAILED_IMPORT';
                    reason = 'Failed to import despite being first occurrence';
                    details = `Email appears ${emailCounts.get(email)} times in CSV, but import failed`;
                    actionNeeded = 'Check validation errors';
                    stats.failedImport++;
                } else {
                    status = 'DUPLICATE_SKIPPED';
                    reason = 'Duplicate email address';
                    details = `${index - emailFirstOccurrence.get(email)} occurrence(s) after first`;
                    actionNeeded = 'None (correctly skipped)';
                    stats.duplicateSkipped++;
                }
            }
            else if (dbEmailMap.has(email)) {
                status = 'IMPORTED';
                reason = 'Successfully imported';
                const dbRecord = dbEmailMap.get(email);
                details = `Imported on ${dbRecord.createdAt.toISOString().split('T')[0]}`;
                actionNeeded = 'None';
                stats.imported++;
            }
            else {
                status = 'FAILED_IMPORT';
                reason = 'Failed validation or database constraints';
                details = 'Record should have been imported but failed';
                actionNeeded = 'Review validation errors and retry';
                stats.failedImport++;
            }

            // Add common data quality issues
            const dataIssues = [];
            if (!record.firstName && !record.lastName) {
                dataIssues.push('Missing both first and last name');
            }
            if (record.phone && !/^[\d\s\(\)\-\+]+$/.test(record.phone)) {
                dataIssues.push('Invalid phone format');
            }
            if (record.instagramHandle && record.instagramHandle.length > 50) {
                dataIssues.push('Instagram handle too long');
            }
            if (record.whyJoinTmac && record.whyJoinTmac.length > 500) {
                dataIssues.push('WhyJoinTmac text too long');
            }

            if (dataIssues.length > 0) {
                details += (details ? '; ' : '') + 'Issues: ' + dataIssues.join(', ');
            }

            reportData.push({
                csvRowIndex: index + 2, // +2 because CSV is 1-indexed and has header
                email: record.email || '',
                firstName: record.firstName || '',
                lastName: record.lastName || '',
                status,
                reason,
                details,
                actionNeeded,
                phone: record.phone || '',
                district: record.district || '',
                tennisRanking: record.tennisRanking || '',
                tmacGearPreference: record.tmacGearPreference || '',
                ageRange: record.ageRange || '',
                gender: record.gender || ''
            });
        });

        // Generate CSV report
        const csvHeader = [
            'csvRowIndex',
            'email', 
            'firstName',
            'lastName',
            'status',
            'reason',
            'details',
            'actionNeeded',
            'phone',
            'district',
            'tennisRanking',
            'tmacGearPreference',
            'ageRange',
            'gender'
        ];

        const csvContent = [
            csvHeader.join(','),
            ...reportData.map(row => 
                csvHeader.map(header => {
                    const value = String(row[header] || '');
                    // Escape values containing commas or quotes
                    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value;
                }).join(',')
            )
        ].join('\n');

        // Save report
        const reportPath = join(__dirname, '../data/import_report.csv');
        writeFileSync(reportPath, csvContent);

        // Generate summary
        console.log('\n📋 IMPORT REPORT SUMMARY');
        console.log('=' .repeat(30));
        console.log(`Total CSV records: ${csvRecords.length}`);
        console.log(`✅ Successfully imported: ${stats.imported}`);
        console.log(`🔄 Duplicate skipped: ${stats.duplicateSkipped}`);
        console.log(`📭 No email skipped: ${stats.noEmailSkipped}`);
        console.log(`❌ Failed import: ${stats.failedImport}`);
        console.log(`\nSuccess rate: ${((stats.imported / csvRecords.length) * 100).toFixed(1)}%`);
        console.log(`\n📄 Detailed report saved to: ${reportPath}`);

        // Generate breakdown by status
        const statusBreakdown = reportData.reduce((acc, row) => {
            acc[row.status] = (acc[row.status] || 0) + 1;
            return acc;
        }, {});

        console.log('\n📊 STATUS BREAKDOWN:');
        Object.entries(statusBreakdown).forEach(([status, count]) => {
            console.log(`${status}: ${count}`);
        });

        // List failed imports for immediate attention
        const failedRecords = reportData.filter(row => row.status === 'FAILED_IMPORT');
        if (failedRecords.length > 0) {
            console.log(`\n⚠️  FAILED IMPORTS (${failedRecords.length}) - Need Attention:`);
            failedRecords.slice(0, 10).forEach((record, i) => {
                console.log(`${i + 1}. ${record.firstName} ${record.lastName} (${record.email})`);
            });
            if (failedRecords.length > 10) {
                console.log(`... and ${failedRecords.length - 10} more (see CSV for full list)`);
            }
        }

        return {
            stats,
            reportPath,
            failedRecords: failedRecords.length
        };

    } catch (error) {
        console.error('❌ Report generation failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    generateImportReport()
        .catch(console.error);
}

export { generateImportReport };