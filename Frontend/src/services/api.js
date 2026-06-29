import axios from "axios";

import { getAuthToken } from "./auth.js";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://hotel-management-system-sigma-ruby.vercel.app",
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const readArray = (response, key) => response?.data?.data?.[key] || [];
const readObject = (response, key) => response?.data?.data?.[key] || null;

export const getApiErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Unexpected error while connecting to the backend."
  );
};

export const dashboardApi = {
  async login(payload) {
    const response = await api.post("/dashboard/auth/login", payload);
    return {
      token: response?.data?.token || "",
      user: response?.data?.data || null,
    };
  },

  async getBookings() {
    const response = await api.get("/dashboard/bookings");
    return readArray(response, "bookings");
  },

  async getBooking(id) {
    const response = await api.get(`/dashboard/bookings/${id}`);
    return readObject(response, "booking");
  },

  async createBooking(payload) {
    const response = await api.post("/dashboard/bookings", payload);
    return readObject(response, "booking");
  },

  async updateBooking(id, payload) {
    const response = await api.put(`/dashboard/bookings/${id}`, payload);
    return readObject(response, "booking");
  },

  async cancelBooking(id, cancelReason) {
    const response = await api.put(`/dashboard/bookings/${id}/cancel`, {
      cancelReason,
    });
    return readObject(response, "booking");
  },

  async deleteBooking(id) {
    const response = await api.delete(`/dashboard/bookings/${id}`);
    return response.data;
  },

  async getRooms() {
    const response = await api.get("/dashboard/rooms");
    return readArray(response, "rooms");
  },

  async getAvailableRooms() {
    const response = await api.get("/dashboard/rooms/available");
    return readArray(response, "rooms");
  },

  async getRoom(id) {
    const response = await api.get(`/dashboard/rooms/${id}`);
    return readObject(response, "room");
  },

  async createRoom(payload) {
    const response = await api.post("/dashboard/rooms", payload);
    return readObject(response, "room");
  },

  async updateRoom(id, payload) {
    const response = await api.put(`/dashboard/rooms/${id}`, payload);
    return readObject(response, "room");
  },

  async uploadRoomImages(id, files) {
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("images", file));

    const response = await api.put(`/dashboard/rooms/${id}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  },

  async getRoomImages(id) {
    const response = await api.get(`/dashboard/rooms/${id}/images`);
    return response?.data?.data || [];
  },

  async deleteRoom(id) {
    const response = await api.delete(`/dashboard/rooms/${id}`);
    return response.data;
  },

  async getRoomCategories() {
    const response = await api.get("/dashboard/room-categories");
    return readArray(response, "categories");
  },

  async getRoomCategory(id) {
    const response = await api.get(`/dashboard/room-categories/${id}`);
    return readObject(response, "category");
  },

  async createRoomCategory(payload) {
    const response = await api.post("/dashboard/room-categories", payload);
    return readObject(response, "category");
  },

  async updateRoomCategory(id, payload) {
    const response = await api.put(`/dashboard/room-categories/${id}`, payload);
    return readObject(response, "category");
  },

  async deleteRoomCategory(id) {
    const response = await api.delete(`/dashboard/room-categories/${id}`);
    return response.data;
  },

  async getGuests() {
    const response = await api.get("/dashboard/guests");
    return readArray(response, "guests");
  },

  async getGuest(id) {
    const response = await api.get(`/dashboard/guests/${id}`);
    return readObject(response, "guest");
  },

  async createGuest(payload) {
    const response = await api.post("/dashboard/guests/register", payload);
    return response?.data?.data?.guest || null;
  },

  async updateGuest(id, payload) {
    const response = await api.put(`/dashboard/guests/${id}`, payload);
    return readObject(response, "guest");
  },

  async deleteGuest(id) {
    const response = await api.delete(`/dashboard/guests/${id}`);
    return response.data;
  },

  async getEmployees() {
    const response = await api.get("/dashboard/employees");
    return readArray(response, "employees");
  },

  async getEmployee(id) {
    const response = await api.get(`/dashboard/employees/${id}`);
    return readObject(response, "employee");
  },

  async createEmployee(payload) {
    const response = await api.post("/dashboard/employees/register", payload);
    return response?.data?.data || null;
  },

  async updateEmployee(id, payload, avatarFile) {
    if (avatarFile) {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "")
          formData.append(key, value);
      });
      formData.append("avatar", avatarFile);

      const response = await api.put(`/dashboard/employees/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return readObject(response, "employee");
    }

    const response = await api.put(`/dashboard/employees/${id}`, payload);
    return readObject(response, "employee");
  },

  async getEmployeeAvatar(id) {
    const response = await api.get(`/dashboard/employees/${id}/avatar`);
    return response?.data?.data || null;
  },

  async deleteEmployee(id) {
    const response = await api.delete(`/dashboard/employees/${id}`);
    return response.data;
  },

  async getInvoices() {
    const response = await api.get("/dashboard/invoices");
    return readArray(response, "invoices");
  },

  async getInvoice(id) {
    const response = await api.get(`/dashboard/invoices/${id}`);
    return readObject(response, "invoice");
  },

  async updateInvoice(id, payload) {
    const response = await api.put(`/dashboard/invoices/${id}`, payload);
    return readObject(response, "invoice");
  },

  async deleteInvoice(id) {
    const response = await api.delete(`/dashboard/invoices/${id}`);
    return response.data;
  },
  async getDashboardStats() {
    const response = await api.get("/dashboard/stats");
    return response?.data?.data || null;
  },

  async getServices() {
    const response = await api.get("/dashboard/services");
    return readArray(response, "services");
  },
  async getService(id) {
    const response = await api.get(`/dashboard/services/${id}`);
    return readObject(response, "service");
  },
  async createService(payload) {
    const response = await api.post("/dashboard/services", payload);
    return readObject(response, "service");
  },
  async updateService(id, payload) {
    const response = await api.put(`/dashboard/services/${id}`, payload);
    return readObject(response, "service");
  },
  async deleteService(id) {
    const response = await api.delete(`/dashboard/services/${id}`);
    return response.data;
  },

  async guestRegister(payload) {
    const response = await api.post("/client/auth/register", payload);
    return {
      token: response?.data?.token || "",
      user: response?.data?.data || null,
    };
  },

  async guestLogin(payload) {
    const response = await api.post("/client/auth/login", payload);
    return {
      token: response?.data?.token || "",
      user: response?.data?.data || null,
    };
  },

  async getLandingData() {
    const response = await api.get("/client/landing");
    return response?.data?.data || null;
  },

  async getLandingStatistics() {
    const response = await api.get("/client/landing/statistics");
    return response?.data?.data || null;
  },

  async getFeaturedCategories() {
    const response = await api.get('/client/featured-categories');
    return response.data.data;
  },

  /**
   * Fetch available suites dynamically based on search criteria after clicking "Check Availability"
   * Endpoint: POST /client/rooms/available (Maps according to the project context client routes layout)
   */
  async fetchAvailableSuites(bookingDetails) {
    const response = await api.post("/client/rooms/available", {
      checkIn: bookingDetails.checkIn,
      checkOut: bookingDetails.checkOut,
      guests: Number(bookingDetails.guests),
    });
    return response?.data?.data || [];
  },
  
  async getMe() {
    const response = await api.get(`client/me`);
    return readObject(response, "guest");
  },

  async updateMe(payload) {
    const response = await api.put(`client/me`, payload);
    return readObject(response, "guest");
  },

  async getMyBookings() {
    const response = await api.get(`client/me/bookings`);
    return readObject(response, "bookings");
  },

  async getMyReviews() {
    const response = await api.get(`client/me/reviews`);
    return readObject(response, "reviews");
  },

  async getProfileImage() {
    const response = await api.get(`client/me/avatar`);
    return readObject(response, "avatar");
  },

  async updateProfileImage(formData) {
    const response = await api.put(`client/me/avatar`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return readObject(response, "avatar");
  },

  async removeProfileImage() {
    const response = await api.delete(`client/me/avatar`);
    return readObject(response, "avatar");
  },

  async changePassword({ currentPassword, newPassword, confirmPassword }) {
    const response = await api.put(`client/me/change-password`, {
      currentPassword,
      newPassword,
      confirmPassword,
    });
    return readObject(response, "password");
  },

  async getAllReviews() {
    const response = await api.get("/dashboard/reviews");
    return readArray(response, "reviews");
  },
  async getReviewById(id) {
    const response = await api.get(`/dashboard/reviews/${id}`);
    return readObject(response, "review");
  },
  async updateReview(id, payload) {
    const response = await api.put(`/dashboard/reviews/${id}`, payload);
    return readObject(response, "review");
  },
  async approveReview(id) {
    const response = await api.put(`/dashboard/reviews/${id}/approve`);
    return readObject(response, "review");
  },
  async deleteReview(id) {
    const response = await api.delete(`/dashboard/reviews/${id}`);
    return response.data;
  },
};

export default api;