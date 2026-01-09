import { NextRequest, NextResponse } from "next/server";
import { calculateShippingCharges, checkPincodeServiceability } from "@/lib/shiprocket";

// Pickup pincode (your warehouse location)
const PICKUP_PINCODE = process.env.PICKUP_PINCODE || "400001";

// POST - Calculate shipping charges
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pincode, weight = 2, cod = false, cartTotal = 0 } = body;

    if (!pincode || pincode.length !== 6) {
      return NextResponse.json(
        { error: "Valid pincode is required" },
        { status: 400 }
      );
    }

    // Check pincode serviceability
    const serviceability = await checkPincodeServiceability(pincode);

    if (!serviceability.success) {
      return NextResponse.json({
        serviceable: false,
        error: "Delivery not available for this pincode",
      });
    }

    // Calculate shipping charges
    const shippingResult = await calculateShippingCharges(
      PICKUP_PINCODE,
      pincode,
      weight,
      cod,
      cartTotal
    );

    if (!shippingResult.success) {
      // If Shiprocket fails, return default charges
      const defaultCharge = cartTotal >= 10000 ? 0 : 99;
      return NextResponse.json({
        serviceable: true,
        shipping: {
          charge: defaultCharge,
          codCharges: cod ? 50 : 0,
          estimatedDays: "5-7",
          courierName: "Standard Delivery",
          isFreeShipping: defaultCharge === 0,
        },
      });
    }

    // Apply free shipping for orders above threshold
    const freeShippingThreshold = 10000;
    const isFreeShipping = cartTotal >= freeShippingThreshold;

    // Extract shipping options if available
    const cheapestOption = 'cheapestOption' in shippingResult ? shippingResult.cheapestOption : null;
    const fastestOption = 'fastestOption' in shippingResult ? shippingResult.fastestOption : null;

    return NextResponse.json({
      serviceable: true,
      shipping: {
        charge: isFreeShipping ? 0 : cheapestOption?.charge || 99,
        codCharges: cheapestOption?.codCharges || 0,
        estimatedDays: cheapestOption?.estimatedDays || "5-7",
        courierName: cheapestOption?.courierName || "Standard Delivery",
        isFreeShipping,
        freeShippingThreshold,
      },
      expressOption: fastestOption
        ? {
            charge: isFreeShipping ? 0 : fastestOption.charge,
            estimatedDays: fastestOption.estimatedDays,
            courierName: fastestOption.courierName,
          }
        : null,
      pincodeDetails: serviceability.data,
    });
  } catch (error) {
    console.error("Shipping calculation error:", error);

    // Return default charges on error
    return NextResponse.json({
      serviceable: true,
      shipping: {
        charge: 99,
        codCharges: 50,
        estimatedDays: "5-7",
        courierName: "Standard Delivery",
        isFreeShipping: false,
      },
    });
  }
}

// GET - Check pincode serviceability
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pincode = searchParams.get("pincode");

    if (!pincode || pincode.length !== 6) {
      return NextResponse.json(
        { error: "Valid pincode is required" },
        { status: 400 }
      );
    }

    const serviceability = await checkPincodeServiceability(pincode);

    return NextResponse.json({
      serviceable: serviceability.success,
      details: serviceability.data || null,
    });
  } catch (error) {
    console.error("Pincode check error:", error);
    return NextResponse.json({ serviceable: true }); // Default to serviceable
  }
}
