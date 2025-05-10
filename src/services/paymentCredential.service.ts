import {PrismaClient} from "../../generated/prisma";
import {PaymentCredential} from "../util/interface";

const prisma = new PrismaClient();

export const createPaymentCredentialService = async (data: PaymentCredential) => {
    const existingCardNumber = await prisma.paymentCredential.findUnique({where:{card_number: data.card_number}});
    const existingSecurityCode = await prisma.paymentCredential.findUnique({where:{security_code: data.security_code}});
    if (existingCardNumber || existingSecurityCode) throw new Error("credential already exists");

    const newPaymentCredential = await prisma.paymentCredential.create({data: {card_holder:data.card_holder, card_number:data.card_number, card_expiry:data.card_expiry, security_code:data.security_code, card_type:data.card_type, notes:data?.notes, user:{connect: {id: data.user}}}});

    return {id: newPaymentCredential.id, card_holder: newPaymentCredential.card_holder, card_type: newPaymentCredential.card_type};
}

export const getAllPaymentCredentialsService = async (userId: number | undefined) => {
    return prisma.paymentCredential.findMany({where: {user_id: userId}});
}

export const getSinglePaymentCredentialService = async (userId: number | undefined, credentialId: number) => {
    const credentials = await prisma.paymentCredential.findMany({where: {user_id: userId}})
    if (credentials.length === 0) throw new Error("No credentials found");

    const matchedCredential = credentials.find(item => item.id === credentialId);
    if (!matchedCredential) throw new Error("No credentials found");

    return matchedCredential;
}

export const updatePaymentCredentialService = async (userId:number | undefined, credentialId: number, newCredentialData:any) => {
    const matchedCredential = await prisma.paymentCredential.findFirst({where: {user_id: userId, id: credentialId}});
    if (!matchedCredential) throw new Error("No credentials found");

    return prisma.paymentCredential.update({where: {user_id: userId, id: credentialId}, data: newCredentialData})
}

export const deletePaymentCredentialService = async (userId:number | undefined, credentialId: number) => {
    const matchedCredential = await prisma.paymentCredential.findFirst({where: {user_id: userId, id: credentialId}});
    if (!matchedCredential) throw new Error("No credentials found");

    return prisma.paymentCredential.delete({where: {user_id: userId, id: credentialId}})
}