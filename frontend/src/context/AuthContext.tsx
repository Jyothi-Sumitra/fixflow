import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'resident' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  block?: string;
  room?: string;
  unit?: string;
  email?: string;
  title?: string;
}

// Authorized resident roster registry for the facility
export const AUTHORIZED_RESIDENT_UNITS = [
  { block: 'Block A', rooms: ['101', '102', '103', '104', '201', '202', '203', '204', '301', '302'] },
  { block: 'Block B', rooms: ['101', '102', '103', '104', '201', '202', '203', '204', '301', '302', '304'] },
  { block: 'Block C', rooms: ['101', '102', '103', '201', '202', '203', '301', '302', '310'] },
  { block: 'Block D', rooms: ['101', '102', '201', '202', '301', '302'] },
];

const DEFAULT_RESIDENT_PIN = '1234';

const ADMIN_CREDENTIALS = {
  email: 'admin@fixflow.internal',
  passcode: 'admin123',
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loginResident: (block: string, room: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  loginAdmin: (email: string, passcode: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const STORAGE_KEY = 'fixflow_auth_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to sync auth state to localStorage', e);
    }
  }, [user]);

  // Resident Login: Uses Block + Room Number + Resident PIN
  const loginResident = async (
    block: string,
    room: string,
    pin: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanBlock = block.trim();
    const cleanRoom = room.trim();
    const cleanPin = pin.trim();

    if (!cleanBlock || !cleanRoom) {
      return { success: false, error: 'Please specify both Block and Room number.' };
    }

    // Verify room against facility resident registry
    const blockRoster = AUTHORIZED_RESIDENT_UNITS.find(
      (b) => b.block.toLowerCase() === cleanBlock.toLowerCase()
    );

    if (!blockRoster) {
      return {
        success: false,
        error: `Invalid block. Authorized campus blocks are: ${AUTHORIZED_RESIDENT_UNITS.map((b) => b.block).join(', ')}.`,
      };
    }

    const isRoomRegistered = blockRoster.rooms.includes(cleanRoom);
    if (!isRoomRegistered) {
      return {
        success: false,
        error: `Room ${cleanRoom} is not registered in ${blockRoster.block}'s authorized resident directory.`,
      };
    }

    if (cleanPin !== DEFAULT_RESIDENT_PIN && cleanPin.length < 4) {
      return {
        success: false,
        error: 'Invalid resident PIN. Default campus PIN is 1234.',
      };
    }

    const residentUser: User = {
      id: `res_${cleanBlock.replace(/\s+/g, '')}_${cleanRoom}`,
      name: `${blockRoster.block}, Room ${cleanRoom}`,
      role: 'resident',
      block: blockRoster.block,
      room: cleanRoom,
      unit: `${blockRoster.block}, Room ${cleanRoom}`,
      title: 'Verified Resident',
    };

    setUser(residentUser);
    return { success: true };
  };

  // Staff Admin Login: Uses Staff Work Email + Security Passcode
  const loginAdmin = async (
    email: string,
    passcode: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPasscode = passcode.trim();

    const isValidAdminEmail =
      cleanEmail === ADMIN_CREDENTIALS.email || cleanEmail.endsWith('@fixflow.internal');
    const isValidAdminPass = cleanPasscode === ADMIN_CREDENTIALS.passcode;

    if (!isValidAdminEmail || !isValidAdminPass) {
      return {
        success: false,
        error: 'Unauthorized staff credentials or invalid security passcode.',
      };
    }

    const adminUser: User = {
      id: 'adm_001',
      name: 'Marcus Vance',
      email: cleanEmail,
      role: 'admin',
      title: 'Facilities Operations Director',
    };

    setUser(adminUser);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loginResident,
        loginAdmin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
