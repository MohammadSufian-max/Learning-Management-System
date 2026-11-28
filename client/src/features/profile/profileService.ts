import api from "../../api/axios";

export interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  mobileNumber: string;
  role: string;
  status: string;
  profileImage: string | null;
}

export interface UpdateProfileData {
  fullName: string;
  mobileNumber: string;
}

export const getMyProfile = async (): Promise<UserProfile> => {
  const response = await api.get("/users/me");
  return response.data.data;
};

export const updateMyProfile = async (
  data: UpdateProfileData
): Promise<UserProfile> => {
  const response = await api.put("/users/me", data);
  return response.data.data;
};

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const changeMyPassword = async (
  data: ChangePasswordData
) => {
  const response = await api.patch(
    "/users/me/change-password",
    data
  );

  return response.data;
};

