/**
 * In-memory mock data store.
 * Ported from Deburn-BackEnd/mocks/mock_v2.py, upgraded so create/read
 * round-trips (notifications, pools, groups, content, checkins) actually persist
 * for the lifetime of the process instead of returning disconnected canned data.
 */
import { randomBytes } from 'crypto';

export function hex(bytes = 4) {
  return randomBytes(bytes).toString('hex');
}

export function nowIso() {
  return new Date().toISOString();
}

export function daysAgo(days) {
  return new Date(Date.now() - days * 86400000).toISOString();
}

export function daysFromNow(days) {
  return new Date(Date.now() + days * 86400000).toISOString();
}

export const MOCK_USER = {
  _id: 'usr_mock123',
  id: 'usr_mock123',
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  isAdmin: false,
  hasCompletedAssessment: false,
  profile: {
    firstName: 'John',
    lastName: 'Doe',
    organization: 'Acme Corp',
    jobTitle: 'Engineering Manager',
    preferredLanguage: 'en',
    timezone: 'Europe/Stockholm',
    country: 'SE',
  },
};

export const MOCK_ADMIN_USER = {
  _id: 'usr_admin456',
  id: 'usr_admin456',
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  isAdmin: true,
  hasCompletedAssessment: false,
  profile: {
    firstName: 'Admin',
    lastName: 'User',
    organization: 'Deburn',
    jobTitle: 'Administrator',
    preferredLanguage: 'en',
    timezone: 'Europe/Stockholm',
  },
};

/** token -> user copy (scoped per login so hasCompletedAssessment etc. don't leak across sessions) */
export const tokens = new Map();

export const MOCK_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
];

export const MOCK_CHECKIN_INSIGHTS = {
  en: [
    'Your stress tends to spike on Thursdays. Consider blocking 30 minutes before your afternoon meetings.',
    'Your energy levels are highest in the morning. Schedule demanding tasks during this time.',
    "You've maintained consistent sleep patterns this week. Great job!",
  ],
  sv: [
    'Din stress tenderar att toppa på torsdagar. Överväg att blockera 30 minuter före dina eftermiddagsmöten.',
    'Din energinivå är högst på morgonen. Schemalägg krävande uppgifter under denna tid.',
    'Du har hållit ett konsekvent sömnmönster denna vecka. Bra jobbat!',
  ],
};

export const MOCK_CHECKIN_TIPS = {
  en: [
    'Try the 2-minute breathing exercise before your 10am call',
    'Consider a short walk after lunch to boost afternoon energy',
    'Take a 5-minute break every 90 minutes for optimal focus',
  ],
  sv: [
    'Prova 2-minuters andningsövning före ditt 10-samtal',
    'Överväg en kort promenad efter lunch för att öka eftermiddagsenergin',
    'Ta en 5-minuters paus var 90:e minut för optimalt fokus',
  ],
};

/** Real check-in history so trends reflect actual submissions, seeded with 14 days of history. */
export const checkinHistory = Array.from({ length: 14 }, (_, i) => ({
  date: daysAgo(13 - i),
  mood: 2 + Math.floor(Math.random() * 4),
  physicalEnergy: 4 + Math.floor(Math.random() * 5),
  mentalEnergy: 4 + Math.floor(Math.random() * 5),
  stress: 2 + Math.floor(Math.random() * 6),
}));

/** Persisted reflection journal entries, newest last. */
export const reflections = [];

export const MOCK_REFLECTION_PROMPTS = [
  "What's on your mind?",
  'What went well today?',
  "What's one thing you want to let go of?",
  'What are you looking forward to?',
];

export const MOCK_CIRCLE_GROUPS = [
  {
    id: 'grp_123',
    name: 'Engineering Leaders',
    memberCount: 6,
    members: [
      { id: 'usr_1', name: 'Anna Svensson', email: 'anna@acme.com', avatar: null },
      { id: 'usr_2', name: 'Erik Lindqvist', email: 'erik@acme.com', avatar: null },
      { id: 'usr_3', name: 'Maria Karlsson', email: 'maria@acme.com', avatar: null },
    ],
    nextMeeting: {
      id: 'mtg_123',
      title: 'Bi-weekly Check-in',
      scheduledAt: daysFromNow(5),
      meetingLink: 'https://meet.google.com/abc-defg-hij',
    },
    pool: { cadence: 'bi-weekly', topic: 'Managing remote team dynamics' },
  },
  {
    id: 'grp_456',
    name: 'Product Managers Circle',
    memberCount: 4,
    members: [
      { id: 'usr_7', name: 'Sara Andersson', email: 'sara@techstart.se', avatar: null },
      { id: 'usr_8', name: 'Mikael Johansson', email: 'mikael@techstart.se', avatar: null },
    ],
    nextMeeting: null,
    pool: { cadence: 'weekly', topic: 'Stakeholder communication strategies' },
  },
];

export const groupMessages = new Map([
  [
    'grp_123',
    [
      {
        id: 'msg_1',
        userId: 'usr_1',
        userName: 'Anna Svensson',
        content: 'Hi everyone! Can we focus on week 7 for our next meeting?',
        createdAt: daysAgo(3),
      },
      {
        id: 'msg_2',
        userId: 'usr_2',
        userName: 'Erik Lindqvist',
        content: 'Works for me! Tuesday or Thursday afternoon would be ideal.',
        createdAt: daysAgo(3),
      },
      {
        id: 'msg_3',
        userId: 'usr_3',
        userName: 'Maria Karlsson',
        content: 'Thursday at 15:00 works great for me.',
        createdAt: daysAgo(2),
      },
    ],
  ],
  ['grp_456', []],
]);

export const groupMeetings = new Map([
  [
    'grp_123',
    [
      { id: 'mtg_123', title: 'Bi-weekly Check-in', scheduledAt: daysFromNow(5), status: 'scheduled' },
      { id: 'mtg_120', title: 'Bi-weekly Check-in', scheduledAt: daysAgo(9), status: 'completed' },
    ],
  ],
  ['grp_456', []],
]);

export const pendingInvitations = [
  { id: 'inv_pending_1', token: 'abc123token', poolName: 'Senior Leadership Circle', expiresAt: daysFromNow(8) },
];

export const userAvailability = [
  { dayOfWeek: 'monday', startTime: '10:00', endTime: '11:00' },
  { dayOfWeek: 'monday', startTime: '14:00', endTime: '16:00' },
  { dayOfWeek: 'wednesday', startTime: '10:00', endTime: '12:00' },
  { dayOfWeek: 'friday', startTime: '09:00', endTime: '11:00' },
];

/** Circle pools (admin-created), persisted so create -> list round-trips. */
export const pools = [
  {
    id: 'pool_123',
    name: 'Q1 Leadership Circle',
    status: 'active',
    topic: 'Managing remote teams',
    description: 'A circle for leaders managing remote teams',
    organizationId: 'org_1',
    targetGroupSize: 5,
    cadence: 'bi-weekly',
    stats: { invited: 20, accepted: 15, declined: 2 },
    invitationSettings: { expirationDays: 14 },
    createdAt: daysAgo(60),
    assignedAt: null,
  },
];

export const poolInvitations = new Map([
  [
    'pool_123',
    [
      {
        id: 'inv_1',
        email: 'user1@acme.com',
        firstName: 'User',
        lastName: 'One',
        status: 'pending',
        createdAt: daysAgo(10),
        expiresAt: daysFromNow(4),
      },
    ],
  ],
]);

export const poolGroups = new Map([
  [
    'pool_123',
    [
      {
        id: 'grp_new_1',
        name: 'Group A',
        memberCount: 2,
        members: [
          { id: 'usr_1', name: 'Anna Svensson', avatar: null },
          { id: 'usr_2', name: 'Erik Lindqvist', avatar: null },
        ],
        leaderId: 'usr_1',
      },
    ],
  ],
]);

/** conversationId -> conversation */
export const conversations = new Map();

function seedConversations() {
  const now = Date.now();
  const conv1 = `conv_${hex(8)}`;
  conversations.set(conv1, {
    id: conv1,
    title: 'Leadership skills development',
    status: 'active',
    createdAt: new Date(now - 3 * 86400000).toISOString(),
    lastMessageAt: new Date(now - 1 * 86400000).toISOString(),
    messages: [
      { role: 'user', content: 'I want to work on my leadership skills' },
      {
        role: 'assistant',
        content:
          "That's a great goal! Leadership development is a journey. Let's start by understanding where you are. What specific aspect of leadership would you like to focus on — communication, decision-making, team motivation, or something else?",
        actions: [],
      },
      { role: 'user', content: 'I think communication is my weakest area' },
      {
        role: 'assistant',
        content:
          'Communication is one of the most impactful leadership skills to develop. Here are some areas we could explore:\n\n1. **Active listening** — truly hearing your team\n2. **Giving feedback** — constructive and timely\n3. **Presenting ideas** — clarity and confidence\n\nWhich of these resonates most with you?',
        actions: [],
      },
    ],
  });

  const conv2 = `conv_${hex(8)}`;
  conversations.set(conv2, {
    id: conv2,
    title: 'Stress management strategies',
    status: 'active',
    createdAt: new Date(now - 7 * 86400000).toISOString(),
    lastMessageAt: new Date(now - 2 * 86400000).toISOString(),
    messages: [
      { role: 'user', content: 'My stress has been building up lately' },
      {
        role: 'assistant',
        content:
          "I'm sorry to hear that. Stress can really impact both your well-being and your effectiveness as a leader. Let's work through this together.\n\nFirst, can you tell me — is the stress mainly from work responsibilities, team dynamics, personal factors, or a combination?",
        actions: [],
      },
    ],
  });

  const conv3 = `conv_${hex(8)}`;
  conversations.set(conv3, {
    id: conv3,
    title: 'Team building ideas',
    status: 'active',
    createdAt: new Date(now - 14 * 86400000).toISOString(),
    lastMessageAt: new Date(now - 5 * 86400000).toISOString(),
    messages: [
      { role: 'user', content: 'I need help with team building activities' },
      {
        role: 'assistant',
        content:
          "Team building is essential for creating trust and collaboration. Here are some approaches depending on your team's situation:\n\n- **Remote teams**: Virtual coffee chats, online game sessions\n- **In-office teams**: Lunch-and-learn sessions, creative workshops\n- **Hybrid teams**: Quarterly off-sites, pair programming\n\nWhat does your team setup look like?",
        actions: [],
      },
    ],
  });
}
seedConversations();

export const MOCK_QUICK_REPLIES = {
  en: ['Tell me more', 'What should I try?', 'Give me an example'],
  sv: ['Berätta mer', 'Vad ska jag prova?', 'Ge mig ett exempel'],
};

export const MOCK_CONTENT_ITEMS = [
  {
    id: 'cnt_featured_1',
    contentType: 'text_article',
    category: 'featured',
    status: 'published',
    sortOrder: 1,
    titleEn: 'Welcome to Eve',
    titleSv: 'Välkommen till Eve',
    purpose: 'Introduction to your AI leadership coach',
    lengthMinutes: 3,
    textContentEn: '<h2>Welcome to Eve</h2><p>Eve is your personal AI leadership coach, designed to help you grow as a leader...</p>',
    textContentSv: '<h2>Välkommen till Eve</h2><p>Eve är din personliga AI-ledarskapscoach...</p>',
    coachTopics: ['leadership'],
    coachPriority: 10,
    coachEnabled: true,
    hasContent: true,
  },
  {
    id: 'cnt_featured_2',
    contentType: 'audio_exercise',
    category: 'featured',
    status: 'published',
    sortOrder: 2,
    titleEn: 'Morning Energy Boost',
    titleSv: 'Morgonens energiboost',
    purpose: 'Start your day with intention and focus',
    lengthMinutes: 5,
    audioFileEn: '/audio/morning-energy-en.mp3',
    audioFileSv: '/audio/morning-energy-sv.mp3',
    coachTopics: ['motivation', 'mindfulness'],
    coachPriority: 9,
    coachEnabled: true,
    hasContent: true,
  },
  {
    id: 'cnt_1',
    contentType: 'text_article',
    category: 'leadership',
    status: 'published',
    sortOrder: 1,
    titleEn: 'The Art of Delegation',
    titleSv: 'Konsten att delegera',
    purpose: 'Help leaders understand when and how to delegate effectively',
    lengthMinutes: 8,
    textContentEn:
      '<h2>The Art of Delegation</h2><p>Delegation is a crucial leadership skill that separates good managers from great leaders...</p><h3>When to Delegate</h3><p>Consider delegating when:</p><ul><li>The task helps develop team members</li><li>Someone else can do it better</li><li>It frees you for strategic work</li></ul>',
    textContentSv: '<h2>Konsten att delegera</h2><p>Delegering är en avgörande ledarskapsfärdighet...</p>',
    coachTopics: ['delegation', 'leadership', 'time_management'],
    coachPriority: 8,
    coachEnabled: true,
    hasContent: true,
  },
  {
    id: 'cnt_3',
    contentType: 'video_link',
    category: 'leadership',
    status: 'published',
    sortOrder: 3,
    titleEn: 'Building Psychological Safety',
    titleSv: 'Att bygga psykologisk trygghet',
    purpose: 'Create an environment where team members feel safe to speak up',
    lengthMinutes: 15,
    videoUrl: 'https://www.youtube.com/watch?v=LhoLuui9gX8',
    videoEmbedCode: "<iframe src='https://www.youtube.com/embed/LhoLuui9gX8'></iframe>",
    videoAvailableInEn: true,
    videoAvailableInSv: false,
    coachTopics: ['team_dynamics', 'leadership', 'communication'],
    coachPriority: 6,
    coachEnabled: true,
    hasContent: true,
  },
  {
    id: 'cnt_leadership_3',
    contentType: 'text_article',
    category: 'leadership',
    status: 'published',
    sortOrder: 4,
    titleEn: 'Giving Effective Feedback',
    titleSv: 'Att ge effektiv feedback',
    purpose: 'Learn to deliver feedback that drives growth',
    lengthMinutes: 7,
    textContentEn: '<h2>Giving Effective Feedback</h2><p>Great leaders master the art of feedback...</p>',
    textContentSv: '<h2>Att ge effektiv feedback</h2><p>Stora ledare behärskar konsten att ge feedback...</p>',
    coachTopics: ['communication', 'leadership', 'team_dynamics'],
    coachPriority: 7,
    coachEnabled: true,
    hasContent: true,
  },
  {
    id: 'cnt_breath_1',
    contentType: 'audio_exercise',
    category: 'breath',
    status: 'published',
    sortOrder: 1,
    titleEn: 'Box Breathing',
    titleSv: 'Fyrkants-andning',
    purpose: 'Calm your nervous system with this Navy SEAL technique',
    lengthMinutes: 4,
    audioFileEn: '/audio/box-breathing-en.mp3',
    audioFileSv: '/audio/box-breathing-sv.mp3',
    coachTopics: ['stress', 'mindfulness'],
    coachPriority: 9,
    coachEnabled: true,
    hasContent: true,
  },
  {
    id: 'cnt_breath_2',
    contentType: 'audio_exercise',
    category: 'breath',
    status: 'published',
    sortOrder: 2,
    titleEn: '4-7-8 Relaxation Breath',
    titleSv: '4-7-8 Avslappningsandning',
    purpose: 'A technique to reduce anxiety and promote sleep',
    lengthMinutes: 5,
    audioFileEn: '/audio/478-breath-en.mp3',
    audioFileSv: '/audio/478-breath-sv.mp3',
    coachTopics: ['stress', 'resilience'],
    coachPriority: 8,
    coachEnabled: true,
    hasContent: true,
  },
  {
    id: 'cnt_2',
    contentType: 'audio_exercise',
    category: 'meditation',
    status: 'published',
    sortOrder: 1,
    titleEn: '5-Minute Breathing Reset',
    titleSv: '5-minuters andningsåterställning',
    purpose: 'Quick stress relief through guided breathing',
    lengthMinutes: 5,
    audioFileEn: '/audio/breathing-reset-en.mp3',
    audioFileSv: '/audio/breathing-reset-sv.mp3',
    coachTopics: ['stress', 'mindfulness', 'resilience'],
    coachPriority: 9,
    coachEnabled: true,
    hasContent: true,
  },
  {
    id: 'cnt_meditation_2',
    contentType: 'audio_exercise',
    category: 'meditation',
    status: 'published',
    sortOrder: 2,
    titleEn: 'Body Scan Meditation',
    titleSv: 'Kroppsskanning Meditation',
    purpose: 'Release tension and reconnect with your body',
    lengthMinutes: 10,
    audioFileEn: '/audio/body-scan-en.mp3',
    audioFileSv: '/audio/body-scan-sv.mp3',
    coachTopics: ['mindfulness', 'stress'],
    coachPriority: 7,
    coachEnabled: true,
    hasContent: true,
  },
  {
    id: 'cnt_burnout_1',
    contentType: 'text_article',
    category: 'burnout',
    status: 'published',
    sortOrder: 1,
    titleEn: 'Recognizing Early Signs of Burnout',
    titleSv: 'Att känna igen tidiga tecken på utbrändhet',
    purpose: 'Learn to identify burnout symptoms before they become severe',
    lengthMinutes: 8,
    textContentEn: '<h2>Recognizing Early Signs of Burnout</h2><p>Burnout doesn\'t happen overnight. Here are the warning signs...</p>',
    textContentSv: '<h2>Att känna igen tidiga tecken på utbrändhet</h2><p>Utbrändhet sker inte över en natt...</p>',
    coachTopics: ['burnout', 'stress', 'resilience'],
    coachPriority: 9,
    coachEnabled: true,
    hasContent: true,
  },
  {
    id: 'cnt_burnout_2',
    contentType: 'audio_article',
    category: 'burnout',
    status: 'published',
    sortOrder: 2,
    titleEn: 'Setting Healthy Boundaries',
    titleSv: 'Att sätta hälsosamma gränser',
    purpose: 'Protect your energy by learning to say no',
    lengthMinutes: 12,
    audioFileEn: '/audio/boundaries-en.mp3',
    audioFileSv: '/audio/boundaries-sv.mp3',
    coachTopics: ['burnout', 'time_management'],
    coachPriority: 8,
    coachEnabled: true,
    hasContent: true,
  },
  {
    id: 'cnt_wellbeing_1',
    contentType: 'text_article',
    category: 'wellbeing',
    status: 'published',
    sortOrder: 1,
    titleEn: 'Managing Energy Throughout the Day',
    titleSv: 'Att hantera energi under dagen',
    purpose: 'Practical strategies for maintaining focus and energy',
    lengthMinutes: 6,
    textContentEn: '<h2>Managing Energy Throughout the Day</h2><p>Your energy is your most valuable resource...</p>',
    textContentSv: '<h2>Att hantera energi under dagen</h2><p>Din energi är din mest värdefulla resurs...</p>',
    coachTopics: ['motivation', 'time_management'],
    coachPriority: 7,
    coachEnabled: true,
    hasContent: true,
  },
  {
    id: 'cnt_wellbeing_2',
    contentType: 'audio_exercise',
    category: 'wellbeing',
    status: 'published',
    sortOrder: 2,
    titleEn: 'Gratitude Practice',
    titleSv: 'Tacksamhetsövning',
    purpose: 'Build resilience through daily gratitude',
    lengthMinutes: 5,
    audioFileEn: '/audio/gratitude-en.mp3',
    audioFileSv: '/audio/gratitude-sv.mp3',
    coachTopics: ['resilience', 'mindfulness'],
    coachPriority: 6,
    coachEnabled: true,
    hasContent: true,
  },
];

export const bookmarks = new Set();

/** userId -> { contentId -> progress (0-100) } */
export const learningProgress = new Map([['usr_mock123', new Map([['cnt_1', 100], ['cnt_2', 50]])]]);

export const organizations = [
  { id: 'org_1', name: 'Acme Corporation', domain: 'acme.com', memberCount: 45, status: 'active' },
  { id: 'org_2', name: 'TechStart AB', domain: 'techstart.se', memberCount: 12, status: 'active' },
];

export const hubAdmins = [
  { id: 'adm_1', email: 'admin@example.com', addedBy: 'system', addedAt: daysAgo(240) },
];

export const orgAdmins = [
  {
    email: 'john@acme.com',
    name: 'John Doe',
    organizations: [{ id: 'org_1', name: 'Acme Corporation', membershipId: 'mem_1' }],
  },
];

export const coachPrompts = {
  en: {
    'base-coach': 'You are Eve, an AI leadership coach created by Human First AI.',
    'safety-rules': 'Always prioritize user wellbeing.',
    'tone-guidelines': 'Be warm, professional, and supportive.',
  },
  sv: {
    'base-coach': 'Du är Eve, en AI-ledarskapscoach skapad av Human First AI.',
    'safety-rules': 'Prioritera alltid användarens välbefinnande.',
    'tone-guidelines': 'Var varm, professionell och stödjande.',
  },
};

export const coachExercises = [
  { id: 'breathing', nameEn: 'Breathing Exercise', nameSv: 'Andningsövning', duration: 5 },
  { id: 'grounding', nameEn: 'Grounding Exercise', nameSv: 'Jordningsövning', duration: 3 },
];

export let coachDailyExchangeLimit = 15;
export function setCoachDailyExchangeLimit(limit) {
  coachDailyExchangeLimit = limit;
}

export const notifications = [
  {
    id: 'notif_001',
    userId: 'usr_mock123',
    type: 'group_assignment',
    title: 'Assigned to Circle A',
    message: 'You have been assigned to Circle A in the Q1 Leadership pool.',
    metadata: { poolId: 'pool_123', groupId: 'grp_123' },
    read: false,
    readAt: null,
    createdAt: daysAgo(1),
  },
  {
    id: 'notif_002',
    userId: 'usr_mock123',
    type: 'meeting_scheduled',
    title: 'Meeting Scheduled',
    message: 'A new meeting has been scheduled for your circle.',
    metadata: { meetingId: 'mtg_123', groupId: 'grp_123' },
    read: false,
    readAt: null,
    createdAt: daysAgo(2),
  },
  {
    id: 'notif_003',
    userId: 'usr_mock123',
    type: 'invitation',
    title: 'Circle Invitation Accepted',
    message: 'You have joined the Q1 Leadership pool.',
    metadata: { poolId: 'pool_123' },
    read: true,
    readAt: daysAgo(3),
    createdAt: daysAgo(4),
  },
];

export const pendingDeletions = [
  { id: 'usr_del1', email: 'leaving@acme.com', requestedAt: daysAgo(14), scheduledFor: daysFromNow(16) },
];

export const testimonials = {
  en: [
    { id: 't1', name: 'Sara Andersson', role: 'VP Engineering, TechStart', quote: 'Human First AI helped our leadership team build habits that actually stuck.' },
    { id: 't2', name: 'Mikael Johansson', role: 'Head of Product', quote: 'The daily check-ins surfaced burnout risk weeks before it would have hit us.' },
    { id: 't3', name: 'Anna Svensson', role: 'Engineering Manager', quote: 'Eve feels like a coach who actually remembers our last conversation.' },
  ],
  sv: [
    { id: 't1', name: 'Sara Andersson', role: 'VP Engineering, TechStart', quote: 'Human First AI hjälpte vårt ledarteam att bygga vanor som faktiskt höll i sig.' },
    { id: 't2', name: 'Mikael Johansson', role: 'Head of Product', quote: 'De dagliga incheckningarna fångade utbrändhetsrisk veckor innan det hade drabbat oss.' },
    { id: 't3', name: 'Anna Svensson', role: 'Engineering Manager', quote: 'Eve känns som en coach som faktiskt minns vårt senaste samtal.' },
  ],
};
