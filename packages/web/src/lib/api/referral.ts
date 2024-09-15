import { action, redirect } from "@solidjs/router";
import { Users } from "@taxikassede/core/src/entities/users";
import { getContext } from "../auth/context";

const generateRef = () => {
  // the referral code can only be 6 characters long, and it must be uppercase. it needs to have letters and numbers.
  const code = Math.random().toString(36).slice(2, 7).toUpperCase();
  return code;
};

export const generateReferralCode = action(async () => {
  "use server";
  const [ctx, event] = await getContext();
  if (!ctx) throw redirect("/auth/login");
  if (!ctx.session) throw redirect("/auth/login");
  if (!ctx.user) throw redirect("/auth/login");

  const user = await Users.findById(ctx.user.id);
  if (!user) throw redirect("/auth/login");

  let referral_code = user.referral_code;
  if (!referral_code) {
    referral_code = generateRef();
    await Users.update({ id: user.id, referral_code });
  }

  return referral_code;
});
