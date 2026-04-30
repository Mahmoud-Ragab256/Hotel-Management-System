import { Request, Response } from 'express';
import { Invoice } from '../../../DB/Models/invoice.model.js';
import { IInvoice, InvoiceStatus, PaymentMethod } from '../../../DB/Models/invoice.model.js';
import { Types } from 'mongoose';


interface CreateInvoiceBody {
  bookingId: Types.ObjectId;
  employeeId?: Types.ObjectId;
  totalAmount: number;
  paidAmount?: number;
  status?: InvoiceStatus;
  method: PaymentMethod;
  attachments?: string[];
}

interface UpdateInvoiceBody {
  employeeId?: Types.ObjectId;
  totalAmount?: number;
  paidAmount?: number;
  status?: InvoiceStatus;
  method?: PaymentMethod;
  attachments?: string[];
}


interface InvoicesData {
  invoices: IInvoice[];
}

interface InvoiceData {
  invoice: IInvoice;
}


interface ApiResponse<T = null> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}


export const getAllInvoices = async (
  req: Request,
  res: Response<ApiResponse<InvoicesData>>
): Promise<void> => {
  try {
    const invoices: IInvoice[] = await Invoice.find()
      .populate('bookingId')
      .populate('employeeId', 'fullName role');

    res.status(200).json({
      success: true,
      count: invoices.length,
      data: { invoices },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const getInvoiceById = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse<InvoiceData>>
): Promise<void> => {
  try {
    const invoice: IInvoice | null = await Invoice.findById(req.params.id)
      .populate('bookingId')
      .populate('employeeId');

    if (!invoice) {
      res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { invoice },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const getInvoiceByBookingId = async (
  req: Request<{ bookingId: string }>,
  res: Response<ApiResponse<InvoiceData>>
): Promise<void> => {
  try {
    const invoice: IInvoice | null = await Invoice.findOne({
      bookingId: req.params.bookingId,
    })
      .populate('bookingId')
      .populate('employeeId');

    if (!invoice) {
      res.status(404).json({
        success: false,
        message: 'Invoice not found for this booking',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { invoice },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const createInvoice = async (
  req: Request<{}, ApiResponse<InvoiceData>, CreateInvoiceBody>,
  res: Response<ApiResponse<InvoiceData>>
): Promise<void> => {
  try {
    const invoice: IInvoice = await Invoice.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: { invoice },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const updateInvoice = async (
  req: Request<{ id: string }, ApiResponse<InvoiceData>, UpdateInvoiceBody>,
  res: Response<ApiResponse<InvoiceData>>
): Promise<void> => {
  try {
    const invoice: IInvoice | null = await Invoice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!invoice) {
      res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Invoice updated successfully',
      data: { invoice },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


export const deleteInvoice = async (
  req: Request<{ id: string }>,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const invoice: IInvoice | null = await Invoice.findByIdAndDelete(req.params.id);

    if (!invoice) {
      res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Invoice deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};