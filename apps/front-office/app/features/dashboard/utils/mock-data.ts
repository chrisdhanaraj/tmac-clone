// Mock data generators for dashboard UI prototype

// Player names for generating match results (inspired by MAC community but changed)
const PLAYER_NAMES = [
  "Ryan Chen",
  "Kavya Patel",
  "Ari Goldstein",
  "Ashish Kumar",
  "Fernanda Silva",
  "Chris Davis",
  "Michelle Park",
  "Danny Torres",
  "Eva Rodriguez",
  "Lance Kim",
  "Joseph Martinez",
  "Julia Santos",
  "Colin Johnson",
  "Celina Chang",
  "Diego Williams",
  "Sandy Miller",
  "Andrew Lopez",
  "Sylvie Anderson",
  "Tom Garcia",
  "Alicia Thompson",
];

// Court locations (based on real MAC community courts from recent chat)
const COURT_LOCATIONS = [
  "Dolores Park Courts",
  "Mission Playground Courts",
  "Hamilton Tennis Courts",
  "Golden Gate Park (GGP)",
  "Joe DiMaggio Courts",
  "Glen Park Courts",
  "James Rolph Courts",
  "Jose Coronado Courts",
  "Crocker Amazon Tennis Courts",
  "Potrero Tennis Courts",
  "Lafayette Tennis Court",
  "Douglass Playground Courts",
  "Noe Valley Courts",
  "Moscone Recreation Center",
];

// Event types and hosts (based on real MAC event patterns)
const EVENT_HOSTS = [
  "Ryan Hosts V&V: WEEK",
  "Kavya Hosts VV-S3: WEEK",
  "Ari Hosts First Volleys: WEEK",
  "Ashish Hosts Flow: WEEK",
  "Fernanda Hosts Vibras y Voleas: WEEK",
  "Sarah Hosts Volley & Vibes: WEEK",
  "Michael Hosts Social Rally: WEEK",
  "Jessica Hosts Doubles Clinic: WEEK",
  "David Hosts Morning Mix: WEEK",
  "Maria Hosts Tennis Flow: WEEK",
  "Alex Hosts Court Vibes: WEEK",
  "Emily Hosts Rally Social: WEEK",
];

// Tennis score patterns
const TENNIS_SCORES = [
  "6-4, 6-3",
  "7-5, 6-4",
  "6-2, 6-1",
  "6-4, 3-6, 6-3",
  "7-6, 6-7, 6-4",
  "6-3, 6-2",
  "6-1, 6-0",
  "4-6, 6-3, 7-5",
  "6-4, 6-4",
  "7-5, 3-6, 6-2",
];

// WhatsApp activity messages (most recent 30 from Match Play chat, names changed)
const WHATSAPP_MESSAGES = [
  `wfc (work from court) – anyone know what the walk-on at dolo is like rn? 
  
🗓 today
⏰ now til 6
📍dolo (walk-on)
🎾 3.25+
✋ 3.25+`,
  "No line",
  `Looking for a hitting partner for today!
  
🗓 Tues 8/19
⏰ 3-4
📍GGP
🎾 3.0+
✋ 3.5`,
  `Beautiful weather today and trying to ditch work early! 

🗓️ Tues 8/19
⏰ 2pm+
📍 Dolores (walk-on)
🎾 4.0+
✋🏽 ~4.25`,
  `Would love to play later afternoon/early evening today! Happy to walk up in the mission or Noe, could perhaps go further if needed!

🗓️ Tues 8/19
⏰ 4PM+
📍 Dolores, Douglass playground, Glen Park, James Randolph walk on
🎾 3.0+
👋🏻3.2ish`,
  "you're above me level wise but i am free if you don't find anyone else :)",
  "Someone already responded and we organized but thanks for the response!",
  "Don't forget to use the 🛑/🔴 symbol on your original post so people know the request is closed!",
  `Double trouble at dolo w/ Sarah and I?? 
📆 today 8/19 
⏰12-2
🎾 3.0+
👋🏽 ~3.5
Need one more to joinn! DM me`,
  `Walk-on somewhere in the mission (Dolo, Playground, James rolph, Jose Coronado) anybody?

📆 today 8/19
⏰2-5
🎾 3.5+
👋🏽 ~4`,
  `Looking for a rally partner this afternoon, open to go other courts if you one reserved                     🗓️ Tues 8/19
  
⏰ after 4pm
📍 Mission Dolores, Glen Park, Noe walk on
🎾 3.0ish
👋 2.5-3.0ish`,
  `Anyone free to play in the evening after 7:30 pm

🗓️ Today 8/19
⏰ 7:30 PM+
📍 Dolores walk on
🎾 3.0+
👋🏻 3.5`,
  `Anyone want to rally Thursday?                     🗓️ Thursday 8/21
⏰ after 4pm
📍 Mission playground or Dolores walk on
🎾 3.0-3.5
👋 3.0-3.5`,
  `Looking for 2 more players to join Sarah and me for doubles tomorrow :) ✋🏼or DM!                                                                                            

🗓️ Wednesday 8/20
⏰ 6PM-7:30Pm 
📍Dolores (res)
🎾 3.25+ 
🤚 3.25`,
  "Update: looking for 1 more player (3.25+) to close our doubles 🙏🏼",
  `Afternoon rally                                     🗓️ Wednesday 8/20
⏰ 3:30-4:30
📍 Joe DiMaggio walk on
🎾 2.75+
👋 2.75`,
  `afternoon rally?                                     🗓️ Wednesday 8/20
⏰ 3:30-4:30
📍 Dolores walk on
🎾 3 +
👋 3.25`,
  `Looking for one more person for doubles tonight 

🗓️ Wednesday 8/20
⏰ 7:30PM+
📍 Dolores walk on
🎾 3.0+
👋 3.5`,
  `Rally & set tomorrow?
🗓️ Thursday 8/21
⏰ 7:30pm
📍 Dolores (res)
🎾 3.75+
👋 4.0`,
];

// Reaction emojis
export const REACTION_EMOJIS = ["👏", "🎾", "🔥", "💪", "🙌"];

// Helper function to get random item from array
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper function to get random date within range
function getRandomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

// Generate mock events
export function generateMockEvents(count: number = 10) {
  const events = [];
  const now = new Date();
  const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  // More realistic MAC event times (based on real data)
  const EVENT_TIMES = [
    "2:00 PM",
    "6:00 PM",
    "7:00 PM",
    "11:00 AM",
    "4:00 PM",
    "5:30 PM",
  ];

  for (let i = 0; i < count; i++) {
    const eventDate = getRandomDate(now, twoWeeksFromNow);
    const totalSpots = Math.floor(Math.random() * 40) + 10; // 10-50 spots (more realistic for MAC)
    const takenSpots = Math.floor(Math.random() * totalSpots);
    const weekNumber = Math.floor(Math.random() * 12) + 1; // WEEK 1-12
    const hostTemplate = getRandomItem(EVENT_HOSTS);

    events.push({
      id: `event-${i}`,
      title: `${hostTemplate} ${weekNumber}`,
      date: eventDate,
      time: getRandomItem(EVENT_TIMES),
      location: getRandomItem(COURT_LOCATIONS),
      spotsAvailable: totalSpots - takenSpots,
      totalSpots: totalSpots,
      description: "Join the Mission Athletic Club community for tennis!",
    });
  }

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

// Generate mock match results
export function generateMockMatchResults(count: number = 20) {
  const results = [];
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < count; i++) {
    const player1 = getRandomItem(PLAYER_NAMES);
    let player2 = getRandomItem(PLAYER_NAMES);
    while (player2 === player1) {
      player2 = getRandomItem(PLAYER_NAMES);
    }

    const reactions: Record<string, number> = {};
    REACTION_EMOJIS.forEach((emoji) => {
      reactions[emoji] = Math.floor(Math.random() * 15);
    });

    results.push({
      id: `result-${i}`,
      player1,
      player2,
      score: getRandomItem(TENNIS_SCORES),
      timestamp: getRandomDate(oneWeekAgo, now),
      reactions,
      notes:
        Math.random() > 0.7
          ? "Great match! Very competitive rallies."
          : undefined,
    });
  }

  return results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

// Generate mock WhatsApp activities
export function generateMockWhatsAppActivities(count: number = 15) {
  const activities = [];
  const now = new Date();
  const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);

  for (let i = 0; i < count; i++) {
    activities.push({
      id: `whatsapp-${i}`,
      sender: getRandomItem(PLAYER_NAMES),
      message: getRandomItem(WHATSAPP_MESSAGES),
      timestamp: getRandomDate(twelveHoursAgo, now),
      channel: "Match Play",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
    });
  }

  return activities.sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );
}

// Generate all mock data at once
export function generateAllMockData() {
  return {
    events: generateMockEvents(10),
    matchResults: generateMockMatchResults(20),
    whatsAppActivities: generateMockWhatsAppActivities(15),
  };
}

// Format date helpers
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

export function formatEventDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}
