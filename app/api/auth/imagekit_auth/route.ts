import { getUploadAuthParams } from "@imagekit/next/server"

export async function GET() {

    try {
        const { token, expire, signature } = getUploadAuthParams({
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
            publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY as string,
        })

        return Response.json({ token, expire, signature, publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY })
    } catch (error) {
        console.error("error", error)
        return Response.json(
            {
                error: "Authentication for imagekit is failed"
            },
            {
                status: 500
            }
        )
    }

}