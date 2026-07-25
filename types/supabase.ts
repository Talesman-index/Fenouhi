export type AccountType = "individual" | "reseller" | "business";

export type UserRole = "customer" | "agent" | "logistics" | "admin" | "super_admin";

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  country: string | null;
  city: string | null;
  account_type: AccountType;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, "id">>;
      };
    };
    Enums: {
      account_type: AccountType;
      user_role: UserRole;
    };
  };
};
