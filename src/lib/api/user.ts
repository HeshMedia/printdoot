"use client";

const BASE_URL = "https://oj5k6unyp3.execute-api.ap-south-1.amazonaws.com/Prod";

export interface UserDetails {
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pin_code?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  clerkId: string;
}

/**
 * Add user details to the database
 */
export async function addUserDetails(userDetails: UserDetails): Promise<any> {
  try {
    // Format body exactly as expected by the API, clerkId is sent in the body for add-details
    const requestBody = {
      "address": userDetails.address || "",
      "city": userDetails.city || "",
      "state": userDetails.state || "",
      "country": userDetails.country || "",
      "pin_code": userDetails.pin_code || "",
      "first_name": userDetails.first_name || "",
      "last_name": userDetails.last_name || "",
      "email": userDetails.email || "",
      "phone_number": userDetails.phone_number || "",
      "clerkId": userDetails.clerkId
    };
    
    console.log("Request body for addUserDetails:", requestBody);
    console.log("UserDetails:", userDetails);
    console.log("UserDetails.clerkId:", userDetails.clerkId);
    console.log("Sending request to:", `${BASE_URL}/users/update-details/${userDetails.clerkId}`);
    const response = await fetch(`${BASE_URL}/users/add-details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add user details');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding user details:', error);
    throw error;
  }
}

/**
 * Update user details in the database
 */
export async function updateUserDetails(clerkId: string, userDetails: Omit<UserDetails, 'clerkId'>): Promise<any> {
  try {
    // Format body exactly as expected by the API
    const requestBody = {
      "address": userDetails.address || "",
      "city": userDetails.city || "",
      "state": userDetails.state || "",
      "country": userDetails.country || "",
      "pin_code": userDetails.pin_code || "",
      "first_name": userDetails.first_name || "",
      "last_name": userDetails.last_name || "",
      "email": userDetails.email || "",
      "phone_number": userDetails.phone_number || ""
    };
    console.log("Request body for updateUserDetails:", requestBody);
    console.log("UserDetails:", userDetails);
    console.log("Sending request to:", `${BASE_URL}/users/update-details/${clerkId}`);
    // clerkId is sent as path parameter, not in body
    const response = await fetch(`${BASE_URL}/users/update-details/${clerkId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    console.log("Response from updateUserDetails:", response);
    

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update user details');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating user details:', error);
    throw error;
  }
}

/**
 * Get user details from the database
 */
export async function getUserDetails(clerkId: string): Promise<UserDetails | null> {
  try {
    const response = await fetch(`${BASE_URL}/users/details/${clerkId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    console.log("Response from getUserDetails:", response);
    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get user details');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting user details:', error);
    throw error;
  }
}
