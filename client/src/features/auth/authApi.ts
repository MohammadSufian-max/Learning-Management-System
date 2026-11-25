
import api from "../../api/axios";

export interface LoginUser {
  id: number;
  fullName: string;
  email: string;
  role: "admin" | "instructor" | "student";
  status: "active" | "inactive";
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    user: LoginUser;
  };
}

export const loginUser = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/auth/login", {
    email,
    password,
  });

  return response.data;
};
