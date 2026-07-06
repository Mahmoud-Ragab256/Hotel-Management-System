import { Request, Response } from 'express';
import cloudinary from '../../../utils/cloudinary.js';
import { Service } from '../../../DB/Models/service.model.js';
import { IService, ServiceCategory } from '../../../DB/Models/service.model.js';

interface CreateServiceBody {
  name: string;
  description?: string;
  details?: string;
  category: ServiceCategory;
  price: number | string;
  isAvailable?: boolean | string;
  maxCapacity?: number | string;
  images?: string[] | string;
}

interface UpdateServiceBody {
  name?: string;
  description?: string;
  details?: string;
  category?: ServiceCategory;
  price?: number | string;
  isAvailable?: boolean | string;
  maxCapacity?: number | string;
  images?: string[] | string;
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

interface CloudinaryUploadedFile extends Express.Multer.File {
  path: string;
  filename: string;
}

type ServicePayload = Partial<{
  name: string;
  description: string;
  details: string;
  category: ServiceCategory;
  price: number;
  isAvailable: boolean;
  maxCapacity: number;
  images: string[];
  imagePublicIds: string[];
}>;

const serviceSelectWithPrivateFields = '+imagePublicIds';

const parseNumber = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseBoolean = (value: unknown): boolean | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  const normalized = String(value).trim().toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
  if (['false', '0', 'no', 'off'].includes(normalized)) return false;
  return undefined;
};

const parseStringArray = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed)) return parsed.map((item) => String(item).trim()).filter(Boolean);
    } catch {
      // Use comma-separated fallback below.
    }

    return trimmed.split(',').map((item) => item.trim()).filter(Boolean);
  }

  return [];
};

const getUploadedFiles = (req: Request): CloudinaryUploadedFile[] => {
  const files = req.files;
  if (!files) return [];
  if (Array.isArray(files)) return files as CloudinaryUploadedFile[];
  return Object.values(files).flat() as CloudinaryUploadedFile[];
};

const getPublicIdsFromUrls = (urls: string[] = []): string[] => {
  return urls
    .map((url) => {
      if (!url || !url.includes('/services/')) return '';
      const publicPart = url.split('/upload/')[1];
      if (!publicPart) return '';
      const withoutVersion = publicPart.replace(/^v\d+\//, '');
      return withoutVersion.replace(/\.[^/.]+$/, '');
    })
    .filter(Boolean);
};

const getStoredPublicIds = (service: IService | null): string[] => {
  if (!service) return [];
  if (Array.isArray(service.imagePublicIds) && service.imagePublicIds.length) {
    return service.imagePublicIds;
  }
  return getPublicIdsFromUrls(service.images || []);
};

const deleteCloudinaryImages = async (publicIds: string[] = []): Promise<void> => {
  const uniqueIds = Array.from(new Set(publicIds.filter(Boolean)));
  if (!uniqueIds.length) return;

  await Promise.allSettled(uniqueIds.map((publicId) => cloudinary.uploader.destroy(publicId)));
};

const buildPayload = (body: CreateServiceBody | UpdateServiceBody, uploadedFiles: CloudinaryUploadedFile[] = []): ServicePayload => {
  const payload: ServicePayload = {};

  if (body.name !== undefined) payload.name = String(body.name).trim();
  if (body.description !== undefined) payload.description = String(body.description).trim();
  if (body.details !== undefined) payload.details = String(body.details).trim();
  if (body.category !== undefined) payload.category = body.category;

  const price = parseNumber(body.price);
  if (price !== undefined) payload.price = price;

  const maxCapacity = parseNumber(body.maxCapacity);
  if (maxCapacity !== undefined) payload.maxCapacity = Math.max(1, maxCapacity);

  const isAvailable = parseBoolean(body.isAvailable);
  if (isAvailable !== undefined) payload.isAvailable = isAvailable;

  if (uploadedFiles.length) {
    payload.images = uploadedFiles.map((file) => file.path).filter(Boolean);
    payload.imagePublicIds = uploadedFiles.map((file) => file.filename).filter(Boolean);
  } else if (body.images !== undefined) {
    const images = parseStringArray(body.images);
    payload.images = images;
    payload.imagePublicIds = getPublicIdsFromUrls(images);
  }

  return payload;
};

const sendError = <T>(res: Response<ApiResponse<T>>, error: unknown, fallbackMessage: string): void => {
  const err = error as Error & { name?: string; statusCode?: number };
  const isClientError = err.name === 'ValidationError' || err.name === 'CastError';

  res.status(err.statusCode || (isClientError ? 400 : 500)).json({
    success: false,
    message: err.message || fallbackMessage,
  });
};

export const getAllServices = async (
  req: Request,
  res: Response<ApiResponse<ServicesData>>
): Promise<void> => {
  try {
    const services: IService[] = await Service.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: services.length,
      data: { services },
    });
  } catch (error) {
    sendError(res, error, 'Could not read services');
  }
};

export const getServiceById = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<ServiceData>>
): Promise<void> => {
  try {
    const service: IService | null = await Service.findById(req.params.id).select(serviceSelectWithPrivateFields);

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
    sendError(res, error, 'Could not read service');
  }
};

export const getAvailableServices = async (
  req: Request,
  res: Response<ApiResponse<ServicesData>>
): Promise<void> => {
  try {
    const services: IService[] = await Service.find({ isAvailable: true }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: services.length,
      data: { services },
    });
  } catch (error) {
    sendError(res, error, 'Could not read available services');
  }
};

export const createService = async (
  req: Request<{}, ApiResponse<ServiceData>, CreateServiceBody>,
  res: Response<ApiResponse<ServiceData>>
): Promise<void> => {
  const uploadedFiles = getUploadedFiles(req);

  try {
    const payload = buildPayload(req.body, uploadedFiles);
    const service: IService = await Service.create(payload);

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: { service },
    });
  } catch (error) {
    await deleteCloudinaryImages(uploadedFiles.map((file) => file.filename));
    sendError(res, error, 'Could not create service');
  }
};

export const updateService = async (
  req: Request<{ id: string }, ApiResponse<ServiceData>, UpdateServiceBody>,
  res: Response<ApiResponse<ServiceData>>
): Promise<void> => {
  try {
    const payload = buildPayload(req.body);

    if (!Object.keys(payload).length) {
      const existingService: IService | null = await Service.findById(req.params.id).select(serviceSelectWithPrivateFields);

      if (!existingService) {
        res.status(404).json({
          success: false,
          message: 'Service not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'No service changes were sent',
        data: { service: existingService },
      });
      return;
    }

    const service: IService | null = await Service.findByIdAndUpdate(
      req.params.id,
      { $set: payload },
      { new: true, runValidators: true }
    ).select(serviceSelectWithPrivateFields);

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
    sendError(res, error, 'Could not update service');
  }
};

export const updateServiceImages = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<ServiceData>>
): Promise<void> => {
  const uploadedFiles = getUploadedFiles(req);

  try {
    if (!uploadedFiles.length) {
      res.status(400).json({
        success: false,
        message: 'Please upload at least one service image',
      });
      return;
    }

    const oldService: IService | null = await Service.findById(req.params.id).select(serviceSelectWithPrivateFields);

    if (!oldService) {
      await deleteCloudinaryImages(uploadedFiles.map((file) => file.filename));
      res.status(404).json({
        success: false,
        message: 'Service not found',
      });
      return;
    }

    const oldPublicIds = getStoredPublicIds(oldService);
    const payload = buildPayload({}, uploadedFiles);

    const service: IService | null = await Service.findByIdAndUpdate(
      req.params.id,
      { $set: payload },
      { new: true, runValidators: true }
    ).select(serviceSelectWithPrivateFields);

    if (!service) {
      await deleteCloudinaryImages(uploadedFiles.map((file) => file.filename));
      res.status(404).json({
        success: false,
        message: 'Service not found',
      });
      return;
    }

    await deleteCloudinaryImages(oldPublicIds);

    res.status(200).json({
      success: true,
      message: 'Service images updated successfully',
      data: { service },
    });
  } catch (error) {
    await deleteCloudinaryImages(uploadedFiles.map((file) => file.filename));
    sendError(res, error, 'Could not update service images');
  }
};

export const deleteService = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const service: IService | null = await Service.findById(req.params.id).select(serviceSelectWithPrivateFields);

    if (!service) {
      res.status(404).json({
        success: false,
        message: 'Service not found',
      });
      return;
    }

    await Service.findByIdAndDelete(req.params.id);
    await deleteCloudinaryImages(getStoredPublicIds(service));

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error) {
    sendError(res, error, 'Could not delete service');
  }
};
