import { notFound } from "next/navigation";
import { connection } from "next/server";

import { config } from "@/config";

import { StudioClient } from "./StudioClient";

const PrismaPage = async () => {
  await connection();
  if (config.env !== "dev") notFound();
  return <StudioClient />;
};

export default PrismaPage;
