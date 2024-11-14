export module Utils {
  export const generateReferralCode = () => {
    // the referral code can only be 6 characters long, and it must be uppercase. it needs to have letters and numbers.
    const code = Math.random().toString(36).slice(2, 7).toUpperCase();
    return code;
  };
}
