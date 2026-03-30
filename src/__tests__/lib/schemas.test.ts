import { describe, expect, it } from "@jest/globals";
import {
  SignupSchema,
  CreatePropertySchema,
  CreateRoomSchema,
  CreateBookingSchema,
  CreateReviewSchema,
} from "@/lib/schemas";

describe("Zod Schema Validation", () => {
  describe("SignupSchema", () => {
    it("should validate correct signup data", () => {
      const validData = {
        name: "John Doe",
        email: "john@example.com",
        password: "SecurePass123",
        phone: "9876543210",
        role: "TENANT",
      };
      const result = SignupSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const invalidData = {
        name: "John Doe",
        email: "invalid-email",
        password: "SecurePass123",
      };
      const result = SignupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Invalid email");
      }
    });

    it("should reject short password", () => {
      const invalidData = {
        name: "John Doe",
        email: "john@example.com",
        password: "short",
      };
      const result = SignupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "at least 8 characters",
        );
      }
    });

    it("should reject invalid phone number", () => {
      const invalidData = {
        name: "John Doe",
        email: "john@example.com",
        password: "SecurePass123",
        phone: "123456", // Too short
      };
      const result = SignupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "Invalid phone number",
        );
      }
    });

    it("should lowercase email", () => {
      const data = {
        name: "John Doe",
        email: "JOHN@EXAMPLE.COM",
        password: "SecurePass123",
        phone: "9876543210",
        role: "TENANT",
      };
      const result = SignupSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("john@example.com");
      }
    });

    it("should default role to TENANT", () => {
      const data = {
        name: "John Doe",
        email: "john@example.com",
        password: "SecurePass123",
        role: "TENANT", // Explicitly provide the default
      };
      const result = SignupSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBe("TENANT");
      }
    });
  });

  describe("CreatePropertySchema", () => {
    it("should validate correct property data", () => {
      const validData = {
        name: "Sunshine PG",
        description: "Beautiful PG for students",
        city: "Delhi",
        address: "123 MG Road, Delhi",
        gender: "MALE",
        lat: 28.6139,
        lng: 77.209,
      };
      const result = CreatePropertySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid coordinates", () => {
      const invalidData = {
        name: "Sunshine PG",
        city: "Delhi",
        address: "123 MG Road, Delhi",
        gender: "MALE",
        lat: 100, // Invalid latitude
        lng: 77.209,
      };
      const result = CreatePropertySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject short PG name", () => {
      const invalidData = {
        name: "A",
        city: "Delhi",
        address: "123 MG Road, Delhi",
        gender: "MALE",
      };
      const result = CreatePropertySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should default foodPlan to NONE", () => {
      const data = {
        name: "Sunshine PG",
        city: "Delhi",
        address: "123 MG Road, Delhi",
        gender: "MALE",
      };
      const result = CreatePropertySchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.foodPlan).toBe("NONE");
      }
    });

    it("should accept valid WhatsApp number", () => {
      const data = {
        name: "Sunshine PG",
        city: "Delhi",
        address: "123 MG Road, Delhi",
        gender: "MALE",
        whatsapp: "9876543210",
      };
      const result = CreatePropertySchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("CreateRoomSchema", () => {
    it("should validate correct room data", () => {
      const validData = {
        type: "Single",
        rent: 5000,
        deposit: 10000,
      };
      const result = CreateRoomSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject rent below minimum", () => {
      const invalidData = {
        type: "Single",
        rent: 200, // Below ₹500 minimum
        deposit: 10000,
      };
      const result = CreateRoomSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Min rent ₹500");
      }
    });

    it("should coerce rent to number", () => {
      const data = {
        type: "Single",
        rent: "5000" as any,
        deposit: "10000" as any,
      };
      const result = CreateRoomSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.rent).toBe("number");
        expect(result.data.rent).toBe(5000);
      }
    });
  });

  describe("CreateBookingSchema", () => {
    it("should validate correct booking data", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().slice(0, 10);

      const validData = {
        propertyId: "prop_123",
        roomId: "room_456",
        moveInDate: tomorrowStr,
        type: "ENQUIRY",
      };
      const result = CreateBookingSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject past move-in dates", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);

      const invalidData = {
        propertyId: "prop_123",
        roomId: "room_456",
        moveInDate: yesterdayStr,
      };
      const result = CreateBookingSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "must be today or in the future",
        );
      }
    });

    it("should accept today as move-in date", () => {
      const today = new Date().toISOString().slice(0, 10);

      const validData = {
        propertyId: "prop_123",
        roomId: "room_456",
        moveInDate: today,
      };
      const result = CreateBookingSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should default type to ENQUIRY", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().slice(0, 10);

      const data = {
        propertyId: "prop_123",
        roomId: "room_456",
        moveInDate: tomorrowStr,
      };
      const result = CreateBookingSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("ENQUIRY");
      }
    });
  });

  describe("CreateReviewSchema", () => {
    it("should validate correct review data", () => {
      const validData = {
        propertyId: "prop_123",
        rating: 4,
        comment: "Great place to stay!",
      };
      const result = CreateReviewSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject rating below 1", () => {
      const invalidData = {
        propertyId: "prop_123",
        rating: 0,
        comment: "Bad",
      };
      const result = CreateReviewSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject rating above 5", () => {
      const invalidData = {
        propertyId: "prop_123",
        rating: 6,
        comment: "Amazing",
      };
      const result = CreateReviewSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should coerce rating to number", () => {
      const data = {
        propertyId: "prop_123",
        rating: "4" as any,
        comment: "Good",
      };
      const result = CreateReviewSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.rating).toBe("number");
        expect(result.data.rating).toBe(4);
      }
    });
  });
});
