"use client";

import { useToast } from "@/hooks/use-toast";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import AuthForm from "@/components/AuthForm";
import Link from "next/link";
import { auth, db } from "@/firebase/firebaseConfig";
import { useRouter } from "next/navigation";
export default function Signup() {

    const router = useRouter();
    const { toast } = useToast();

    const handleSignup = async ({ email, password }: { email: string; password: string }) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await sendEmailVerification(user);
            router.push("/auth/verify-email");
        } catch (error: any) {
            switch (error.code) {
                case "auth/email-already-in-use":
                    toast({
                        variant: "destructive",
                        title: "Email In Use",
                        description: "The email you entered is already associated with an account. Please login or reset your password.",
                    })
                    break
                case "auth/invalid-email":
                    toast({
                        variant: "destructive",
                        title: "Invalid Email",
                        description: "The email format is invalid. Please enter a valid email address.",
                    })
                    break
                case "auth/weak-password":
                    toast({
                        variant: "destructive",
                        title: "Weak Password",
                        description: "Password is too weak. Use a mix of characters to strengthen it.",
                    })
                    break
                case "auth/too-many-requests":
                    toast({
                        variant: "destructive",
                        title: "Too Many Attempts",
                        description: "Too many attempts, try again later.",
                    });
                    break;
                case "auth/network-request-failed":
                    toast({
                        variant: "destructive",
                        title: "Network Error",
                        description: "Unable to connect. Check your internet connection and try again.",
                    })
                    break
                default:
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: "An unexpected error occurred. Please try again.",
                    })
                    break
            }
        };
    }

    const handleGoogleSignup = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Check if the user already exists in Firestore
            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                // Add user to Firestore
                await setDoc(userRef, {
                    email: user.email,
                    firstName: user.displayName?.split(" ")[0],
                    lastName: user.displayName?.split(" ")[1],
                    phone: user.phoneNumber,
                    dob: null,
                    photoURL: user.photoURL,
                });
            }

        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Google Login Failed",
                description: error.message,
            });
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
                <h1 className="text-2xl font-bold mb-0">Create an account</h1>
                <p className="text-muted-foreground text-sm">Enter your email below to create your account</p>
                <AuthForm mode="signup" onSubmit={handleSignup} onGoogleLogin={handleGoogleSignup} />
                <p className="text-sm mt-2 text-gray-500">Already have an account <Link href="/auth/login" className="text-blue-500 hover:underline">Login</Link></p>
            </div>
        </div>
    );
}
