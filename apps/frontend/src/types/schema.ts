
export interface UserProp {
  _id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  provider: "Email" | "Google";
}
