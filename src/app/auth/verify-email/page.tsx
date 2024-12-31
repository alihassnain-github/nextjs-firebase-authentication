"use client";

import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { sendEmailVerification } from "firebase/auth";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function VerifyEmail() {

    const { toast } = useToast();

    const { currentUser } = useAuth()!;
    const [isSending, setIsSending] = useState(false);

    const handleResendEmail = async () => {
        if (currentUser) {
            setIsSending(true);
            try {
                await sendEmailVerification(currentUser);
                toast({
                    variant: "default",
                    title: "Verification Email Sent",
                    description: "A new verification email has been sent. Please check your inbox.",
                });
            } catch (error: any) {
                switch (error.code) {
                    case "auth/network-request-failed":
                        toast({
                            variant: "destructive",
                            title: "Network Error",
                            description: "Unable to connect. Check your internet connection and try again.",
                        });
                        break;
                    case "auth/requires-recent-login":
                        toast({
                            variant: "destructive",
                            title: "Requires Recent Login",
                            description: "Please log in again to perform this action.",
                        });
                        break;
                    case "auth/email-already-sent":
                        toast({
                            variant: "destructive",
                            title: "Email Already Sent",
                            description: "A verification email has already been sent. Please check your inbox.",
                        });
                        break;
                    case "auth/too-many-requests":
                        toast({
                            variant: "destructive",
                            title: "Too Many Requests",
                            description: "You have made too many requests. Please try again later.",
                        });
                        break;
                    default:
                        toast({
                            variant: "destructive",
                            title: "Error",
                            description: "An unexpected error occurred. Please try again.",
                        });
                        break;
                }
            } finally {
                setIsSending(false);
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
                <h1 className="text-center text-2xl font-bold mb-2">Verify Email</h1>
                <Image
                    className="mx-auto mb-2"
                    src="/sent-email.gif"
                    alt="Verify Email GIF"
                    width={50}
                    height={50}
                />
                <p className="text-center">
                    We sent a confirmation email to:{" "}
                    <span className="hover:text-gray-500 text-blue-500 transition-colors cursor-pointer">
                        {currentUser?.email}
                    </span>{" "}
                    Check your email and click on the confirmation link to continue.
                </p>
                <Button
                    type="button"
                    className="w-full mt-4"
                    variant="default"
                    onClick={handleResendEmail}
                    disabled={isSending}
                >
                    {
                        isSending ?
                            <>
                                <Loader2 className="animate-spin" />
                                Sending...
                            </>
                            :
                            "Resend email"
                    }
                </Button>
            </div>
        </div>
    );
}
