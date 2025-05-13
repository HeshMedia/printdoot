"use client";

const BASE_URL = "https://oj5k6unyp3.execute-api.ap-south-1.amazonaws.com/Prod";

export interface UserResponse {
  user: {
    id: string;
    clerkId: string;
    email?: string;
    created_at?: string;
    updated_at?: string;
  };
  user_details: {
    id?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    pin_code?: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    userId?: string;
    created_at?: string;
    updated_at?: string;
  };
}

export interface UserDetails {
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pin_code?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  clerkId: string;
}

/**
 * Add user details to the database
 */
export async function addUserDetails(userDetails: UserDetails): Promise<any> {
  try {    // Format body exactly as expected by the API, updating to match new schema
    const requestBody = {
      "clerkId": userDetails.clerkId, // API expects clerkId in the body
      "address": userDetails.address || "",
      "city": userDetails.city || "",
      "state": userDetails.state || "",
      "country": userDetails.country || "",
      "pin_code": userDetails.pin_code || "",
      "first_name": userDetails.first_name || "",
      "last_name": userDetails.last_name || "",
      "phone_number": userDetails.phone_number || ""
    };
    
    console.log("Request body for addUserDetails:", requestBody);
    console.log("UserDetails:", userDetails);
    console.log("UserDetails.clerkId:", userDetails.clerkId);
    console.log("Sending request to:", `${BASE_URL}/users/add-details`);
    const response = await fetch(`${BASE_URL}/users/add-details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error Response:', errorData);
      throw new Error(errorData.message || 'Failed to add user details');
    }

    const responseData = await response.json();
    console.log('API Success Response:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error adding user details:', error);
    throw error;
  }
}

/**
 * Update user details in the database
 */
export async function updateUserDetails(clerkId: string, userDetails: Omit<UserDetails, 'clerkId'>): Promise<any> {
  try {    // Format body exactly as expected by the API with updated schema - flat structure as per docs
    const requestBody = {
      "address": userDetails.address || "",
      "city": userDetails.city || "",
      "state": userDetails.state || "",
      "country": userDetails.country || "",
      "pin_code": userDetails.pin_code || "",
      "first_name": userDetails.first_name || "",
      "last_name": userDetails.last_name || "",
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
      console.error('API Error Response:', errorData);
      throw new Error(errorData.message || 'Failed to update user details');
    }

    const responseData = await response.json();
    console.log('API Success Response:', responseData);
    return responseData;
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
    }    // Get the nested response format
    const data = await response.json();
    console.log("API Response data:", data);

    // Check if we have the expected nested structure
    if (data && data.user_details) {
      // Extract user_details and merge with clerkId for backward compatibility
      return {
        ...data.user_details,
        clerkId: data.user.clerkId
      };
    } 
    // Check if the response is a flat structure (backwards compatibility)
    else if (data && data.clerkId) {
      console.log("Received flat data structure:", data);
      return data;
    }
    
    console.log("No valid user details found in response");
    return null;
  } catch (error) {
    console.error('Error getting user details:', error);
    throw error;
  }
}
