import { currentUser } from "@clerk/nextjs/server";
import { StreamClient } from "@stream-io/node-sdk";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
const apiSecret = process.env.STREAM_SECRET_KEY!;

export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const client = new StreamClient(
      apiKey,
      apiSecret
    );

    const token = client.generateUserToken({
      user_id: user.id,
    });

    return Response.json({ token });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}