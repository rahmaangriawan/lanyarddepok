// Auto-triggered hot reload for updated generated client schema (CityPage model added)
import { PrismaClient } from "../generated/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

declare global {
  var prismaGlobalV4: PrismaClient | undefined;
}

const databaseUrl = process.env.DATABASE_URL || "mysql://root:@localhost:3306/lanyardjakarta";

const adapter = new PrismaMariaDb(databaseUrl);

export const prisma = globalThis.prismaGlobalV4 || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobalV4 = prisma;
}
