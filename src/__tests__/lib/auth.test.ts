import { describe, expect, it } from "@jest/globals";
import bcrypt from "bcryptjs";

describe("Auth Utilities - Password Hashing", () => {
  describe("bcrypt password hashing", () => {
    it("should hash password with bcrypt", async () => {
      const password = "SecurePassword123";
      const hashedPassword = await bcrypt.hash(password, 12);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(
        hashedPassword.startsWith("$2a$") || hashedPassword.startsWith("$2b$"),
      ).toBe(true);
    });

    it("should verify correct password", async () => {
      const password = "SecurePassword123";
      const hashedPassword = await bcrypt.hash(password, 12);

      const isValid = await bcrypt.compare(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    it("should reject incorrect password", async () => {
      const password = "SecurePassword123";
      const hashedPassword = await bcrypt.hash(password, 12);

      const isValid = await bcrypt.compare("WrongPassword", hashedPassword);
      expect(isValid).toBe(false);
    });

    it("should generate unique hashes for same password", async () => {
      const password = "SecurePassword123";
      const hash1 = await bcrypt.hash(password, 12);
      const hash2 = await bcrypt.hash(password, 12);

      expect(hash1).not.toBe(hash2);
      // But both should verify the same password
      expect(await bcrypt.compare(password, hash1)).toBe(true);
      expect(await bcrypt.compare(password, hash2)).toBe(true);
    });

    it("should be case-sensitive", async () => {
      const password = "SecurePassword123";
      const hashedPassword = await bcrypt.hash(password, 12);

      const isValidLower = await bcrypt.compare(
        "securepassword123",
        hashedPassword,
      );
      const isValidUpper = await bcrypt.compare(
        "SECUREPASSWORD123",
        hashedPassword,
      );

      expect(isValidLower).toBe(false);
      expect(isValidUpper).toBe(false);
    });
  });
});
