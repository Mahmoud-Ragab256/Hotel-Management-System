import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Guest, IGuest } from "./../DB/Models/guest.model.js";
import { Employee, IEmployee } from "../DB/Models/employee.model.js";


dotenv.config();


declare global {
  namespace Express {
    interface Request {
      guest?: IGuest;
    }
  }
};

interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  data?: T;
  token?: string;
};

export const protect = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    };

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Please sign-up or login again",
      })
      return;
    };
    let currentUser: IEmployee | IGuest | null;
    const { EmployeeId, guestId, iat } = jwt.verify(token, process.env.SECRET as string) as { EmployeeId: string, guestId: string, iat: number };
    if (guestId) currentUser = await Guest.findById(guestId);
    else if (EmployeeId) currentUser = await Employee.findById(guestId);
    else currentUser = null;

    if (!currentUser) {
      res.status(401).json({
        success: false,
        message: "user doesn't exist",
      });
      return;
    };

    const updatedAtInSec = Math.floor(currentUser.updatedAt.getTime() / 1000);

    if (updatedAtInSec > iat) {
      res.status(401).json({
        success: false,
        message: "please login again",
      });
      return;
    };

    res.locals.user = currentUser;

    next();

  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  };
};

export const allowTo = (...roles: String[]) => {
  return (req: Request, res: Response<ApiResponse>, next: NextFunction): void => {
    if (!roles.includes(res.locals.user.role)) {
      res.status(403).json({
        success: false,
        message: "you don't have access authority to this route",
      });
      return;
    };
    next();
  };
};