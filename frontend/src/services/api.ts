import { courses as dummyCourses, type Course } from "@/data/courses";

export const API_BASE = "http://127.0.0.1:8000/api";

// ================= HELPER =================

function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

// ================= ADMIN ANALYTICS =================

export async function getAdminStats() {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE}/admin/dashboard/`, {
    headers: { Authorization: `Token ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch admin stats");
  return response.json();
}

export async function getAdminStudents() {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE}/admin/students/`, {
    headers: { Authorization: `Token ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch students");
  return response.json();
}

export async function getAdminPayments() {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE}/admin/payments/`, {
    headers: { Authorization: `Token ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch payments");
  return response.json();
}

// ================= ADMIN LESSONS =================

export async function getAdminLessons(courseId: string | number) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE}/admin/lessons/?course_id=${courseId}`, {
    headers: { Authorization: `Token ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch lessons");
  return response.json();
}

export async function createLesson(payload: any) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE}/admin/lessons/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));
  return data;
}

export async function updateLesson(id: number | string, payload: any) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE}/admin/lessons/${id}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));
  return data;
}

export async function deleteLesson(id: number | string) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE}/admin/lessons/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Token ${token}`,
    },
  });
  if (!response.ok) throw new Error("Delete failed");
  return true;
}

// ================= COURSES =================

export async function getCourses(): Promise<Course[]> {
  try {
    const token = getAuthToken();
    const headers: any = {};
    if (token) headers["Authorization"] = `Token ${token}`;

    const response = await fetch(`${API_BASE}/courses/`, { headers });
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

export async function getCourse(id: string): Promise<Course | null> {
  try {
    const token = getAuthToken();
    const headers: any = {};
    if (token) headers["Authorization"] = `Token ${token}`;

    const response = await fetch(`${API_BASE}/courses/${id}/`, { headers });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

// ================= ADMIN COURSES =================

export async function createCourse(payload: any) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE}/courses/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));
  return data;
}

export async function updateCourse(id: string | number, payload: any) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE}/courses/${id}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));
  return data;
}

export async function deleteCourse(id: string | number) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE}/courses/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  if (!response.ok) throw new Error("Delete failed");
  return true;
}

// ================= USER =================

export type UserProfile = {
  fullName: string;
  email: string;
  phone: string;
  city?: string;
  state?: string;
  country?: string;
};

// ================= LOGIN =================

export async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE}/auth/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  console.log("LOGIN RESPONSE:", data);

  if (!response.ok) {
    throw new Error(data.error || "Login failed");
  }

  const token = data.token || data.key;

  if (!token) {
    throw new Error("Token not received");
  }

  localStorage.setItem("auth_token", token);
  localStorage.setItem("is_admin", data.is_staff ? "true" : "false");

  return { token, email: data.email, isStaff: data.is_staff };
}

// ================= SIGNUP =================

export type SignupPayload = {
  fullName: string;
  email: string;
  password: string;
  phone: string;
};

export async function signup(payload: SignupPayload) {
  const response = await fetch(`${API_BASE}/auth/signup/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    const firstError = Object.values(data)[0];
    throw new Error(Array.isArray(firstError) ? firstError[0] : "Signup failed");
  }

  const token = data.token || data.key;

  if (!token) {
    throw new Error("Token not received");
  }

  localStorage.setItem("auth_token", token);
  localStorage.setItem("is_admin", data.is_staff ? "true" : "false");

  return {
    token,
    profile: {
      fullName: data.fullName,
      email: data.email,
      phone: payload.phone,
    },
    isStaff: data.is_staff
  };
}

// ================= PROFILE =================

export async function getProfile() {
  try {
    const token = getAuthToken();
    if (!token) return null;

    const response = await fetch(`${API_BASE}/profile/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    if (!response.ok) return null;

    return await response.json();
  } catch (error) {
    console.error("getProfile error:", error);
    return null;
  }
}

// ================= UPDATE PROFILE =================

export async function updateProfile(profile: UserProfile) {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Not logged in");
  }

  const response = await fetch(`${API_BASE}/profile/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(profile),
  });

  if (!response.ok) {
    throw new Error("Update failed");
  }

  return await response.json();
}

// ================= MY COURSES =================

export async function getMyCourses(): Promise<Course[]> {
  try {
    const token = getAuthToken();
    if (!token) return [];

    const response = await fetch(`${API_BASE}/my-courses/`, {
      method: "GET",
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    if (!response.ok) {
      console.warn("MyCourses API failed:", response.status);
      return [];
    }

    const data = await response.json();
    console.log("MY COURSES:", data);

    return data;
  } catch (error) {
    console.error("getMyCourses error:", error);
    return [];
  }
}

// ================= PAYMENTS (RAZORPAY & TEST MODE) =================

export async function buyCourse(courseId: string | number) {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Please login to purchase");

    const response = await fetch(`${API_BASE}/buy-course/${courseId}/`, {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Purchase failed");

    return data;
  } catch (error) {
    console.error("buyCourse error:", error);
    throw error;
  }
}

export async function createOrder(courseId: string | number) {
  try {
    const token = getAuthToken();
    if (!token) throw new Error("Please login to purchase");

    const response = await fetch(`${API_BASE}/create-order/${courseId}/`, {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Order creation failed");

    return data;
  } catch (error) {
    console.error("createOrder error:", error);
    throw error;
  }
}

export async function verifyPayment(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  course_id: string | number;
}) {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/verify-payment/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Payment verification failed");

    return data;
  } catch (error) {
    console.error("verifyPayment error:", error);
    throw error;
  }
}

export async function completeLesson(lessonId: number) {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/complete-lesson/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({ lesson_id: lessonId }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to complete lesson");

    return data;
  } catch (error) {
    console.error("completeLesson error:", error);
    throw error;
  }
}

export async function downloadCertificate(courseId: number | string) {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/certificate/${courseId}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to download certificate");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Certificate_${courseId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("downloadCertificate error:", error);
    throw error;
  }
}