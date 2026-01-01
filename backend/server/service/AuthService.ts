import type { LoginRequest, LoginResponse } from "@app/shared/types";
import UserRepository from "@/repository/UserRepository";
import * as argon2 from "argon2";
import type { ServiceError } from "@/common/errors";
import type { Result } from "@/common/type";

type AuthService = {
  login: (req: LoginRequest) => Promise<Result<LoginResponse, ServiceError>>;
  logout: (token: string) => Promise<Result<null, ServiceError>>;
  refresh: (token: string) => Promise<Result<LoginResponse, ServiceError>>;
};
