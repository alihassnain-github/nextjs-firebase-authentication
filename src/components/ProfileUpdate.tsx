"use client";

import { auth, storage } from "@/firebase/firebaseConfig";
import { getDownloadURL, ref, uploadBytes, deleteObject } from "firebase/storage";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns"
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { CalendarIcon, Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { cn } from "@/lib/utils"
import { getUserFormFirestore } from "@/context/UserContext";
import { Skeleton } from "./ui/skeleton";

const formSchema = z.object({
    firstName: z
        .string()
        .nonempty("First name is required.")
        .regex(/^[a-zA-Z\s]+$/, "First name must contain only letters."),
    lastName: z
        .string()
        .nonempty("Last name is required.")
        .regex(/^[a-zA-Z\s]+$/, "Last name must contain only letters."),
    dob: z.date().optional(),
    phone: z
        .string()
        .optional()
        .refine((val) => !val || /^\d{10}$/.test(val), "Phone number must be 10 digits.")
});

export default function ProfileUpdateForm({
    onSubmit,
}: {
    onSubmit: (data: z.infer<typeof formSchema> & { imageURL?: string }) => Promise<void>;
}) {
    const { user } = getUserFormFirestore()!;
    const [imageUploading, setImageUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [imageURL, setImageURL] = useState<string | undefined>(undefined);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            phone: "",
        },
    });

    const { reset } = form;

    useEffect(() => {
        if (user) {
            reset({
                firstName: user.firstName,
                lastName: user.lastName,
                dob: new Date(user.dob),
                phone: user.phone || "",
            });
        }
    }, [user, reset]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setProfileImage(file);
            try {
                setImageUploading(true);
                const url = await uploadProfileImage(file);
                setImageURL(url);
            } catch (error) {
                console.error(error);
            } finally {
                setImageUploading(false);
            }
        }
    };

    const uploadProfileImage = async (file: File) => {

        if (auth.currentUser) {

            const userId = auth.currentUser.uid;

            // Storage references
            const oldImageRef = ref(storage, `profile-images/${userId}`); // Replace previous image
            const newImageRef = ref(storage, `profile-images/${userId}-${Date.now()}`);

            try {
                await deleteObject(oldImageRef).catch(() => {

                });

                await uploadBytes(newImageRef, file);

                const newImageUrl = await getDownloadURL(newImageRef);
                return newImageUrl;

            } catch (error) {
                console.error("Error uploading or deleting profile image:", error);
            }
        }
    };

    const handleSubmit = async (data: z.infer<typeof formSchema>) => {
        setLoading(true);
        try {
            await onSubmit({ ...data, imageURL });
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                <div className="relative group w-24 h-24">
                    {
                        imageUploading ? (
                            <Skeleton className="w-full h-full rounded-full" />
                        ) : (
                            <Avatar className="w-full h-full">
                                <AvatarImage src={imageURL || (user?.photoURL ?? undefined)} alt={`${user?.firstName} ${user?.lastName}`} />
                                <AvatarFallback>{`${user?.firstName[0]} ${user?.lastName[0]}`}</AvatarFallback>
                            </Avatar>
                        )
                    }
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Label htmlFor="profileImage" className="cursor-pointer absolute -end-2 bottom-0 p-2 rounded-full bg-white">
                            <Camera />
                        </Label>
                        <Input
                            id="profileImage"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>
                </div>
                <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Date of Birth</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value ? (
                                                format(field.value, "PPP")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) =>
                                            date > new Date() || date < new Date("1900-01-01")
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                                <Input type="tel" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Updating Profile..." : "Update Profile"}
                </Button>
            </form>
        </Form>
    );
}
