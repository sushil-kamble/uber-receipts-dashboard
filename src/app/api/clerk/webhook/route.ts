import db from "@/db";
import { user } from "@/db/schema";
import { handleError } from "@/lib/utils-server";

export const POST = async (req: Request) => {
  try {
    const { data } = await req.json();
    const firstName = data.first_name;
    const lastName = data.last_name;
    const email = data.email_addresses[0]?.email_address;
    const imageUrl = data.image_url;
    const id = data.id;

    await db.insert(user).values({
      id,
      first_name: firstName,
      last_name: lastName,
      email,
      profile_image: imageUrl,
    });

    return new Response("ok", { status: 200 });
  } catch (error) {
    return handleError(error);
  }
};
