#!/bin/bash

echo "🎾 Installing TMAC Intake Form Seeder dependencies..."

# Navigate to front-office directory and install dependencies
cd ../..
pnpm install

echo "✅ Dependencies installed!"
echo ""
echo "Next steps:"
echo "1. Run 'pnpm seed:analyze-intake' to analyze the data patterns"
echo "2. Run 'pnpm seed:test-intake' to test processing without database operations"
echo "3. Run 'pnpm seed:intake-form' to populate the database with intake form data"
echo ""
echo "See scripts/seed-intake-form/README.md for detailed usage instructions."
