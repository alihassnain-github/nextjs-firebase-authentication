"use client";

import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/firebase/firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import ProfileUpdateForm from "@/components/ProfileUpdate";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function ProfileUpdatePage() {
    const { toast } = useToast();

    const handleProfileUpdate = async (
        {
            firstName,
            lastName,
            dob,
            phone,
            imageURL,
        }: { firstName: string; lastName: string; dob?: Date; phone?: string, imageURL?: string }
    ) => {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("No authenticated user found.");
            }

            const userRef = doc(db, "users", user.uid);

            const updatePayload: Record<string, any> = {
                firstName,
                lastName,
                dob: dob?.toISOString(),
                phone,
            };

            if (imageURL) {
                updatePayload.photoURL = imageURL;
            }

            await updateDoc(userRef, updatePayload);

            toast({
                variant: "default",
                title: "Profile Updated",
                description: "Your profile has been successfully updated.",
            });
        } catch (error) {
            console.log(error);

            toast({
                variant: "destructive",
                title: "Error",
                description: "An error occurred while updating your profile.",
            });
        }
    };

    return (
        <section className="min-h-screen bg-gray-100 p-4">
            <Button variant="link" size={"sm"} asChild>
                <Link href={"/home"}>
                    <ChevronLeft /> Back to Home
                </Link>
            </Button>
            <h1 className="text-center text-2xl font-bold my-4">Update Profile</h1>
            <div className="max-w-xl w-full md:mx-0 mx-auto">
                <ProfileUpdateForm
                    onSubmit={handleProfileUpdate} />
            </div>
        </section>
    );
}
