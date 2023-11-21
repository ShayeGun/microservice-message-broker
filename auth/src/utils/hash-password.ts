import { compare, hash, genSalt } from 'bcrypt';



async function hashPassword(password: string, round: number) {
    const salt = await genSalt(round);
    const hashed = await hash(password, salt);

    console.log(salt, hashed);
    return hashed
}

hashPassword('apple', 8);