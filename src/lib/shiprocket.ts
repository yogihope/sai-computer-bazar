// Shiprocket API Integration
// Documentation: https://apidocs.shiprocket.in/

const SHIPROCKET_BASE_URL = "https://apiv2.shiprocket.in/v1/external";

// Store token in memory (in production, use Redis or database)
let cachedToken: { token: string; expiresAt: number } | null = null;

// Get authentication token
async function getAuthToken(): Promise<string> {
  // Check if we have a valid cached token
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const email = process.env.SHIPROCKET_EMAIL || "demo@shiprocket.com";
  const password = process.env.SHIPROCKET_PASSWORD || "demo_password";

  try {
    const response = await fetch(`${SHIPROCKET_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.token) {
      // Cache token for 9 days (Shiprocket tokens expire in 10 days)
      cachedToken = {
        token: data.token,
        expiresAt: Date.now() + 9 * 24 * 60 * 60 * 1000,
      };
      return data.token;
    }

    throw new Error("Failed to get Shiprocket token");
  } catch (error) {
    console.error("Shiprocket auth error:", error);
    throw error;
  }
}

// Make authenticated request
async function shiprocketRequest(
  endpoint: string,
  method: string = "GET",
  body?: any
) {
  const token = await getAuthToken();

  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${SHIPROCKET_BASE_URL}${endpoint}`, options);
  return response.json();
}

// Order types
interface ShiprocketOrderItem {
  name: string;
  sku: string;
  units: number;
  selling_price: number;
  discount?: number;
  tax?: number;
  hsn?: string;
}

interface ShiprocketOrderData {
  order_id: string;
  order_date: string;
  pickup_location?: string;
  channel_id?: string;
  comment?: string;
  billing_customer_name: string;
  billing_last_name?: string;
  billing_address: string;
  billing_address_2?: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email?: string;
  billing_phone: string;
  shipping_is_billing: boolean;
  shipping_customer_name?: string;
  shipping_last_name?: string;
  shipping_address?: string;
  shipping_address_2?: string;
  shipping_city?: string;
  shipping_pincode?: string;
  shipping_state?: string;
  shipping_country?: string;
  shipping_email?: string;
  shipping_phone?: string;
  order_items: ShiprocketOrderItem[];
  payment_method: "Prepaid" | "COD";
  shipping_charges?: number;
  giftwrap_charges?: number;
  transaction_charges?: number;
  total_discount?: number;
  sub_total: number;
  length: number;
  breadth: number;
  height: number;
  weight: number;
}

// Create order in Shiprocket
export async function createShiprocketOrder(orderData: ShiprocketOrderData) {
  try {
    const result = await shiprocketRequest("/orders/create/adhoc", "POST", orderData);

    if (result.order_id) {
      return {
        success: true,
        orderId: result.order_id,
        shipmentId: result.shipment_id,
        data: result,
      };
    }

    return {
      success: false,
      error: result.message || "Failed to create Shiprocket order",
    };
  } catch (error: any) {
    console.error("Shiprocket order creation error:", error);
    return {
      success: false,
      error: error.message || "Failed to create shipping order",
    };
  }
}

// Get available courier services
export async function getAvailableCouriers(
  pickupPincode: string,
  deliveryPincode: string,
  weight: number,
  cod: boolean = false
) {
  try {
    const params = new URLSearchParams({
      pickup_postcode: pickupPincode,
      delivery_postcode: deliveryPincode,
      weight: weight.toString(),
      cod: cod ? "1" : "0",
    });

    const result = await shiprocketRequest(
      `/courier/serviceability/?${params.toString()}`
    );

    if (result.data && result.data.available_courier_companies) {
      return {
        success: true,
        couriers: result.data.available_courier_companies,
      };
    }

    return {
      success: false,
      error: "No courier services available for this route",
    };
  } catch (error: any) {
    console.error("Courier availability error:", error);
    return {
      success: false,
      error: error.message || "Failed to check courier availability",
    };
  }
}

// Generate AWB (Air Waybill) for shipment
export async function generateAWB(shipmentId: string, courierId: number) {
  try {
    const result = await shiprocketRequest("/courier/assign/awb", "POST", {
      shipment_id: shipmentId,
      courier_id: courierId,
    });

    if (result.awb_assign_status === 1) {
      return {
        success: true,
        awbNumber: result.response.data.awb_code,
        courierName: result.response.data.courier_name,
        data: result,
      };
    }

    return {
      success: false,
      error: result.message || "Failed to generate AWB",
    };
  } catch (error: any) {
    console.error("AWB generation error:", error);
    return {
      success: false,
      error: error.message || "Failed to generate AWB",
    };
  }
}

// Schedule pickup
export async function schedulePickup(shipmentId: string, pickupDate?: string) {
  try {
    const body: any = {
      shipment_id: [shipmentId],
    };

    if (pickupDate) {
      body.pickup_date = pickupDate;
    }

    const result = await shiprocketRequest("/courier/generate/pickup", "POST", body);

    if (result.pickup_status === 1) {
      return {
        success: true,
        pickupScheduledDate: result.response.pickup_scheduled_date,
        data: result,
      };
    }

    return {
      success: false,
      error: result.message || "Failed to schedule pickup",
    };
  } catch (error: any) {
    console.error("Pickup scheduling error:", error);
    return {
      success: false,
      error: error.message || "Failed to schedule pickup",
    };
  }
}

// Track shipment
export async function trackShipment(awbNumber: string) {
  try {
    const result = await shiprocketRequest(`/courier/track/awb/${awbNumber}`);

    if (result.tracking_data) {
      return {
        success: true,
        trackingData: result.tracking_data,
      };
    }

    return {
      success: false,
      error: "No tracking data available",
    };
  } catch (error: any) {
    console.error("Tracking error:", error);
    return {
      success: false,
      error: error.message || "Failed to track shipment",
    };
  }
}

// Track by shipment ID
export async function trackByShipmentId(shipmentId: string) {
  try {
    const result = await shiprocketRequest(`/courier/track/shipment/${shipmentId}`);

    if (result.tracking_data) {
      return {
        success: true,
        trackingData: result.tracking_data,
      };
    }

    return {
      success: false,
      error: "No tracking data available",
    };
  } catch (error: any) {
    console.error("Tracking error:", error);
    return {
      success: false,
      error: error.message || "Failed to track shipment",
    };
  }
}

// Cancel shipment
export async function cancelShipment(awbNumbers: string[]) {
  try {
    const result = await shiprocketRequest("/orders/cancel/shipment/awbs", "POST", {
      awbs: awbNumbers,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    console.error("Shipment cancellation error:", error);
    return {
      success: false,
      error: error.message || "Failed to cancel shipment",
    };
  }
}

// Get pincode serviceability
export async function checkPincodeServiceability(pincode: string) {
  try {
    const result = await shiprocketRequest(
      `/open/postcode/details?postcode=${pincode}`
    );

    if (result.success) {
      return {
        success: true,
        data: result.postcode_details,
      };
    }

    return {
      success: false,
      error: "Pincode not serviceable",
    };
  } catch (error: any) {
    console.error("Pincode check error:", error);
    return {
      success: false,
      error: error.message || "Failed to check pincode",
    };
  }
}

// Calculate shipping charges
export async function calculateShippingCharges(
  pickupPincode: string,
  deliveryPincode: string,
  weight: number,
  cod: boolean = false,
  declaredValue: number
) {
  try {
    const couriersResult = await getAvailableCouriers(
      pickupPincode,
      deliveryPincode,
      weight,
      cod
    );

    if (!couriersResult.success) {
      return couriersResult;
    }

    // Find the cheapest courier
    const couriers = couriersResult.couriers || [];
    if (couriers.length === 0) {
      return {
        success: false,
        error: "No couriers available",
      };
    }

    // Sort by freight charges
    const sortedCouriers = couriers.sort(
      (a: any, b: any) => a.freight_charge - b.freight_charge
    );

    const cheapest = sortedCouriers[0];
    const fastest = couriers.reduce((prev: any, curr: any) =>
      prev.estimated_delivery_days < curr.estimated_delivery_days ? prev : curr
    );

    return {
      success: true,
      cheapestOption: {
        courierId: cheapest.courier_company_id,
        courierName: cheapest.courier_name,
        charge: cheapest.freight_charge,
        codCharges: cheapest.cod_charges || 0,
        estimatedDays: cheapest.estimated_delivery_days,
      },
      fastestOption: {
        courierId: fastest.courier_company_id,
        courierName: fastest.courier_name,
        charge: fastest.freight_charge,
        codCharges: fastest.cod_charges || 0,
        estimatedDays: fastest.estimated_delivery_days,
      },
      allOptions: sortedCouriers.map((c: any) => ({
        courierId: c.courier_company_id,
        courierName: c.courier_name,
        charge: c.freight_charge,
        codCharges: c.cod_charges || 0,
        estimatedDays: c.estimated_delivery_days,
      })),
    };
  } catch (error: any) {
    console.error("Shipping calculation error:", error);
    return {
      success: false,
      error: error.message || "Failed to calculate shipping",
    };
  }
}

export type { ShiprocketOrderData, ShiprocketOrderItem };
