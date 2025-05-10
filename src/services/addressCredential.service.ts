import {PrismaClient} from '../../generated/prisma';
import {AddressCredential} from "../util/interface";

const prisma = new PrismaClient();

export const createAddressCredentialService = async ({label, city, street, state, town, zip_code, user}: AddressCredential) => {
    const existingAddressCredential = await prisma.addressCredential.findFirst(
        {where: {OR: [{label}, {street}]}});
    if (existingAddressCredential) throw new Error("address already exists");

    return prisma.addressCredential.create({data: {label, city, street, state, town, zip_code, user:{connect:{id:user}}}});
}

export const getAllAddressCredentialsService = async (userId:number | undefined) => {
    return prisma.addressCredential.findMany({where: {user_id: userId}});
}

export const getSingleAddressCredentialsService = async (userId:number | undefined, credentialId: number) => {
    const credentials = await prisma.addressCredential.findMany({where: {user_id: userId}})
    if (credentials.length === 0) throw new Error("No credentials found");

    const matchedCredential = credentials.find(item => item.id === credentialId);
    if (!matchedCredential) throw new Error("No credentials found");

    return matchedCredential;
}

export const updateAddressCredentialService = async (userId:number | undefined, credentialId: number, newCredentialData:any) => {
    const matchedCredential = await prisma.addressCredential.findFirst({where: {user_id: userId, id: credentialId}});
    if (!matchedCredential) throw new Error("No credentials found");

    return prisma.addressCredential.update({where: {user_id: userId, id: credentialId}, data: newCredentialData})
}

export const deleteAddressCredentialService = async (userId:number | undefined, credentialId: number) => {
    const matchedCredential = await prisma.addressCredential.findFirst({where: {user_id: userId, id: credentialId}});
    if (!matchedCredential) throw new Error("No credentials found");

    return prisma.addressCredential.delete({where: {user_id: userId, id: credentialId}})
}