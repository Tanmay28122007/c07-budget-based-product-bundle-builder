export interface UserAccount {
  userId: string;
  userName: string;
  email: string;
  role: 'admin' | 'customer';
  registeredAt: string;
  status: 'Active' | 'Inactive';
}

export interface UserSignInRecord {
  id: string;
  userId: string;
  userName: string;
  email: string;
  role: 'admin' | 'customer';
  signInTimestamp: string; // ISO
  lastActiveTimestamp: string; // ISO
  accountStatus: 'Active' | 'Inactive';
}

const REGISTERED_USERS_KEY = 'c07_registered_users_v2';
const SIGN_IN_RECORDS_KEY = 'c07_user_sign_ins_v2';

// Seeded registered platform accounts
export const DEFAULT_REGISTERED_USERS: UserAccount[] = [
  {
    userId: 'USR-001',
    userName: 'Tanmay Anand',
    email: 'tanmay.anand@craftbundle.io',
    role: 'customer',
    registeredAt: '2026-03-15T09:00:00.000Z',
    status: 'Active'
  },
  {
    userId: 'ADM-001',
    userName: 'Lead Administrator',
    email: 'admin@workspace.com',
    role: 'admin',
    registeredAt: '2026-01-10T08:30:00.000Z',
    status: 'Active'
  },
  {
    userId: 'USR-002',
    userName: 'Rahul Sharma',
    email: 'rahul.sharma@workspace.com',
    role: 'customer',
    registeredAt: '2026-04-12T11:20:00.000Z',
    status: 'Active'
  },
  {
    userId: 'USR-003',
    userName: 'Priya Patel',
    email: 'priya.patel@workspace.com',
    role: 'customer',
    registeredAt: '2026-06-20T14:45:00.000Z',
    status: 'Inactive'
  },
  {
    userId: 'USR-004',
    userName: 'Amit Verma',
    email: 'amit.verma@workspace.com',
    role: 'customer',
    registeredAt: '2026-08-05T16:15:00.000Z',
    status: 'Inactive'
  }
];

/**
 * Returns all registered users from storage or default list.
 */
export function getRegisteredUsers(): UserAccount[] {
  try {
    if (typeof localStorage !== 'undefined') {
      const data = localStorage.getItem(REGISTERED_USERS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch {}
  return DEFAULT_REGISTERED_USERS;
}

/**
 * Saves or updates a registered user.
 */
export function registerOrUpdateUser(account: Omit<UserAccount, 'registeredAt'> & { registeredAt?: string }): UserAccount {
  const users = getRegisteredUsers();
  const existingIdx = users.findIndex(u => u.email.toLowerCase() === account.email.toLowerCase() || u.userId === account.userId);

  const completeAccount: UserAccount = {
    userId: account.userId || `USR-${String(users.length + 1).padStart(3, '0')}`,
    userName: account.userName,
    email: account.email,
    role: account.role,
    registeredAt: account.registeredAt || new Date().toISOString(),
    status: account.status || 'Active'
  };

  let updatedUsers: UserAccount[];
  if (existingIdx >= 0) {
    updatedUsers = [...users];
    updatedUsers[existingIdx] = { ...users[existingIdx], ...completeAccount };
  } else {
    updatedUsers = [completeAccount, ...users];
  }

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updatedUsers));
    }
  } catch {}

  return completeAccount;
}

/**
 * Returns all recorded sign-in events.
 */
export function getSignInRecords(): UserSignInRecord[] {
  try {
    if (typeof localStorage !== 'undefined') {
      const data = localStorage.getItem(SIGN_IN_RECORDS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    }
  } catch {}

  // Initial seed of recent recorded sign-ins
  const now = new Date();
  const todayMorning = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 42).toISOString();
  const todayEarlier = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 30).toISOString();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  return [
    {
      id: 'REC-LOG-01',
      userId: 'USR-002',
      userName: 'Rahul Sharma',
      email: 'rahul.sharma@workspace.com',
      role: 'customer',
      signInTimestamp: todayMorning,
      lastActiveTimestamp: todayMorning,
      accountStatus: 'Active'
    },
    {
      id: 'REC-LOG-02',
      userId: 'USR-003',
      userName: 'Priya Patel',
      email: 'priya.patel@workspace.com',
      role: 'customer',
      signInTimestamp: todayEarlier,
      lastActiveTimestamp: todayEarlier,
      accountStatus: 'Inactive'
    },
    {
      id: 'REC-LOG-03',
      userId: 'USR-004',
      userName: 'Amit Verma',
      email: 'amit.verma@workspace.com',
      role: 'customer',
      signInTimestamp: yesterday,
      lastActiveTimestamp: yesterday,
      accountStatus: 'Inactive'
    }
  ];
}

/**
 * Records a successful sign-in event.
 * Never stores or exposes passwords or sensitive tokens.
 */
export function recordUserSignIn(
  email: string,
  name?: string,
  role: 'admin' | 'customer' = 'customer'
): UserSignInRecord {
  const users = getRegisteredUsers();
  let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    // Auto-register new visitor
    user = registerOrUpdateUser({
      userId: role === 'admin' ? `ADM-${Math.floor(100 + Math.random() * 900)}` : `USR-${Math.floor(100 + Math.random() * 900)}`,
      userName: name || (role === 'admin' ? 'Administrator' : email.split('@')[0]),
      email,
      role,
      status: 'Active'
    });
  }

  const nowIso = new Date().toISOString();
  const record: UserSignInRecord = {
    id: `SIGNIN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId: user.userId,
    userName: user.userName,
    email: user.email,
    role: user.role,
    signInTimestamp: nowIso,
    lastActiveTimestamp: nowIso,
    accountStatus: 'Active'
  };

  const existing = getSignInRecords();
  // Keep up to 200 records
  const updated = [record, ...existing].slice(0, 200);

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SIGN_IN_RECORDS_KEY, JSON.stringify(updated));
    }
  } catch {}

  return record;
}

/**
 * Formats a date in Asia/Kolkata timezone (e.g., "18 Oct 2026").
 */
export function formatKolkataDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return '—';
  }
}

/**
 * Formats a time in Asia/Kolkata timezone (e.g., "09:42 AM").
 */
export function formatKolkataTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return '—';
  }
}

/**
 * Formats relative or last active time in Asia/Kolkata.
 */
export function formatLastActive(isoString: string): string {
  try {
    const d = new Date(isoString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return formatKolkataDate(isoString);
  } catch {
    return '—';
  }
}

/**
 * Counts how many sign-in events occurred during the current day (in Asia/Kolkata timezone).
 */
export function countTodaySignIns(records: UserSignInRecord[]): number {
  const todayStr = formatKolkataDate(new Date().toISOString());
  return records.filter(r => formatKolkataDate(r.signInTimestamp) === todayStr).length;
}
