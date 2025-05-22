import { PrismaClient } from "../../generated/prisma";
import { PasswordCredential } from "../util/interface";

const prisma = new PrismaClient();

export const createPasswordCredentialService = async (data: PasswordCredential) => {
  const existingPasswordCredential = await prisma.passwordCredential.findFirst({
    where: { service: data.service, service_user_id: data.service_user_id },
  });
  if (existingPasswordCredential) throw new Error("credential already exists");

  const newPasswordCredential = await prisma.passwordCredential.create({
    data: {
      service: data.service,
      service_user_id: data.service_user_id,
      password: data.password,
      notes: data?.notes,
      user: { connect: { id: data.user } },
    },
  });

  return {
    id: newPasswordCredential.id,
    service: newPasswordCredential.service,
    service_user_id: newPasswordCredential.service_user_id,
  };
};

export const getAllPasswordCredentialsService = async (userId: number | undefined) => {
  return prisma.passwordCredential.findMany({ where: { user_id: userId } });
};

export const getSinglePasswordCredentialService = async (userId: number | undefined, credentialId: number) => {
  const credentials = await prisma.passwordCredential.findMany({
    where: { user_id: userId },
  });
  if (credentials.length === 0) throw new Error("No credentials found");

  const matchedCredential = credentials.find((item) => item.id === credentialId);
  if (!matchedCredential) throw new Error("No credentials found");

  return matchedCredential;
};

export const updatePasswordCredentialService = async (
  userId: number | undefined,
  credentialId: number,
  newCredentialData: any
) => {
  const matchedCredential = await prisma.passwordCredential.findFirst({
    where: { user_id: userId, id: credentialId },
  });
  if (!matchedCredential) throw new Error("No credentials found");

  return prisma.passwordCredential.update({
    where: { user_id: userId, id: credentialId },
    data: newCredentialData,
  });
};

export const deletePasswordCredentialService = async (userId: number | undefined, credentialId: number) => {
  const matchedCredential = await prisma.passwordCredential.findFirst({
    where: { user_id: userId, id: credentialId },
  });
  if (!matchedCredential) throw new Error("No credentials found");

  return prisma.passwordCredential.delete({
    where: { user_id: userId, id: credentialId },
  });
};
