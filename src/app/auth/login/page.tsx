"use client";

import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import AuthForm from "@/components/AuthForm";
import Link from "next/link";
import { auth, db } from "@/firebase/firebaseConfig";
import { useRouter } from "next/navigation";

export default function Login() {

    const router = useRouter();
    const { toast } = useToast();

    const handleLogin = async ({ email, password }: { email: string; password: string }) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/home");
        } catch (error: any) {

            switch (error.code) {
                case "auth/invalid-email":
                    toast({
                        variant: "destructive",
                        title: "Invalid Email",
                        description: "The email format is invalid. Please enter a valid email address.",
                    })
                    break
                case "auth/user-disabled":
                    toast({
                        variant: "destructive",
                        title: "Account Disabled",
                        description: "This account has been disabled.",
                    });
                    break;
                case "auth/user-not-found":
                    toast({
                        variant: "destructive",
                        title: "User Not Found",
                        description: "No account with this email.",
                    });
                    break;
                case "auth/wrong-password":
                    toast({
                        variant: "destructive",
                        title: "Incorrect Password",
                        description: "The password you entered is not correct. Please try again.",
                    });
                    break;
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
                case "auth/invalid-credential":
                    toast({
                        variant: "destructive",
                        title: "Invalid Credentials",
                        description: "Email or password is incorrect.",
                    });
                    break;
                default:
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: "Something went wrong, please try again.",
                    });
                    break;
            }
        };
    };

    const handleGoogleLogin = async () => {
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
                <h1 className="text-2xl font-bold mb-0">Signin Account</h1>
                <p className="text-muted-foreground text-sm">Enter your email below to signin your account</p>
                <AuthForm mode="login" onSubmit={handleLogin} onGoogleLogin={handleGoogleLogin} />
                <p className="text-sm mt-2 text-gray-500">Don't have an account <Link href="/auth/signup" className="text-blue-500 hover:underline">Signup</Link></p>
            </div>
        </div>
    );
}
