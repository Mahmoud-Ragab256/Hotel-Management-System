import { Request, Response } from 'express';
import { Service } from '../../../DB/Models/service.model.js';
import { IService, ServiceCategory } from '../../../DB/Models/service.model.js';


interface CreateServiceBody {
  name: string;
  category: ServiceCategory;
  price: number;
  isAvailable?: boolean;
  maxCapacity?: number;
  images?: string[];
}

interface UpdateServiceBody {
  name?: string;
  category?: ServiceCategory;
  price?: number;
  isAvailable?: boolean;
  maxCapacity?: number;
  images?: string[];
}


interface ServicesData {
  services: IService[];
}

interface ServiceData {
  service: IService;
}


interface ApiResponse<T = null> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}


export const getAllServices = async (
  req: Request,
  res: Response<ApiResponse<ServicesData>>
): Promise<void> => {
  try {
    const services: IService[] = await Service.find();

    res.status(200).json({
      success: true,
      count: services.length,
      data: { services },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const getServiceById = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<ServiceData>>
): Promise<void> => {
  try {
    const service: IService | null = await Service.findById(req.params.id);

    if (!service) {
      res.status(404).json({
        success: false,
        message: 'Service not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { service },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const getAvailableServices = async (
  req: Request,
  res: Response<ApiResponse<ServicesData>>
): Promise<void> => {
  try {
    const services: IService[] = await Service.find({ isAvailable: true });

    res.status(200).json({
      success: true,
      count: services.length,
      data: { services },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const createService = async (
  req: Request<{}, ApiResponse<ServiceData>, CreateServiceBody>,
  res: Response<ApiResponse<ServiceData>>
): Promise<void> => {
  try {
    const service: IService = await Service.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: { service },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const updateService = async (
  req: Request<{ id: string }, ApiResponse<ServiceData>, UpdateServiceBody>,
  res: Response<ApiResponse<ServiceData>>
): Promise<void> => {
  try {
    const service: IService | null = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!service) {
      res.status(404).json({
        success: false,
        message: 'Service not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: { service },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const deleteService = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const service: IService | null = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      res.status(404).json({
        success: false,
        message: 'Service not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};