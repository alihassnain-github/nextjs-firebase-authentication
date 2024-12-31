"use client";

import { useToast } from "@/hooks/use-toast";
import { applyActionCode, updateProfile } from "firebase/auth";
import { auth, db } from "@/firebase/firebaseConfig";
import ProfileForm from "@/components/AuthProfile";
import { doc, setDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SetUserProfile() {

    const router = useRouter();
    const searchParams = useSearchParams();
    const mode = searchParams.get("mode");
    const oobCode = searchParams.get("oobCode");
    useEffect(() => {
        if (mode && oobCode) {
            applyActionCode(auth, oobCode)
                .then(() => {
                    router.replace("/auth/complete-profile");
                })
                .catch((error) => {
                    console.error("Verification failed:", error);
                });
        }
    }, []);

    const { toast } = useToast();

    const handleSetProfile = async ({
        firstName,
        lastName,
        dob,
        phone,
    }: {
        firstName: string;
        lastName: string;
        dob: Date;
        phone?: string;
    }) => {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("No authenticated user found.");
            }

            await updateProfile(user, {
                displayName: `${firstName} ${lastName}`,
                photoURL: null,
            });

            const userRef = doc(db, "users", user.uid);
            await setDoc(userRef, {
                email: user.email,
                firstName: firstName,
                lastName: lastName,
                phone: phone || null,
                dob: dob.toISOString(),
                photoURL: null,
            });

            router.push("/home");

        } catch (error: any) {
            switch (error.code) {
                case "auth/network-request-failed":
                    toast({
                        variant: "destructive",
                        title: "Network Error",
                        description: "Unable to connect. Check your internet connection and try again.",
                    });
                    break;
                default:
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: "Something went wrong while updating your profile.",
                    });
                    break;
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
                <h1 className="text-center text-2xl font-bold mb-4">Set Your Profile</h1>
                <ProfileForm onSubmit={handleSetProfile} />
            </div>
        </div>
    );
}
