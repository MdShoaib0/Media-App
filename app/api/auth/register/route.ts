import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request:NextRequest) {
    try {
        const {email, password} = await request.json();

        if(!email || !password) {
            return NextResponse.json(
                {error: "Email and Password are required."},
                {status: 400}
            )
        }

        await connectToDatabase();

        const exestingUser = await User.findOne({email})

        if(exestingUser) {
            return NextResponse.json(
                {error: "User Already Registered."},
                {status: 400}
            )
        }

        await User.create({
            email,
            password
        })

        return NextResponse.json(
                {error: "User Registered Successfully."},
                {status: 200}
            )

    } catch (error) {
        console.log("Registration errro: ",error)
        return NextResponse.json(
                {error: "Fail to Register user."},
                {status: 400}
            )
    }
}