import api from "./axiosConfig";

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  provider: string;
  mobileNumber: string | null;
  address: string | null;
}

export interface UpdateProfileRequest {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
  mobileNumber?: string;
  address?: string;
}

export const userApi = {
  getProfile: () => api.get<UserProfile>("/user/profile").then((r) => r.data),

  updateProfile: (req: UpdateProfileRequest) =>
    api.put<UserProfile>("/user/profile", req).then((r) => r.data),
};
