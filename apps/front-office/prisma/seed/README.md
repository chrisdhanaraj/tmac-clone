# Database Seeding

This directory contains database seeding scripts for the TMAC application.

## Seed Files

- **`courts.ts`** - Seeds court locations and courts from `courts.csv`
- **`tennis-roles.ts`** - Seeds default tennis roles for the organization
- **`tennis-profiles.ts`** - Imports tennis profiles from roster data

## Tennis Roles

The following default tennis roles are seeded:

1. **host** - Responsible for hosting events and managing event logistics
2. **feeder** - Assists with on-court activities and ball feeding during sessions  
3. **marketing** - Manages marketing initiatives and social media presence
4. **membership and culture** - Focuses on member engagement and community building
5. **social** - Organizes social events and networking opportunities
6. **tmatch** - Coordinates tennis matches and competitive play opportunities
7. **partnerships & sponsorships** - Develops partnerships and secures sponsorships
8. **courtiers** - Manages court reservations and maintenance coordination
9. **policy** - Develops and maintains club policies and governance

## Usage

### Run all seeding:
```bash
pnpm db:seed
```

### Run specific seeding:
```bash
# Seed only tennis roles
pnpm db:seed-tennis-roles

# Import roster data
pnpm db:import-roster
```

## Requirements

- The `tennisRoles` table must exist before running tennis role seeding
- Expected table structure: `id, name, description, isActive, createdAt, updatedAt`
- Run database migrations before seeding