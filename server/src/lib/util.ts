import { pbkdf2, randomBytes } from "crypto";
import { compare, genSalt, hash } from "bcrypt";



async function ValidatePass(pass: string, hash: string) {
    let verified = await compare(pass, hash)
    return verified;
}



async function HashPass(pass: string) {
    let passHash = await hash(pass, 10);
    return passHash;
}

export { ValidatePass, HashPass }
