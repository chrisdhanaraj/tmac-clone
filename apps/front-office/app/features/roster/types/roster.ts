// Type definitions for the Tennis Roster feature

import type { District, TennisRanking } from "~/generated/prisma";

// Day of week enum
export enum DayOfWeek {
  Monday = "Monday",
  Tuesday = "Tuesday",
  Wednesday = "Wednesday",
  Thursday = "Thursday",
  Friday = "Friday",
  Saturday = "Saturday",
  Sunday = "Sunday",
}

// Time preference enum
export enum TimePreference {
  Morning = "Morning",
  Evening = "Evening",
  AllDay = "All Day",
}

// Playing style enum
export enum PlayingStyle {
  Sets = "Sets",
  Rallies = "Rallies",
  ServePractice = "Serve Practice",
}

// Match format enum
export enum MatchFormat {
  Singles = "Singles",
  Doubles = "Doubles",
  Mixed = "Mixed",
}

// Availability structure
export interface Availability {
  day: DayOfWeek;
  timePreference: TimePreference;
}

// Tennis role interface
export interface TennisRole {
  id: string;
  name: string;
  description?: string;
}

// Upcoming event interface
export interface UpcomingEvent {
  id: string;
  title: string;
  date: Date;
  location: string;
}

// Main player interface for roster display
export interface RosterPlayer {
  id: string;
  firstName: string;
  lastName: string;
  district: District;
  districtOther?: string;
  tennisRanking: TennisRanking;

  // Social and personality
  instagramHandle?: string;
  favoriteTennisPlayer?: string;
  playlistSong?: string;

  // Tennis preferences
  availability: Availability[];
  playingStyles: PlayingStyle[];
  matchFormats: MatchFormat[];

  // Roles and activity
  tennisRoles: TennisRole[];
  upcomingEvents?: UpcomingEvent[];

  // Profile completeness
  isProfileComplete: boolean;
}

// Filter state interface
export interface RosterFilters {
  search: string;
  districts: District[];
  skillLevels: TennisRanking[];
  availability: {
    days: DayOfWeek[];
    times: TimePreference[];
  };
  playingStyles: PlayingStyle[];
  matchFormats: MatchFormat[];
}

// Sort options
export enum SortOption {
  Alphabetical = "alphabetical",
  SkillLevel = "skillLevel",
  District = "district",
}

// View mode for grid/list toggle
export enum ViewMode {
  Grid = "grid",
  List = "list",
}
