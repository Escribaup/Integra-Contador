import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const credentials = pgTable("credentials", {
  id: serial("id").primaryKey(),
  consumerKey: text("consumer_key").notNull(),
  consumerSecret: text("consumer_secret").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  password: text("password").notNull(),
  isProcessed: boolean("is_processed").default(false),
  certificateData: text("certificate_data"), // Base64 encoded certificate
  privateKey: text("private_key"), // Processed private key
  publicCert: text("public_cert"), // Processed public certificate
  cnpj: text("cnpj"),
  companyName: text("company_name"),
  expirationDate: timestamp("expiration_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const authTokens = pgTable("auth_tokens", {
  id: serial("id").primaryKey(),
  accessToken: text("access_token").notNull(),
  jwtToken: text("jwt_token").notNull(),
  expiresIn: text("expires_in").notNull(),
  tokenType: text("token_type").default("Bearer"),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const serviceRequests = pgTable("service_requests", {
  id: serial("id").primaryKey(),
  serviceName: text("service_name").notNull(),
  requestData: text("request_data").notNull(), // JSON string
  responseData: text("response_data"), // JSON string
  status: text("status").notNull(), // "pending", "success", "error"
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCredentialsSchema = createInsertSchema(credentials).omit({
  id: true,
  createdAt: true,
});

export const insertCertificateSchema = createInsertSchema(certificates).omit({
  id: true,
  createdAt: true,
  isProcessed: true,
  certificateData: true,
  privateKey: true,
  publicCert: true,
  cnpj: true,
  companyName: true,
  expirationDate: true,
});

export const insertAuthTokensSchema = createInsertSchema(authTokens).omit({
  id: true,
  createdAt: true,
});

export const insertServiceRequestSchema = createInsertSchema(serviceRequests).omit({
  id: true,
  createdAt: true,
});

export type InsertCredentials = z.infer<typeof insertCredentialsSchema>;
export type Credentials = typeof credentials.$inferSelect;

export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type Certificate = typeof certificates.$inferSelect;

export type InsertAuthTokens = z.infer<typeof insertAuthTokensSchema>;
export type AuthTokens = typeof authTokens.$inferSelect;

export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;
export type ServiceRequest = typeof serviceRequests.$inferSelect;


