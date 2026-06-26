import { PrismaClient } from "../generated/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { shouldSkipDbDuringBuild } from "@/lib/build-env";

declare global {
  var prismaGlobalV4: PrismaClient | undefined;
}

const databaseUrl = process.env.DATABASE_URL || (shouldSkipDbDuringBuild() ? "mysql://skip:skip@127.0.0.1:3306/skip" : "");

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to initialize Prisma");
}

function createPrismaClient() {
  const adapter = new PrismaMariaDb(databaseUrl);
  return new PrismaClient({ adapter });
}

export const prisma = globalThis.prismaGlobalV4 ?? createPrismaClient();

globalThis.prismaGlobalV4 = prisma;
