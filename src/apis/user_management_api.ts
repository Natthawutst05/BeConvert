import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8011';

export async function updateUser(userId: number, userData: { userName: string; userRole: string; userEmail: string }) {
  try {
    const response = await axios.put(`${API_BASE_URL}/users/update/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    return { ok: false, message: error.message || "Failed to update user" };
  }
}

export async function deleteUser(userId: number) {
  try {
    const response = await axios.delete(`${API_BASE_URL}/users/delete/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting user:", error);
    return { ok: false, message: error.message || "Failed to delete user" };
  }
}
