import bcrypt from 'bcrypt';
export const hashPassword = async (plainPassword: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(plainPassword, salt);
  } catch (error) {
    console.error(error);
  }
};
