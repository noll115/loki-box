import { compare, hash } from "bcrypt";



async function ValidatePass(pass: string, hash: string) {
    return await compare(pass, hash);

}

async function HashPass(pass: string) {
    return await hash(pass, 10);

}

async function ValidateSecret(secret: string, hash: string) {
    return await compare(secret, hash);
}

async function HashSecret(secret: string) {
    return await hash(secret, 6);
}


export { ValidatePass, HashPass, HashSecret, ValidateSecret }
