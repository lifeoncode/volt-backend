import {PrismaClient} from '../../generated/prisma';
import {AddressCredential} from "../util/interface";

const prisma = new PrismaClient();

export const createAddressCredentialService = async ({label, city, street, state, town, zip_code, user}: AddressCredential) => {
    const existingAddressCredential = await prisma.addressCredential.findFirst(
        {where: {OR: [{label}, {street}]}});
    if (existingAddressCredential) throw new Error("address already exists");

    return prisma.addressCredential.create({data: {label, city, street, state, town, zip_code, user:{connect:{id:user}}}});
}